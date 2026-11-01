// Runs the real migration in an isolated PostgreSQL engine. No network,
// production visits, credentials, or real browser identities are used.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageDirectory = process.env.PGLITE_PACKAGE_DIR || path.resolve(here, '../../../.sql-test-deps/pglite/package');
const { PGlite } = await import(pathToFileURL(path.join(packageDirectory, 'dist/index.js')).href);
const oldNames = [
  '20261022040802_shanhe_private_archives.sql', '20261022090551_shanhe_world_counties_v2.sql',
  '20261022101828_shanhe_region_levels_v3.sql', '20261028093757_shanhe_landmark_archives.sql',
  '20261028100923_shanhe_family_archives.sql', '20261028104048_shanhe_china_prefectures_v4.sql'
];
const oldMigrations = await Promise.all(oldNames.map(name => readFile(path.join(here, '../migrations', name), 'utf8')));
const migration = await readFile(path.join(here, '../migrations/20261101134448_shanhe_anonymous_visits.sql'), 'utf8');
const ORIGIN = 'https://tanghongliang1024-boop.github.io';
const V1 = '11111111-1111-4111-8111-111111111111', V2 = '22222222-2222-4222-8222-222222222222';
const ZERO = '00000000-0000-0000-0000-000000000000';
const event = n => 'aaaaaaaa-aaaa-4aaa-8aaa-' + String(n).padStart(12, '0');

