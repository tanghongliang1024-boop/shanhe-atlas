-- Shanhe Atlas: independent global landmark visits and wishlist per user.
-- Review and run only in the Supabase project chosen by the site owner.
-- Additive migration only: existing county/city records, schema and RPCs stay unchanged.
begin;

-- Keep this schema out of Supabase Data API "Exposed schemas". Authenticated
-- needs USAGE only so the invoker wrapper can call the one granted routine.
-- No caller can create objects here, and anon/PUBLIC cannot use the schema.
-- Reuse the existing private schema without altering its privileges.

create table public.shanhe_landmark_archives (
  user_id uuid primary key references auth.users (id) on delete cascade,
  records jsonb not null default '{}'::jsonb,
  revision bigint not null check (revision between 1 and 9007199254740991),
  updated_at timestamp with time zone not null default pg_catalog.now(),
  constraint shanhe_landmark_archives_object check (pg_catalog.jsonb_typeof(records) = 'object'),
  constraint shanhe_landmark_archives_size check (pg_catalog.octet_length(records::text) <= 16777216)
);

alter table public.shanhe_landmark_archives enable row level security;

-- Table writes are available only through the validating, atomic RPC below.
-- Revoke PUBLIC too, because an inherited PUBLIC grant would defeat a role revoke.
revoke all on table public.shanhe_landmark_archives from public, anon, authenticated, service_role;
grant select on table public.shanhe_landmark_archives to authenticated;

