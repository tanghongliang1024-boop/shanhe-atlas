-- Restore Taiwan county/city and Hong Kong/Macao whole-region record levels.
-- The save implementation remains unchanged: owner auth.uid(), validation,
-- fixed search_path and compare-and-swap revision checks are retained.
begin;
alter function shanhe_private.shanhe_save_archive_v2(jsonb,bigint)
  rename to shanhe_save_archive_v3;

create function public.shanhe_save_archive_v3(p_records jsonb, p_expected_revision bigint)
returns jsonb language sql security invoker set search_path = '' as $function$
  select shanhe_private.shanhe_save_archive_v3(p_records, p_expected_revision);
$function$;
revoke all on function shanhe_private.shanhe_save_archive_v3(jsonb,bigint) from public, anon, authenticated, service_role;
grant execute on function shanhe_private.shanhe_save_archive_v3(jsonb,bigint) to authenticated;
revoke all on function public.shanhe_save_archive_v3(jsonb,bigint) from public, anon, authenticated, service_role;
grant execute on function public.shanhe_save_archive_v3(jsonb,bigint) to authenticated;

-- Published Android 2.0 and cached v2 pages would re-expand restored Taiwan
-- records. They must upgrade before writing, even with a current revision.
create or replace function public.shanhe_save_archive_v2(p_records jsonb, p_expected_revision bigint)
returns jsonb language plpgsql security invoker set search_path = '' as $function$
begin
  raise exception using errcode = '22023', message = 'CLIENT_UPDATE_REQUIRED';
end;
$function$;
revoke all on function public.shanhe_save_archive_v2(jsonb,bigint) from public, anon, authenticated, service_role;
grant execute on function public.shanhe_save_archive_v2(jsonb,bigint) to authenticated;
commit;
