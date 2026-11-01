'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createAnalytics,VISITOR_KEY,OPT_OUT_KEY}=require('../visitor-analytics.js');
const tick=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const uuid=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const ok=()=>({ok:true,status:204});
function harness(overrides={}){
  const values=new Map(),calls=[],jobs=new Map(),nodes=new Map();let timer=0,random=0;
  const schedule=(fn,delay)=>{const id=++timer;jobs.set(id,{fn,delay});return id;};
  const cancel=id=>jobs.delete(id);
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  const element=id=>{if(!nodes.has(id))nodes.set(id,{id,hidden:false,checked:false,disabled:false,textContent:'',open:false,addEventListener(){},showModal(){this.open=true;},close(){this.open=false;}});return nodes.get(id);};
  ['analytics-info-button','analytics-dialog','analytics-enabled','analytics-status','close-analytics'].forEach(element);
  const options={location:{origin:'https://tanghongliang1024-boop.github.io',pathname:'/shanhe-atlas/',search:'?email=never-send@example.com',hash:'#access_token=do-not-send'},
    navigator:{userAgent:'DO NOT SEND',doNotTrack:'0'},document:{getElementById:element,referrer:'https://private.example.com/'},
    config:{url:'https://gxaeatehlgepgeuhhmll.supabase.co',publishableKey:'sb_publishable_test'},
    crypto:{randomUUID:()=>uuid(++random)},storage,fetch:async(url,init)=>{calls.push({url,init,payload:JSON.parse(init.body)});return ok();},
    setTimeout:schedule,clearTimeout:cancel,...overrides};
  const api=createAnalytics(options);
  async function runNext(delay){const match=[...jobs].find(([,job])=>delay===undefined||job.delay===delay);assert.ok(match,'scheduled job exists '+delay);jobs.delete(match[0]);match[1].fn();await tick();}
  return {api,options,values,calls,jobs,nodes,storage,runNext};
}

test('one delayed page view contains only random IDs and unresolved status, with no auth or navigation data',async()=>{
  const h=harness();h.api.start();h.api.start();assert.equal(h.calls.length,0);assert.equal(h.jobs.size,1);
  await h.runNext(1000);assert.equal(h.calls.length,1);assert.equal(h.jobs.size,0);
  const {url,init,payload}=h.calls[0];
  assert.equal(url,'https://gxaeatehlgepgeuhhmll.supabase.co/rest/v1/rpc/shanhe_record_visit');
  assert.deepEqual(Object.keys(payload).sort(),['p_event_id','p_status','p_visitor_id']);
  assert.deepEqual(payload,{p_event_id:uuid(2),p_visitor_id:uuid(1),p_status:0});
  assert.deepEqual(init.headers,{apikey:'sb_publishable_test','Content-Type':'application/json'});
  assert.equal(init.credentials,'omit');assert.equal(init.referrerPolicy,'no-referrer');assert.equal(init.keepalive,true);
  assert.ok(!JSON.stringify(h.calls).includes('never-send'));assert.ok(!JSON.stringify(h.calls).includes('DO NOT SEND'));
  assert.deepEqual([...h.values.keys()],[VISITOR_KEY]);
});

test('known initial auth is sent directly once and later account changes never count another view',async()=>{
  const h=harness();h.api.setAuthState(true);h.api.start();await h.runNext();
  h.api.setAuthState(false);h.api.setAuthState(true);await tick();
  assert.equal(h.calls.length,1);assert.equal(h.calls[0].payload.p_status,2);assert.equal(h.jobs.size,0);
});

test('unresolved view is classified once using the same event and browser IDs',async()=>{
  const h=harness();h.api.start();await h.runNext();h.api.setAuthState(false);await h.runNext(0);
  assert.equal(h.calls.length,2);assert.equal(h.calls[1].payload.p_status,1);
  assert.equal(h.calls[0].payload.p_event_id,h.calls[1].payload.p_event_id);
  assert.equal(h.calls[0].payload.p_visitor_id,h.calls[1].payload.p_visitor_id);
  h.api.setAuthState(false);h.api.setAuthState(true);assert.equal(h.jobs.size,0);
});

test('a second page reuses the browser identity but creates a separate event',async()=>{
  const h=harness();h.api.start();await h.runNext();
  const second=createAnalytics(h.options);second.start();await h.runNext();
  assert.equal(h.calls.length,2);assert.equal(h.calls[1].payload.p_visitor_id,h.calls[0].payload.p_visitor_id);
  assert.notEqual(h.calls[1].payload.p_event_id,h.calls[0].payload.p_event_id);
});

test('transient request retries are bounded and retain the same event payload',async()=>{
  let tries=0;const h=harness();h.options.fetch=null;
  const x=harness({fetch:async(url,init)=>{h.calls.push(JSON.parse(init.body));tries++;throw new Error('network details must remain private');}});
  x.api.start();await x.runNext();assert.equal(tries,1);await x.runNext(1500);assert.equal(tries,2);assert.equal(x.jobs.size,0);
  assert.deepEqual(h.calls[0],h.calls[1]);
});

test('HTTP 400 does not retry, while HTTP 429 and 503 retry once',async()=>{
  for(const status of [400,429,503]){
    let calls=0;const h=harness({fetch:async()=>{calls++;return {ok:false,status};}});h.api.start();await h.runNext();
    if(status===400)assert.equal(h.jobs.size,0);
    else{await h.runNext(1500);assert.equal(h.jobs.size,0);assert.equal(calls,2);}
  }
});

