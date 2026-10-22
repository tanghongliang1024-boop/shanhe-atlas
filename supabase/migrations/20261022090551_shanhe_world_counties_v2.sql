-- Reviewed v2 archive protocol; keeps owner-only RLS and atomic revision checks.
-- Apply before deploying v2 clients. Legacy saves are rejected to prevent an
-- Android 1.0 / cached page from erasing counties and world regions it cannot see.
begin;
alter table public.shanhe_archives drop constraint shanhe_archives_size;
alter table public.shanhe_archives add constraint shanhe_archives_size check (pg_catalog.octet_length(records::text) <= 16777216);

create table shanhe_private.region_migration_backups (
  migration_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  records jsonb not null,
  source_revision bigint not null,
  source_updated_at timestamptz not null,
  report jsonb not null default '{}'::jsonb,
  backed_up_at timestamptz not null default pg_catalog.now(),
  primary key (migration_id, user_id)
);
alter table shanhe_private.region_migration_backups enable row level security;
revoke all on table shanhe_private.region_migration_backups from public, anon, authenticated, service_role;
comment on table shanhe_private.region_migration_backups is 'Immutable pre-migration user archives; private schema, no client privileges. Restore only after checking current revision.';

create function shanhe_private.shanhe_save_archive_v2(
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
  v_city text;
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

  for v_city, v_record in
    select item.key, item.value from pg_catalog.jsonb_each(p_records) as item
  loop
    -- 710000 remains valid so existing whole-Taiwan records can be imported.
    if v_city !~ '^(?:[0-9]{6}|tw-(?:[0-9]{5}|[0-9]{8})|world:[A-Z]{3}(?::[A-Za-z0-9][A-Za-z0-9._-]{0,63})?)$'
       or pg_catalog.jsonb_typeof(v_record) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'INVALID_RECORDS';
    end if;
    if exists (
      select 1 from pg_catalog.jsonb_object_keys(v_record) as field(name)
      where field.name not in ('visited', 'date', 'note', 'updatedAt')
    ) then
      raise exception using errcode = '22023', message = 'INVALID_RECORDS';
    end if;
    if (v_record -> 'visited') is distinct from 'true'::jsonb
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
  insert into public.shanhe_archives as archive
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

create function public.shanhe_save_archive_v2(p_records jsonb, p_expected_revision bigint)
returns jsonb language sql security invoker set search_path = '' as $function$
  select shanhe_private.shanhe_save_archive_v2(p_records, p_expected_revision);
$function$;
revoke all on function shanhe_private.shanhe_save_archive_v2(jsonb,bigint) from public, anon, authenticated, service_role;
grant execute on function shanhe_private.shanhe_save_archive_v2(jsonb,bigint) to authenticated;
revoke all on function public.shanhe_save_archive_v2(jsonb,bigint) from public, anon, authenticated, service_role;
grant execute on function public.shanhe_save_archive_v2(jsonb,bigint) to authenticated;

create or replace function public.shanhe_save_archive(p_records jsonb, p_expected_revision bigint)
returns jsonb language plpgsql security invoker set search_path = '' as $function$
begin
  raise exception using errcode = '22023', message = 'CLIENT_UPDATE_REQUIRED';
end;
$function$;
revoke all on function shanhe_private.shanhe_save_archive(jsonb,bigint) from public, anon, authenticated, service_role;

-- This routine is an administrator-only, one-shot migration aid. It is not a
-- Data API endpoint, does not use SECURITY DEFINER, and grants no client access.
create function shanhe_private.migrate_region_records(p_manifest jsonb, p_migration_id text)
returns jsonb language plpgsql security invoker set search_path = '' as $function$
declare
  v_archive record;
  v_mapping record;
  v_records jsonb;
  v_changes jsonb;
  v_conflicts jsonb;
  v_target text;
  v_changed integer := 0;
  v_moved integer := 0;
  v_conflict_count integer := 0;
begin
  if p_migration_id is null or p_migration_id !~ '^[a-zA-Z0-9._-]{1,80}$'
     or p_manifest->'version' is distinct from '1'::jsonb
     or pg_catalog.jsonb_typeof(p_manifest->'mappings') is distinct from 'object' then
    raise exception using errcode='22023', message='INVALID_MIGRATION';
  end if;
  for v_mapping in select key, value from pg_catalog.jsonb_each(p_manifest->'mappings') loop
    if v_mapping.value->'verified' is distinct from 'true'::jsonb then continue; end if;
    v_target := v_mapping.value->>'targetId';
    if v_mapping.key !~ '^(?:[0-9]{6}|tw-(?:[0-9]{5}|[0-9]{8}))$'
       or v_target is null or v_target !~ '^(?:[0-9]{6}|tw-(?:[0-9]{5}|[0-9]{8}))$'
       or (v_mapping.value->>'source') is null or (v_mapping.value->>'source') !~ '^https://[^[:space:]]+$'
       or (v_target <> v_mapping.key and (p_manifest->'mappings'->v_target->'verified')='true'::jsonb
           and (p_manifest->'mappings'->v_target->>'targetId') is distinct from v_target) then
      raise exception using errcode='22023', message='INVALID_MIGRATION';
    end if;
  end loop;
  for v_archive in select * from public.shanhe_archives order by user_id for update loop
    -- A replay never restores an old city after the user deliberately edits or
    -- removes its migrated county; the immutable backup marks this archive done.
    if exists(select 1 from shanhe_private.region_migration_backups where migration_id=p_migration_id and user_id=v_archive.user_id) then continue; end if;
    v_records := v_archive.records; v_changes := '[]'::jsonb; v_conflicts := '[]'::jsonb;
    for v_mapping in select key,value from pg_catalog.jsonb_each(p_manifest->'mappings') order by key loop
      if v_mapping.value->'verified' is distinct from 'true'::jsonb then continue; end if;
      v_target := v_mapping.value->>'targetId';
      if v_target=v_mapping.key or not(v_records ? v_mapping.key) then continue; end if;
      if v_records ? v_target then
        v_conflicts := v_conflicts || pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('from',v_mapping.key,'to',v_target));
        v_conflict_count := v_conflict_count + 1;
      else
        v_records := pg_catalog.jsonb_set(v_records, array[v_target], v_records->v_mapping.key, true) - v_mapping.key;
        v_changes := v_changes || pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('from',v_mapping.key,'to',v_target));
        v_moved := v_moved + 1;
      end if;
    end loop;
    insert into shanhe_private.region_migration_backups(migration_id,user_id,records,source_revision,source_updated_at,report)
      values(p_migration_id,v_archive.user_id,v_archive.records,v_archive.revision,v_archive.updated_at,
        pg_catalog.jsonb_build_object('changes',v_changes,'conflicts',v_conflicts,'mapping',p_manifest));
    if v_records is distinct from v_archive.records then
      update public.shanhe_archives set records=v_records,revision=revision+1,updated_at=pg_catalog.now() where user_id=v_archive.user_id;
      v_changed := v_changed + 1;
    end if;
  end loop;
  return pg_catalog.jsonb_build_object('changed_archives',v_changed,'moved_records',v_moved,'conflicts',v_conflict_count);
end;
$function$;
revoke all on function shanhe_private.migrate_region_records(jsonb,text) from public, anon, authenticated, service_role;
commit;
