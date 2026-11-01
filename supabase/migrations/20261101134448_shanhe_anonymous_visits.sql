-- Anonymous visit counters are separate from accounts and travel archives.
-- The only public operation accepts two random UUIDs and a three-state enum.
-- Keep shanhe_analytics_private out of Data API exposed schemas.
begin;

create schema shanhe_analytics_private;
revoke all on schema shanhe_analytics_private from public, anon, authenticated, service_role;
-- USAGE permits the invoker wrapper to reach exactly the granted write routine;
-- it does not grant SELECT or CREATE, or access to the existing archive schema.
grant usage on schema shanhe_analytics_private to anon, authenticated;

create table shanhe_analytics_private.visits (
  event_id uuid primary key,
  visitor_id uuid not null,
  visited_at timestamptz not null,
  visited_day date not null,
  status smallint not null check (status in (0, 1, 2)),
  constraint visits_nonzero_ids check (
    event_id <> '00000000-0000-0000-0000-000000000000'::uuid
    and visitor_id <> '00000000-0000-0000-0000-000000000000'::uuid
  )
);
alter table shanhe_analytics_private.visits enable row level security;
revoke all on table shanhe_analytics_private.visits from public, anon, authenticated, service_role;
-- No client read policy: only the database owner can inspect the aggregates.
create index visits_day_visitor_idx on shanhe_analytics_private.visits (visited_day, visitor_id);

create function shanhe_analytics_private.record_visit(
  p_event_id uuid, p_visitor_id uuid, p_status smallint
)
returns void language plpgsql security definer set search_path = '' as $function$
declare
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_day date := (v_now at time zone 'Asia/Shanghai')::date;
  v_headers_text text := nullif(pg_catalog.current_setting('request.headers', true), '');
  v_headers jsonb;
  v_origin text;
begin
  if p_event_id is null or p_visitor_id is null or p_status is null
     or p_event_id = '00000000-0000-0000-0000-000000000000'::uuid
     or p_visitor_id = '00000000-0000-0000-0000-000000000000'::uuid
     or p_status not in (0, 1, 2) then
    raise exception using errcode = '22023', message = 'INVALID_VISIT';
  end if;

  -- Browser-origin filtering is a convenience, not proof of a genuine visitor:
  -- scripts can spoof headers and generate new UUIDs. No IP/UA is retained.
  if v_headers_text is not null then
    begin
      v_headers := v_headers_text::jsonb;
    exception when invalid_text_representation then
      raise exception using errcode = '22023', message = 'INVALID_VISIT_HEADERS';
    end;
    if pg_catalog.jsonb_typeof(v_headers) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'INVALID_VISIT_HEADERS';
    end if;
    v_origin := v_headers ->> 'origin';
    if v_origin is not null and v_origin <> 'https://tanghongliang1024-boop.github.io' then
      raise exception using errcode = '42501', message = 'VISIT_ORIGIN_NOT_ALLOWED';
    end if;
  end if;

  -- Serializes this browser's limit check and insertion. This bounds accidental
  -- reload loops without claiming to provide a bot-proof rate limiter.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('shanhe-visit:' || p_visitor_id::text, 0)
  );

  -- Only an unknown status can be resolved, and only with the matching random
  -- event/browser pair. Retries never move an event to a different Beijing day.
  update shanhe_analytics_private.visits as v
    set status = p_status
    where v.event_id = p_event_id and v.visitor_id = p_visitor_id
      and v.status = 0 and p_status in (1, 2);
  if exists (select 1 from shanhe_analytics_private.visits as v where v.event_id = p_event_id) then
    return;
  end if;

  if (select pg_catalog.count(*) from shanhe_analytics_private.visits as v
      where v.visited_day = v_day and v.visitor_id = p_visitor_id) >= 120 then
    return;
  end if;

  insert into shanhe_analytics_private.visits (event_id, visitor_id, visited_at, visited_day, status)
    values (p_event_id, p_visitor_id, v_now, v_day, p_status)
    on conflict (event_id) do nothing;
end;
$function$;

create function public.shanhe_record_visit(
  p_event_id uuid, p_visitor_id uuid, p_status smallint
)
returns void language sql security invoker set search_path = '' as $function$
  select shanhe_analytics_private.record_visit(p_event_id, p_visitor_id, p_status);
$function$;
revoke all on function shanhe_analytics_private.record_visit(uuid,uuid,smallint)
  from public, anon, authenticated, service_role;
grant execute on function shanhe_analytics_private.record_visit(uuid,uuid,smallint) to anon, authenticated;
revoke all on function public.shanhe_record_visit(uuid,uuid,smallint)
  from public, anon, authenticated, service_role;
grant execute on function public.shanhe_record_visit(uuid,uuid,smallint) to anon, authenticated;

comment on schema shanhe_analytics_private is 'Private anonymous site counters. Never add to Data API exposed schemas. No account identifiers or travel records.';
comment on table shanhe_analytics_private.visits is 'One page-open event per random event UUID; visitor UUID is browser-generated. status: 0 unknown, 1 guest at page opening, 2 signed in at page opening. Owner-only reads; no client RLS policies by design.';
comment on function public.shanhe_record_visit(uuid,uuid,smallint) is 'Write-only anonymous page-visit intake; idempotent event ID, frozen resolved status, Beijing server day, maximum 120 page opens per browser per day. No returned visit data.';
commit;