test('a stalled request is aborted at the timeout, without blocking application startup',async()=>{
  let attempts=0,aborts=0;
  class Controller{constructor(){this.signal={};}abort(){aborts++;}}
  const h=harness({AbortController:Controller,fetch:()=>{attempts++;return new Promise(()=>{});}});
  assert.equal(h.api.start(),undefined);await h.runNext(1000);assert.equal(attempts,1);
  await h.runNext(5000);assert.equal(aborts,1);await h.runNext(1500);await h.runNext(5000);
  assert.equal(attempts,2);assert.equal(aborts,2);assert.equal(h.jobs.size,0);
});

test('auth arriving during an in-flight view waits, then sends one idempotent classification update',async()=>{
  let resolve;const calls=[];
  const h=harness({fetch:(url,init)=>{calls.push(JSON.parse(init.body));return calls.length===1?new Promise(r=>resolve=r):Promise.resolve(ok());}});
  h.api.start();await h.runNext(1000);h.api.setAuthState(true);await h.runNext(0);assert.equal(calls.length,1);
  resolve(ok());await tick();await h.runNext(0);assert.equal(calls.length,2);assert.equal(calls[1].p_status,2);
  assert.equal(calls[0].p_event_id,calls[1].p_event_id);assert.equal(h.jobs.size,0);
});

test('local previews, other origins, misleading paths and a mock backend never send data',async()=>{
  const cases=[{location:{origin:'http://127.0.0.1:5173',pathname:'/'}},{location:{origin:'capacitor://localhost',pathname:'/'}},
    {location:{origin:'https://attacker.example',pathname:'/shanhe-atlas/'}},{location:{origin:'https://tanghongliang1024-boop.github.io',pathname:'/shanhe-atlas-other/'}},
    {config:{url:'https://test-preview.supabase.co',publishableKey:'sb_publishable_preview'}}];
  for(const options of cases){const h=harness(options);h.api.start();h.api.setAuthState(false);await tick();assert.equal(h.jobs.size,0);assert.equal(h.calls.length,0);assert.equal(h.values.size,0);assert.equal(h.nodes.get('analytics-enabled').disabled,true);}
});

test('DNT and GPC prevent identifier creation and make the privacy override visible',()=>{
  for(const navigator of [{doNotTrack:'1'},{globalPrivacyControl:true}]){
    const h=harness({navigator});h.api.start();assert.equal(h.jobs.size,0);assert.equal(h.values.size,0);
    assert.equal(h.nodes.get('analytics-enabled').checked,false);assert.equal(h.nodes.get('analytics-enabled').disabled,true);
    assert.match(h.nodes.get('analytics-status').textContent,/隐私保护/);
  }
});

test('opt-out clears only its random identifier, cancels work, and opt-in waits for the next page',async()=>{
  const h=harness();h.values.set('shanhe-atlas-guest-v5','private travel');h.api.start();await h.runNext();
  h.api.setEnabled(false);h.api.setAuthState(false);await tick();assert.equal(h.calls.length,1);assert.equal(h.values.has(VISITOR_KEY),false);
  assert.equal(h.values.get('shanhe-atlas-guest-v5'),'private travel');assert.equal(h.values.get(OPT_OUT_KEY),'1');
  assert.equal(h.nodes.get('analytics-enabled').checked,false);assert.equal(h.nodes.get('analytics-enabled').disabled,false);
  h.api.setEnabled(true);h.api.start();assert.equal(h.jobs.size,0);assert.match(h.nodes.get('analytics-status').textContent,/下次/);
});

test('a stored opt-out and cross-tab opt-out both prevent outgoing requests',async()=>{
  const h=harness();h.values.set(OPT_OUT_KEY,'1');h.api.start();assert.equal(h.jobs.size,0);
  const x=harness();x.api.start();x.values.set(OPT_OUT_KEY,'1');x.api.storageChanged({key:OPT_OUT_KEY});
  assert.equal(x.jobs.size,0);assert.equal(x.calls.length,0);
  x.values.set(OPT_OUT_KEY,'0');x.api.storageChanged({key:OPT_OUT_KEY});
  assert.match(x.nodes.get('analytics-status').textContent,/下次/);assert.equal(x.jobs.size,0);
});

test('blocked storage or missing secure UUID support never falls back to fingerprinting',async()=>{
  const broken={getItem(){throw new Error('denied');},setItem(){throw new Error('denied');}};
  for(const options of [{storage:broken},{storage:null},{crypto:null},{crypto:{randomUUID:()=> 'not-secure'}}]){
    const h=harness(options);h.api.start();if(h.jobs.size)await h.runNext();assert.equal(h.calls.length,0);assert.equal(h.jobs.size,0);
  }
  const h=harness({storage:{getItem:()=>null,setItem(){throw new Error('quota');}}});h.api.start();await h.runNext();assert.equal(h.calls.length,0);
});

test('identity creation uses the browser lock and does not duplicate pending requests',async()=>{
  let release,lockCalls=0;
  const h=harness({locks:{request:async(name,fn)=>{assert.equal(name,'shanhe-analytics-identity-v1');lockCalls++;await new Promise(r=>release=r);return fn();}}});
  h.api.start();await h.runNext(1000);h.api.setAuthState(false);release();await tick();
  assert.equal(lockCalls,1);assert.equal(h.calls.length,1);assert.equal(h.calls[0].payload.p_status,1);
});

test('the footer dialog and checkbox reflect the actual effective preference',()=>{
  const h=harness();h.api.start();h.nodes.get('analytics-info-button').onclick();assert.equal(h.nodes.get('analytics-dialog').open,true);
  h.nodes.get('analytics-enabled').checked=false;h.nodes.get('analytics-enabled').onchange();assert.equal(h.values.get(OPT_OUT_KEY),'1');
  h.nodes.get('close-analytics').onclick();assert.equal(h.nodes.get('analytics-dialog').open,false);
});
