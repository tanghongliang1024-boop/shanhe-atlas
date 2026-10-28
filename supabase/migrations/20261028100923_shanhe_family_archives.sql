-- Family members supplement, never migrate or replace, the original account's
-- regional and landmark archives. Only child records live in this document.
begin;

create table public.shanhe_family_archives (
  user_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null,
  revision bigint not null check (revision between 1 and 9007199254740991),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint shanhe_family_archives_object check (pg_catalog.jsonb_typeof(document) = 'object'),
  constraint shanhe_family_archives_size check (pg_catalog.octet_length(document::text) <= 16777216)
);
alter table public.shanhe_family_archives enable row level security;
revoke all on table public.shanhe_family_archives from public, anon, authenticated, service_role;
grant select on table public.shanhe_family_archives to authenticated;
create policy shanhe_family_archives_select_own on public.shanhe_family_archives
  for select to authenticated using ((select auth.uid()) = user_id);

-- Called inside the locked ON CONFLICT update, after the revision condition.
-- Removing visits is supported; deleting an entire member needs a separate,
-- explicit future protocol and cannot silently discard that child's archive.
create function shanhe_private.shanhe_family_preserve_members(p_previous jsonb, p_next jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $function$
begin
  if exists (
    select 1 from pg_catalog.jsonb_array_elements(p_previous -> 'members') as old_member(value)
    where not exists (
      select 1 from pg_catalog.jsonb_array_elements(p_next -> 'members') as new_member(value)
      where new_member.value ->> 'id' = old_member.value ->> 'id'
    )
  ) then
    raise exception using errcode = '22023', message = 'MEMBER_REMOVAL_UNSUPPORTED';
  end if;
  return p_next;
end;
$function$;
revoke all on function shanhe_private.shanhe_family_preserve_members(jsonb,jsonb)
  from public, anon, authenticated, service_role;

create function shanhe_private.shanhe_save_family_archive(p_document jsonb, p_expected_revision bigint)
returns jsonb language plpgsql security definer set search_path = '' as $function$
declare
  v_owner uuid := auth.uid();
  v_member jsonb;
  v_id text;
  v_name text;
  v_color text;
  v_ids text[] := array[]::text[];
  v_names text[] := array[]::text[];
  v_colors text[] := array[]::text[];
  v_kind text;
  v_records jsonb;
  v_place text;
  v_record jsonb;
  v_date text;
  v_timestamp text;
  v_parts text[];
  v_offset text;
  v_day date;
  v_saved_document jsonb;
  v_saved_revision bigint;
begin
  if v_owner is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;
  if p_expected_revision is null or p_expected_revision < 0
     or p_expected_revision >= 9007199254740991 then
    raise exception using errcode = '22023', message = 'INVALID_REVISION';
  end if;

  if pg_catalog.jsonb_typeof(p_document) is distinct from 'object'
     or pg_catalog.octet_length(p_document::text) > 16777216 then
    raise exception using errcode = '22023', message = 'INVALID_DOCUMENT';
  end if;
  if p_document -> 'version' is distinct from '1'::jsonb
     or pg_catalog.jsonb_typeof(p_document -> 'members') is distinct from 'array'
     or pg_catalog.jsonb_typeof(p_document -> 'regions') is distinct from 'object'
     or pg_catalog.jsonb_typeof(p_document -> 'landmarks') is distinct from 'object'
     or exists (select 1 from pg_catalog.jsonb_object_keys(p_document) as field(name)
                where field.name not in ('version', 'members', 'regions', 'landmarks')) then
    raise exception using errcode = '22023', message = 'INVALID_DOCUMENT';
  end if;
  if pg_catalog.jsonb_array_length(p_document -> 'members') not between 1 and 4
     or p_document -> 'members' -> 0 ->> 'id' is distinct from 'self' then
    raise exception using errcode = '22023', message = 'INVALID_DOCUMENT';
  end if;

  for v_member in select value from pg_catalog.jsonb_array_elements(p_document -> 'members')
  loop
    if pg_catalog.jsonb_typeof(v_member) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'INVALID_DOCUMENT';
    end if;
    if pg_catalog.jsonb_typeof(v_member -> 'id') is distinct from 'string'
       or pg_catalog.jsonb_typeof(v_member -> 'name') is distinct from 'string'
       or pg_catalog.jsonb_typeof(v_member -> 'color') is distinct from 'string'
       or exists (select 1 from pg_catalog.jsonb_object_keys(v_member) as field(name)
                  where field.name not in ('id', 'name', 'color')) then
      raise exception using errcode = '22023', message = 'INVALID_DOCUMENT';
    end if;
    v_id := v_member ->> 'id';
    v_name := v_member ->> 'name';
    v_color := v_member ->> 'color';
    if (v_id <> 'self' and v_id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$')
       or v_id = any(v_ids) or pg_catalog.lower(v_name) = any(v_names)
       or v_color = any(v_colors) or v_color not in ('terracotta', 'blue', 'purple', 'gold')
       or v_name = '' or pg_catalog.char_length(v_name) > 12
       -- Match the browser's trim() whitespace set, including NBSP and BOM.
       or v_name ~ U&'^[\0009-\000D\0020\00A0\1680\2000-\200A\2028\2029\202F\205F\3000\FEFF]|[\0009-\000D\0020\00A0\1680\2000-\200A\2028\2029\202F\205F\3000\FEFF]$'
       or v_name ~ U&'[\0001-\001F\007F]' then
      raise exception using errcode = '22023', message = 'INVALID_DOCUMENT';
    end if;
    if (select coalesce(pg_catalog.sum(case when pg_catalog.ascii(character.value) > 65535 then 2 else 1 end), 0)
        from pg_catalog.regexp_split_to_table(v_name, '') as character(value)) > 12 then
      raise exception using errcode = '22023', message = 'INVALID_DOCUMENT';
    end if;
    v_ids := pg_catalog.array_append(v_ids, v_id);
    v_names := pg_catalog.array_append(v_names, pg_catalog.lower(v_name));
    v_colors := pg_catalog.array_append(v_colors, v_color);
  end loop;

  foreach v_kind in array array['regions', 'landmarks'] loop
    -- An explicit empty map for every child prevents omitted/stale child data
    -- from being confused with intentionally deleted visits. self stays outside.
    if (select pg_catalog.count(*) from pg_catalog.jsonb_object_keys(p_document -> v_kind))
       <> pg_catalog.cardinality(v_ids) - 1 then
      raise exception using errcode = '22023', message = 'INVALID_DOCUMENT';
    end if;
    for v_id, v_records in select key, value from pg_catalog.jsonb_each(p_document -> v_kind)
    loop
      if v_id = 'self' or not (v_id = any(v_ids))
         or pg_catalog.jsonb_typeof(v_records) is distinct from 'object' then
        raise exception using errcode = '22023', message = 'INVALID_DOCUMENT';
      end if;
      if (select pg_catalog.count(*) from pg_catalog.jsonb_object_keys(v_records)) > 10000 then
        raise exception using errcode = '22023', message = 'INVALID_RECORDS';
      end if;
      for v_place, v_record in select key, value from pg_catalog.jsonb_each(v_records)
      loop
        if pg_catalog.jsonb_typeof(v_record) is distinct from 'object'
           or (v_kind = 'regions' and v_place !~ '^(?:[0-9]{6}|tw-(?:[0-9]{5}|[0-9]{8})|world:[A-Z]{3}(?::[A-Za-z0-9][A-Za-z0-9._-]{0,63})?)$')
           or (v_kind = 'landmarks' and v_place !~ '^poi:[A-Z]{3}:[a-z0-9][a-z0-9-]{0,63}$') then
          raise exception using errcode = '22023', message = 'INVALID_RECORDS';
        end if;
        if exists (select 1 from pg_catalog.jsonb_object_keys(v_record) as field(name)
          where field.name not in ('date', 'note', 'updatedAt')
            and field.name <> case when v_kind = 'regions' then 'visited' else 'status' end)
           or (v_kind = 'regions' and v_record -> 'visited' is distinct from 'true'::jsonb)
           or (v_kind = 'landmarks' and (pg_catalog.jsonb_typeof(v_record -> 'status') is distinct from 'string'
                                       or v_record ->> 'status' not in ('visited', 'wish')))
           or pg_catalog.jsonb_typeof(v_record -> 'date') is distinct from 'string'
           or pg_catalog.jsonb_typeof(v_record -> 'note') is distinct from 'string'
           or pg_catalog.char_length(v_record ->> 'note') > 600 then
          raise exception using errcode = '22023', message = 'INVALID_RECORDS';
        end if;
        if (select coalesce(pg_catalog.sum(case when pg_catalog.ascii(character.value) > 65535 then 2 else 1 end), 0)
            from pg_catalog.regexp_split_to_table(v_record ->> 'note', '') as character(value)) > 600 then
          raise exception using errcode = '22023', message = 'INVALID_RECORDS';
        end if;
        v_date := v_record ->> 'date';
        if v_date <> '' then
          if v_date !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or pg_catalog.substring(v_date, 1, 4) = '0000' then
            raise exception using errcode = '22023', message = 'INVALID_RECORDS';
          end if;
          begin
            v_day := v_date::date;
          exception when invalid_datetime_format or datetime_field_overflow then
            raise exception using errcode = '22023', message = 'INVALID_RECORDS';
          end;
        end if;
        if v_kind = 'landmarks' or v_record ? 'updatedAt' then
          if pg_catalog.jsonb_typeof(v_record -> 'updatedAt') is distinct from 'string' then
            raise exception using errcode = '22023', message = 'INVALID_RECORDS';
          end if;
          v_timestamp := v_record ->> 'updatedAt';
          v_parts := pg_catalog.regexp_match(v_timestamp,
            '^([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]{1,9})?(Z|[+-][0-9]{2}:[0-9]{2})$');
          if v_parts is null or pg_catalog.substring(v_parts[1], 1, 4) = '0000'
             or v_parts[2]::integer > 23 or v_parts[3]::integer > 59 or v_parts[4]::integer > 59 then
            raise exception using errcode = '22023', message = 'INVALID_RECORDS';
          end if;
          v_offset := v_parts[5];
          if v_offset <> 'Z' and (pg_catalog.substring(v_offset, 2, 2)::integer > 14
             or pg_catalog.substring(v_offset, 5, 2)::integer > 59
             or (pg_catalog.substring(v_offset, 2, 2)::integer = 14 and pg_catalog.substring(v_offset, 5, 2)::integer <> 0)) then
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
    end loop;
  end loop;

  insert into public.shanhe_family_archives as archive (user_id, document, revision, updated_at)
    values (v_owner, p_document, 1, pg_catalog.now())
  on conflict (user_id) do update
    set document = shanhe_private.shanhe_family_preserve_members(archive.document, excluded.document),
        revision = archive.revision + 1, updated_at = pg_catalog.now()
    where archive.revision = p_expected_revision
  returning archive.document, archive.revision into v_saved_document, v_saved_revision;
  if not found or v_saved_revision <> p_expected_revision + 1 then
    raise exception using errcode = '40001', message = 'REVISION_CONFLICT';
  end if;
  return pg_catalog.jsonb_build_object('document', v_saved_document, 'revision', v_saved_revision);
end;
$function$;

create function public.shanhe_save_family_archive(p_document jsonb, p_expected_revision bigint)
returns jsonb language sql security invoker set search_path = '' as $function$
  select shanhe_private.shanhe_save_family_archive(p_document, p_expected_revision);
$function$;
revoke all on function shanhe_private.shanhe_save_family_archive(jsonb,bigint)
  from public, anon, authenticated, service_role;
grant execute on function shanhe_private.shanhe_save_family_archive(jsonb,bigint) to authenticated;
revoke all on function public.shanhe_save_family_archive(jsonb,bigint)
  from public, anon, authenticated, service_role;
grant execute on function public.shanhe_save_family_archive(jsonb,bigint) to authenticated;

comment on table public.shanhe_family_archives is 'Owner-only family member metadata and child travel records; self records remain in the existing regional and landmark archives.';
comment on function public.shanhe_save_family_archive(jsonb,bigint) is 'Validated owner-only compare-and-swap family archive save. Keeps existing members; accepts visited-record removals.';
commit;
