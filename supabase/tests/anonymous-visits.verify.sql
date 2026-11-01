-- Optional administrator smoke test after deployment. Run this ENTIRE file,
-- including ROLLBACK, in one SQL-editor request. It generates synthetic random
-- identities, never selects account/travel data, and leaves no analytics rows.
begin;
set local request.headers = '{"origin":"https://tanghongliang1024-boop.github.io"}';
create temporary table shanhe_visit_probe on commit drop as
  select pg_catalog.gen_random_uuid() as event_id, pg_catalog.gen_random_uuid() as visitor_id;
grant select on pg_temp.shanhe_visit_probe to anon;

set local role anon;
select public.shanhe_record_visit(event_id,visitor_id,0::smallint) from pg_temp.shanhe_visit_probe;
select public.shanhe_record_visit(event_id,visitor_id,0::smallint) from pg_temp.shanhe_visit_probe;
select public.shanhe_record_visit(event_id,visitor_id,1::smallint) from pg_temp.shanhe_visit_probe;
select public.shanhe_record_visit(event_id,visitor_id,2::smallint) from pg_temp.shanhe_visit_probe;
reset role;

do $verification$
declare
  v_role text;
  v_privilege text;
begin
  if (select pg_catalog.count(*) from shanhe_analytics_private.visits as v
      join pg_temp.shanhe_visit_probe as p using(event_id,visitor_id)) <> 1 then
    raise exception 'VISIT_VERIFICATION_FAILED: retries changed page-view count';
  end if;
  if not exists (
    select 1 from shanhe_analytics_private.visits as v join pg_temp.shanhe_visit_probe as p using(event_id,visitor_id)
    where v.status=1 and v.visited_day=(v.visited_at at time zone 'Asia/Shanghai')::date
  ) then
    raise exception 'VISIT_VERIFICATION_FAILED: status/day mismatch';
  end if;
  foreach v_role in array array['anon','authenticated','service_role'] loop
    foreach v_privilege in array array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE'] loop
      if pg_catalog.has_table_privilege(v_role,'shanhe_analytics_private.visits',v_privilege) then
        raise exception 'VISIT_VERIFICATION_FAILED: client table privilege';
      end if;
    end loop;
  end loop;
  if not (select c.relrowsecurity from pg_catalog.pg_class as c where c.oid='shanhe_analytics_private.visits'::regclass) then
    raise exception 'VISIT_VERIFICATION_FAILED: RLS missing';
  end if;
end;
$verification$;
select 'anonymous visit smoke test passed; the following ROLLBACK removes the synthetic event' as verification;
rollback;