test('anonymous visits: write-only intake, private counters and accurate idempotent aggregates', async t => {
  const db = new PGlite();
  const query = async (sql, args = []) => (await db.query(sql, args)).rows;
  const record = (id, visitor = V1, status = 0) => query('select public.shanhe_record_visit($1::uuid,$2::uuid,$3::smallint)', [id, visitor, status]);
  const rejected = (promise, code, message) => assert.rejects(promise, error => error.code === code && (!message || error.message.includes(message)));
  async function as(role, headers = {origin: ORIGIN}) {
    await db.exec('reset role');
    await db.query("select set_config('request.headers',$1,false)", [typeof headers === 'string' ? headers : JSON.stringify(headers)]);
    if (role) await db.exec(`set role ${role}`);
  }
  async function reset() {
    await as(null);
    await db.exec('truncate shanhe_analytics_private.visits');
  }
  const visits = () => query('select event_id,visitor_id,visited_at::text,visited_day::text,status from shanhe_analytics_private.visits order by event_id');
  async function originalObjects() {
    return {
      schemas: await query("select nspname,nspacl from pg_namespace where nspname in ('public','shanhe_private','auth') order by nspname"),
      tables: await query("select n.nspname,c.relname,c.relrowsecurity,c.relacl from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','shanhe_private','auth') and c.relkind='r' order by 1,2"),
      functions: await query("select n.nspname,p.proname,pg_get_functiondef(p.oid) as definition,p.proacl from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','shanhe_private','auth') and p.proname <> 'shanhe_record_visit' order by 1,2"),
      policies: await query("select * from pg_policies where schemaname in ('public','shanhe_private','auth') order by schemaname,tablename,policyname"),
      archives: await query('select * from public.shanhe_archives'),
      families: await query('select * from public.shanhe_family_archives'),
      landmarks: await query('select * from public.shanhe_landmark_archives')
    };
  }
  try {
    await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema public,auth to anon,authenticated,service_role;
      alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
      alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;`);
    for (const sql of oldMigrations) await db.exec(sql);
    const before = await originalObjects();
    await db.exec(migration);

    await t.test('migration leaves all existing schemas, functions, data and access rules unchanged', async () => {
      assert.deepEqual(await originalObjects(), before);
      assert.equal((await query("select has_schema_privilege('anon','shanhe_private','USAGE') as permitted"))[0].permitted, false);
      assert.deepEqual((await query("select column_name from information_schema.columns where table_schema='shanhe_analytics_private' and table_name='visits' order by ordinal_position")).map(row=>row.column_name), ['event_id','visitor_id','visited_at','visited_day','status']);
    });

    await t.test('private rows are unreadable and directly unwritable to every API role', async () => {
      assert.equal((await query("select relrowsecurity from pg_class where oid='shanhe_analytics_private.visits'::regclass"))[0].relrowsecurity, true);
      assert.deepEqual(await query("select * from pg_policies where schemaname='shanhe_analytics_private'"), []);
      for (const role of ['anon','authenticated','service_role']) {
        for (const privilege of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) {
          assert.equal((await query("select has_table_privilege($1,'shanhe_analytics_private.visits',$2) as permitted", [role,privilege]))[0].permitted, false, `${role}/${privilege}`);
        }
        await as(role);
        await rejected(visits(), '42501');
        await rejected(db.query('insert into shanhe_analytics_private.visits values ($1,$2,now(),current_date,1)', [event(1),V1]), '42501');
        await rejected(db.query('update shanhe_analytics_private.visits set status=1'), '42501');
        await rejected(db.query('delete from shanhe_analytics_private.visits'), '42501');
        await as(null);
      }
    });

    await t.test('public wrapper is invoker, only private writer is definer, both have empty search_path', async () => {
      for (const [name,definer] of [['public.shanhe_record_visit',false],['shanhe_analytics_private.record_visit',true]]) {
        const signature = `${name}(uuid,uuid,smallint)`;
        const fn = (await query('select prosecdef,proconfig,prorettype::regtype::text as result from pg_proc where oid=$1::regprocedure', [signature]))[0];
        assert.equal(fn.prosecdef,definer);assert.deepEqual(fn.proconfig,['search_path=""']);assert.equal(fn.result,'void');
        for (const role of ['anon','authenticated','service_role']) {
          assert.equal((await query("select has_function_privilege($1,$2,'EXECUTE') as permitted", [role,signature]))[0].permitted,role!=='service_role');
        }
      }
    });

    await t.test('anonymous and signed-in API roles can submit without persisting an account identity', async () => {
      await reset();await as('anon');await record(event(1));
      await as('authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[V2]);await record(event(2),V2,2);
      await as(null);const saved=await visits();
      assert.equal(saved.length,2);assert.equal(saved[0].status,0);assert.equal(saved[1].status,2);
      assert.equal((await query("select bool_and(visited_day = (visited_at at time zone 'Asia/Shanghai')::date) as valid from shanhe_analytics_private.visits"))[0].valid,true);
    });

    await t.test('retry and out-of-order requests never duplicate PV or overwrite the first resolved status', async () => {
      await reset();await as('anon');await record(event(1));await record(event(1));
      await as(null);const initial=(await visits())[0];
      await as('anon');await record(event(1),V1,1);await record(event(1),V1,2);await record(event(1));await record(event(1),V1,1);
      await record(event(2),V1,2);await record(event(2),V1,0);await record(event(2),V1,1);
      await as(null);const saved=await visits();
      assert.equal(saved.length,2);assert.equal(saved[0].status,1);assert.equal(saved[1].status,2);
      assert.equal(saved[0].visited_at,initial.visited_at);assert.equal(saved[0].visited_day,initial.visited_day);
    });

    await t.test('an event collision with another visitor cannot relabel or take over its row', async () => {
      await reset();await as('anon');await record(event(1),V1,0);await record(event(1),V2,1);
      await as(null);assert.equal((await visits())[0].status,0);assert.equal((await visits())[0].visitor_id,V1);
      await as('anon');await record(event(1),V1,2);await as(null);assert.equal((await visits())[0].status,2);
    });

    await t.test('delayed resolution after midnight preserves the original server timestamp and Beijing day', async () => {
      await reset();await as(null);
      await db.query("insert into shanhe_analytics_private.visits values ($1,$2,'2026-10-31T15:59:59.999Z','2026-10-31',0)", [event(1),V1]);
      await as('anon');await record(event(1),V1,1);await as(null);
      const saved=(await visits())[0];assert.equal(saved.visited_day,'2026-10-31');assert.equal(saved.status,1);
      assert.equal(new Date(saved.visited_at).toISOString(),'2026-10-31T15:59:59.999Z');
      const boundary=await query("select (ts at time zone 'Asia/Shanghai')::date::text as day from (values ('2026-10-31T15:59:59.999Z'::timestamptz),('2026-10-31T16:00:00Z'::timestamptz)) as t(ts)");
      assert.deepEqual(boundary.map(x=>x.day),['2026-10-31','2026-11-01']);
    });

    await t.test('invalid inputs and nonproduction origins create no rows', async () => {
      await reset();await as('anon');
      for (const args of [[null,V1,0],[event(1),null,0],[event(1),V1,null],[ZERO,V1,1],[event(1),ZERO,1],[event(1),V1,-1],[event(1),V1,3]]) await rejected(record(...args),'22023','INVALID_VISIT');
      await rejected(record('invalid UUID',V1,1),'22P02');
      for (const origin of ['http://127.0.0.1:5173','https://evil.example',ORIGIN+'.evil.example','null']) {
        await as('anon',{origin});await rejected(record(event(1),V1,1),'42501','VISIT_ORIGIN_NOT_ALLOWED');
      }
      for (const headers of ['not json','[]','null']) {await as('anon',headers);await rejected(record(event(1),V1,1),'22023','INVALID_VISIT_HEADERS');}
      await as(null);assert.deepEqual(await visits(),[]);
      // A direct administrator SQL test has no HTTP headers; there is no claim
      // that this filter authenticates a non-browser client or blocks all bots.
      await as('anon','');await record(event(1),V1,1);await as(null);assert.equal((await visits()).length,1);
    });

    await t.test('120-view daily bound counts unique events and still allows classification and other visitors', async () => {
      await reset();await as('anon');
      for(let n=1;n<=122;n++)await record(event(n),V1,n===1?0:1);
      await record(event(1),V1,2);await record(event(120),V1,1);await record(event(123),V2,1);
      await as(null);const saved=await visits();assert.equal(saved.length,121);
      assert.equal(saved.filter(x=>x.visitor_id===V1).length,120);assert.equal(saved[0].status,2);
      assert.equal(saved.some(x=>x.event_id===event(121)),false);
      await db.exec("update shanhe_analytics_private.visits set visited_day=visited_day-1,visited_at=visited_at-interval '1 day' where visitor_id='"+V1+"'");
      await as('anon');await record(event(124),V1,1);await as(null);assert.equal((await visits()).length,122);
    });

    await t.test('daily and total aggregates deduplicate browsers while keeping unknown status explicit', async () => {
      await reset();await as('anon');
      await record(event(1),V1,0);await record(event(1),V1,1);await record(event(2),V1,1);await record(event(3),V2,2);await record(event(4),'33333333-3333-4333-8333-333333333333',0);
      await as(null);
      const totals=(await query(`select count(*)::int as pageviews,count(distinct visitor_id)::int as visitors,
        count(*) filter(where status=1)::int as guest_pageviews,count(distinct visitor_id) filter(where status=1)::int as guest_visitors,
        count(*) filter(where status=2)::int as signed_pageviews,count(distinct visitor_id) filter(where status=2)::int as signed_visitors,
        count(*) filter(where status=0)::int as unknown_pageviews
        from shanhe_analytics_private.visits`))[0];
      assert.deepEqual(totals,{pageviews:4,visitors:3,guest_pageviews:2,guest_visitors:1,signed_pageviews:1,signed_visitors:1,unknown_pageviews:1});
    });
    await t.test('administrator smoke-test SQL exercises actual anon role and rolls every probe row back', async () => {
      await as(null);const original=await visits();
      await db.exec(await readFile(path.join(here,'anonymous-visits.verify.sql'),'utf8'));
      assert.deepEqual(await visits(),original);
      assert.equal((await query("select to_regclass('pg_temp.shanhe_visit_probe') as probe"))[0].probe,null);
    });
  } finally {await db.close();}
});