create policy shanhe_landmark_archives_read_own
  on public.shanhe_landmark_archives
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create function shanhe_private.shanhe_save_landmark_archive(
  p_records jsonb,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_owner uuid := auth.uid();
  v_landmark text;
  v_record jsonb;
  v_date text;
  v_timestamp text;
  v_parts text[];
  v_offset text;
  v_day date;
  v_saved_records jsonb;
  v_saved_revision bigint;
begin
  -- Never accept the archive owner from request parameters.
  if v_owner is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;

  if p_expected_revision is null
     or p_expected_revision < 0
     or p_expected_revision >= 9007199254740991 then
    raise exception using errcode = '22023', message = 'INVALID_REVISION';
  end if;

  if pg_catalog.jsonb_typeof(p_records) is distinct from 'object'
     or pg_catalog.octet_length(p_records::text) > 16777216 then
    raise exception using errcode = '22023', message = 'INVALID_RECORDS';
  end if;
  if (select pg_catalog.count(*) from pg_catalog.jsonb_object_keys(p_records)) > 10000 then
    raise exception using errcode = '22023', message = 'INVALID_RECORDS';
  end if;

  for v_landmark, v_record in
    select item.key, item.value from pg_catalog.jsonb_each(p_records) as item
  loop
    -- Stable global landmark IDs are separate from all regional records.
    if v_landmark !~ '^poi:[A-Z]{3}:[a-z0-9][a-z0-9-]{0,63}$'
       or pg_catalog.jsonb_typeof(v_record) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'INVALID_RECORDS';
    end if;
    if exists (
      select 1 from pg_catalog.jsonb_object_keys(v_record) as field(name)
      where field.name not in ('status', 'date', 'note', 'updatedAt')
    ) then
      raise exception using errcode = '22023', message = 'INVALID_RECORDS';
    end if;
    if pg_catalog.jsonb_typeof(v_record -> 'status') is distinct from 'string'
       or (v_record ->> 'status') not in ('visited', 'wish')
       or pg_catalog.jsonb_typeof(v_record -> 'updatedAt') is distinct from 'string'
       or pg_catalog.jsonb_typeof(v_record -> 'date') is distinct from 'string'
       or pg_catalog.jsonb_typeof(v_record -> 'note') is distinct from 'string'
       or pg_catalog.char_length(v_record ->> 'note') > 600 then
      raise exception using errcode = '22023', message = 'INVALID_RECORDS';
    end if;
    -- Match JavaScript's String.length / textarea maxlength as well as the
    -- character limit. A supplementary Unicode character occupies two UTF-16
    -- units; accepting a longer value here would make the browser reject a read.
    if (
      select coalesce(pg_catalog.sum(
        case when pg_catalog.ascii(character.value) > 65535 then 2 else 1 end
      ), 0)
      from pg_catalog.regexp_split_to_table(v_record ->> 'note', '') as character(value)
    ) > 600 then
      raise exception using errcode = '22023', message = 'INVALID_RECORDS';
    end if;

    v_date := v_record ->> 'date';
    if v_date <> '' then
      if v_date !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
         or pg_catalog.substring(v_date, 1, 4) = '0000' then
        raise exception using errcode = '22023', message = 'INVALID_RECORDS';
      end if;
      -- PostgreSQL's date input rejects impossible days instead of normalizing.
      begin
        v_day := v_date::date;
      exception when invalid_datetime_format or datetime_field_overflow then
        raise exception using errcode = '22023', message = 'INVALID_RECORDS';
      end;
    end if;

    if v_record ? 'updatedAt' then
      if pg_catalog.jsonb_typeof(v_record -> 'updatedAt') is distinct from 'string' then
        raise exception using errcode = '22023', message = 'INVALID_RECORDS';
      end if;
      v_timestamp := v_record ->> 'updatedAt';
      v_parts := pg_catalog.regexp_match(
        v_timestamp,
        '^([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]{1,9})?(Z|[+-][0-9]{2}:[0-9]{2})$'
      );
      if v_parts is null
         or pg_catalog.substring(v_parts[1], 1, 4) = '0000'
         or v_parts[2]::integer > 23
         or v_parts[3]::integer > 59
         or v_parts[4]::integer > 59 then
        raise exception using errcode = '22023', message = 'INVALID_RECORDS';
      end if;
      v_offset := v_parts[5];
      if v_offset <> 'Z' and (
        pg_catalog.substring(v_offset, 2, 2)::integer > 14
        or pg_catalog.substring(v_offset, 5, 2)::integer > 59
        or (pg_catalog.substring(v_offset, 2, 2)::integer = 14
            and pg_catalog.substring(v_offset, 5, 2)::integer <> 0)
      ) then
        raise exception using errcode = '22023', message = 'INVALID_RECORDS';
      end if;
      begin
        v_day := v_parts[1]::date;
        perform v_timestamp::timestamp with time zone;
      exception when invalid_datetime_format or datetime_field_overflow then
        raise exception using errcode = '22023', message = 'INVALID_RECORDS';
      end;
    end if;
  end loop;

  -- The unique user_id and ON CONFLICT row lock serialize competing saves.
  -- A stale revision updates no row, including simultaneous first saves.
  insert into public.shanhe_landmark_archives as archive
    (user_id, records, revision, updated_at)
  values
    (v_owner, p_records, 1, pg_catalog.now())
  on conflict (user_id) do update
    set records = excluded.records,
        revision = archive.revision + 1,
        updated_at = pg_catalog.now()
    where archive.revision = p_expected_revision
  returning archive.records, archive.revision
  into v_saved_records, v_saved_revision;

  -- A new archive is always revision 1 and only accepts expected revision 0.
  -- Raising here rolls back the entire RPC, including an attempted new insert.
  if not found or v_saved_revision <> p_expected_revision + 1 then
    raise exception using errcode = '40001', message = 'REVISION_CONFLICT';
  end if;

  return pg_catalog.jsonb_build_object('records', v_saved_records, 'revision', v_saved_revision);
end;
$function$;

-- The only exposed RPC runs with the caller's privileges. Its privileged
-- implementation is in a schema that must never be added to Data API exposure.
create function public.shanhe_save_landmark_archive(
  p_records jsonb,
  p_expected_revision bigint
)
returns jsonb
language sql
security invoker
set search_path = ''
as $function$
  select shanhe_private.shanhe_save_landmark_archive(p_records, p_expected_revision);
$function$;

-- Supabase may have default direct grants in addition to the PostgreSQL PUBLIC
-- grant. Revoke each applicable role on BOTH functions. The authenticated grant
-- on the private routine is necessary for the invoker wrapper; the internal
-- routine also enforces auth.uid() ownership and all validation itself.
revoke all on function shanhe_private.shanhe_save_landmark_archive(jsonb, bigint) from public, anon, authenticated, service_role;
grant execute on function shanhe_private.shanhe_save_landmark_archive(jsonb, bigint) to authenticated;
revoke all on function public.shanhe_save_landmark_archive(jsonb, bigint) from public, anon, authenticated, service_role;
grant execute on function public.shanhe_save_landmark_archive(jsonb, bigint) to authenticated;

comment on table public.shanhe_landmark_archives is
  'Private Shanhe Atlas archives. Read via owner-only RLS; save via shanhe_save_landmark_archive CAS RPC.';
comment on function shanhe_private.shanhe_save_landmark_archive(jsonb, bigint) is
  'Internal privileged CAS implementation. auth.uid() is the sole owner source; never expose this schema to the Data API.';
comment on function public.shanhe_save_landmark_archive(jsonb, bigint) is
  'Invoker-only RPC wrapper. Save only auth.uid() archive. Conflict: 40001 / REVISION_CONFLICT. No automatic overwrite.';

commit;
