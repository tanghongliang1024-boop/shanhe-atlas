'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
require('../cloud-store.js');require('../landmark-store.js');
const {COLORS,defaultDocument,validateDocument,createFamilyStore}=require('../family-store.js');
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',C='33333333-3333-4333-8333-333333333333',D='44444444-4444-4444-8444-444444444444';
const region=note=>({visited:true,date:'2024-02-29',note,updatedAt:'2026-10-28T00:00:00Z'});
const landmark=note=>({status:'visited',date:'2024-05-01',note,updatedAt:'2026-10-28T00:00:00Z'});
function doc(children=[A]){const x=defaultDocument();children.forEach((id,i)=>{x.members.push({id,name:'孩子'+(i+1),color:COLORS[i+1]?.id||'blue'});x.regions[id]={};x.landmarks[id]={};});return x;}
const clone=x=>structuredClone(x),wait=()=>new Promise(resolve=>setTimeout(resolve,12));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function harness({initial='alice',documents={},onAccountChange,duplicateInitial=false,confirmation='2026-10-22T06:00:00Z'}={}){
  let id=initial,emailConfirmedAt=confirmation,observer,readGate,writeGate,sessionGate,readFailure,writeFailure,malformed;
  const db=new Map(Object.entries(documents).map(([key,document])=>[key,{document:clone(document),revision:3}]));
  const calls={read:[],write:[],session:0},changes=[];
  const current=()=>id?{user:{id,email:id+'@example.com',email_confirmed_at:emailConfirmedAt,confirmed_at:'2026-10-22T06:00:00Z',user_metadata:{email_verified:true}},access_token:'token-'+id}:null;
  const auth={
    async getSession(){calls.session++;const value=current();if(sessionGate){const held=sessionGate;sessionGate=null;await held;}return {data:{session:value},error:null};},
    onAuthStateChange(fn){observer=fn;if(duplicateInitial)setTimeout(()=>observer('INITIAL_SESSION',current()),0);return {data:{subscription:{unsubscribe(){}}}};}
  };
  function query(action){const headers={};return {setHeader(key,value){headers[key]=value;return this;},then(resolve,reject){return action(headers).then(resolve,reject);}};}
  const client={auth,
    from(table){assert.equal(table,'shanhe_family_archives');let owner;const q={select(cols){assert.equal(cols,'document,revision');return q;},eq(key,value){assert.equal(key,'user_id');owner=value;return q;},maybeSingle(){return query(async headers=>{
      calls.read.push({id:owner,headers:{...headers}});if(readGate){const held=readGate;readGate=null;await held;}
      if(readFailure){const problem=readFailure;readFailure=null;return {data:null,error:problem};}
      assert.equal(headers.Authorization,'Bearer token-'+owner);
      return {data:db.has(owner)?clone(db.get(owner)):null,error:null};
    });}};return q;},
    rpc(name,args){assert.equal(name,'shanhe_save_family_archive_v2');assert.deepEqual(Object.keys(args).sort(),['p_document','p_expected_revision']);return query(async headers=>{
      const owner=headers.Authorization.replace('Bearer token-','');calls.write.push({id:owner,args:clone(args),headers:{...headers}});
      if(writeGate){const held=writeGate;writeGate=null;await held;}
      if(writeFailure){const problem=writeFailure;writeFailure=null;return {data:null,error:problem};}
      const previous=db.get(owner)||{document:defaultDocument(),revision:0};if(previous.revision!==args.p_expected_revision)return {data:null,error:{code:'40001',message:'REVISION_CONFLICT'}};
      const next={document:clone(args.p_document),revision:previous.revision+1};db.set(owner,next);return {data:malformed||clone(next),error:null};
    });}
  };
  let uuid=A;
  const store=createFamilyStore({onChange:s=>changes.push(s),onAccountChange,uuid:()=>uuid});
  return {store,client,db,calls,changes,start:()=>store.start(client),setUser(next,event='SIGNED_IN'){id=next;observer(event,current());},setConfirmation(value,event='TOKEN_REFRESHED'){emailConfirmedAt=value;if(event)observer(event,current());},uuid(value){uuid=value;},holdRead(p){readGate=p;},holdWrite(p){writeGate=p;},holdSession(p){sessionGate=p;},failRead(e={message:'private server info'}){readFailure=e;},failWrite(e={message:'private server info'}){writeFailure=e;},badResponse(x){malformed=x;}};
}

test('document validation enforces member identity, names, colors and exact child record maps',()=>{
  const valid=doc([A,B,C]);valid.regions[A]['441302']=region('惠城区');valid.landmarks[B]['poi:CHN:taishan']=landmark('泰山');
  assert.deepEqual(validateDocument(valid),valid);assert.deepEqual(validateDocument(defaultDocument()),defaultDocument());
  const invalid=[];
  for(const change of [x=>x.members[0].id=A,x=>x.members[1].id='not-uuid',x=>x.members[1].name=' ',x=>x.members[1].name=' spaced ',x=>x.members[1].name='😀'.repeat(7),x=>x.members[1].name='a\nb',x=>x.members[1].color='url(javascript:bad)',x=>x.members[1].color='terracotta',x=>x.members[1].extra=true,x=>x.regions.self={},x=>delete x.landmarks[A],x=>x.regions[B]={},x=>x.extra=true,x=>x.landmarks[A]={'441302':landmark('wrong namespace')},x=>x.regions[A]={'poi:CHN:taishan':region('wrong namespace')}]){const value=doc();change(value);invalid.push(value);}
  const duplicate=doc([A,B]);duplicate.members[1].name='Child';duplicate.members[2].name='child';invalid.push(duplicate);
  invalid.push(doc([A,B,C,D]));for(const value of invalid)assert.throws(()=>validateDocument(value));
  const accessor=doc();Object.defineProperty(accessor,'regions',{enumerable:true,get(){throw Error('getter executed');}});assert.throws(()=>validateDocument(accessor),{code:'INVALID_DOCUMENT'});
  const arrayAccessor=doc();Object.defineProperty(arrayAccessor.members,'1',{enumerable:true,get(){throw Error('member getter executed');}});assert.throws(()=>validateDocument(arrayAccessor),{code:'INVALID_DOCUMENT'});
});

test('guest family creation and edits are refused without any archive request',async()=>{
  const h=harness({initial:null});await h.start();assert.equal(h.store.getState().guest,true);assert.equal(h.store.canEdit(),false);
  assert.equal((await h.store.addMember('孩子','blue',h.store.context())).code,'AUTH_REQUIRED');
  assert.equal((await h.store.updateMember('self',{name:'家长'},h.store.context())).code,'AUTH_REQUIRED');
  assert.equal(h.calls.read.length+h.calls.write.length,0);
});

test('unconfirmed SDK sessions start as guests despite generic confirmation and editable metadata flags',async()=>{
  for(const confirmation of [null,'',true,'not-a-date']){
    const h=harness({confirmation,documents:{alice:doc()}});await h.start();
    assert.equal(h.store.getState().guest,true);assert.equal(h.store.getState().userId,null);assert.equal(h.store.canEdit(),false);
    assert.deepEqual(h.store.getState().document,defaultDocument());
    assert.equal((await h.store.saveDocument(defaultDocument(),h.store.context())).code,'AUTH_REQUIRED');
    assert.equal((await h.store.addMember('孩子','blue',h.store.context())).code,'AUTH_REQUIRED');
    await h.store.refresh();assert.equal(h.calls.read.length+h.calls.write.length,0);
  }
});

test('unconfirmed auth events immediately hide old family records while confirmed login and recovery can restore them',async()=>{
  for(const event of ['INITIAL_SESSION','SIGNED_IN','TOKEN_REFRESHED','PASSWORD_RECOVERY']){
    const h=harness({documents:{alice:doc()}});await h.start();const old=h.store.context();
    h.setConfirmation(null,event);
    assert.equal(h.store.getState().guest,true);assert.equal(h.store.getState().userId,null);
    assert.deepEqual(h.store.getState().document,defaultDocument());
    assert.equal((await h.store.saveDocument(doc(),old)).code,'AUTH_REQUIRED');
    await wait();assert.equal(h.calls.read.length,1);assert.equal(h.calls.write.length,0);
    h.setConfirmation('2026-10-30T00:00:00Z',event==='PASSWORD_RECOVERY'?'PASSWORD_RECOVERY':'SIGNED_IN');
    await wait();assert.equal(h.store.getState().userId,'alice');assert.equal(h.store.canEdit(),true);
    assert.deepEqual(h.store.getState().document,doc());assert.equal(h.calls.read.length,2);
  }
});

test('fresh token checks reject an unconfirmed SDK session even before its auth event arrives',async()=>{
  for(const action of ['read','write']){
    const h=harness({documents:{alice:doc()}});await h.start();const ctx=h.store.context();
    h.setConfirmation(undefined,null);
    const result=await(action==='read'?h.store.refresh():h.store.updateMember(A,{name:'未提交'},ctx));
    assert.equal(result.code,'AUTH_REQUIRED');
    assert.equal(h.calls.read.length,1);assert.equal(h.calls.write.length,0);
    assert.deepEqual(h.db.get('alice').document,doc());
  }
});

test('missing account starts with self metadata and never reads or copies legacy records',async()=>{
  const h=harness();await h.start();assert.deepEqual(h.store.getState().document,defaultDocument());assert.equal(h.store.getState().revision,0);assert.equal(h.calls.write.length,0);
  const add=await h.store.addMember('小明','blue',h.store.context());assert.equal(add.ok,true);assert.equal(add.memberId,A);
  const saved=h.db.get('alice');assert.equal(saved.revision,1);assert.deepEqual(saved.document.regions[A],{});assert.deepEqual(saved.document.landmarks[A],{});assert.equal(Object.hasOwn(saved.document.regions,'self'),false);
});

test('each child region and attraction are independent; cancellation changes only selected member',async()=>{
  const original=doc([A,B]);original.regions[A]['441302']=region('甲');original.regions[B]['441302']=region('乙');original.landmarks[A]['poi:CHN:taishan']=landmark('甲');original.landmarks[B]['poi:CHN:taishan']=landmark('乙');
  const h=harness({documents:{alice:original}});await h.start();
  assert.equal((await h.store.saveRecords('regions',A,{},h.store.context())).ok,true);assert.deepEqual(h.store.getState().document.regions[A],{});assert.deepEqual(h.store.getState().document.regions[B],original.regions[B]);
  assert.equal((await h.store.saveRecords('landmarks',A,{},h.store.context())).ok,true);assert.deepEqual(h.store.getState().document.landmarks[B],original.landmarks[B]);
  assert.equal((await h.store.saveRecords('regions','self',{},h.store.context())).code,'INVALID_DOCUMENT');
});

test('adding or renaming a member preserves all other records and enforces four total members',async()=>{
  const d=doc([A,B]);d.regions[A]['441302']=region('keep');const h=harness({documents:{alice:d}});await h.start();h.uuid(C);
  assert.equal((await h.store.addMember('第三个孩子','gold',h.store.context())).ok,true);assert.deepEqual(h.store.getState().document.regions[A],d.regions[A]);
  h.uuid(D);assert.equal((await h.store.addMember('第五位','blue',h.store.context())).ok,false);
  assert.equal((await h.store.updateMember(A,{name:'小明'},h.store.context())).ok,true);assert.equal(h.store.getState().document.members[1].name,'小明');
  const removed=doc([A,B]);assert.equal((await h.store.saveDocument(removed,h.store.context())).ok,false);
  assert.equal((await h.store.updateMember(A,{color:'terracotta'},h.store.context())).ok,false);
});

test('old form revisions and remote CAS conflicts cannot overwrite current family data',async()=>{
  const h=harness({documents:{alice:doc()}});await h.start();const old=h.store.context();
  await h.store.updateMember(A,{name:'小明'},old);assert.equal((await h.store.saveRecords('regions',A,{},old)).code,'STALE_CONTEXT');
  const context=h.store.context(),remote=clone(h.db.get('alice'));remote.revision++;remote.document.members[1].name='其他设备';h.db.set('alice',remote);
  assert.equal((await h.store.updateMember(A,{name:'本机未提交'},context)).code,'CONFLICT');assert.equal(h.store.getState().document.members[1].name,'小明');
  await h.store.refresh();assert.equal(h.store.getState().document.members[1].name,'其他设备');
});

test('network failure retains saved snapshot and the same input/context can retry successfully',async()=>{
  const h=harness({documents:{alice:doc()}});await h.start();const context=h.store.context();h.failWrite();
  const failed=await h.store.saveRecords('regions',A,{'441302':region('retry')},context);assert.equal(failed.code,'WRITE_FAILED');assert.doesNotMatch(failed.message,/private/);assert.deepEqual(h.store.getState().document.regions[A],{});assert.equal(h.store.canEdit(),true);
  assert.equal((await h.store.saveRecords('regions',A,{'441302':region('retry')},context)).ok,true);
});

test('account changes clear old children immediately, close editors and reject late writes',async()=>{
  const accounts=[],h=harness({documents:{alice:doc(),bob:doc([B])},onAccountChange:id=>accounts.push(id)});await h.start();const old=h.store.context(),gate=deferred();h.holdWrite(gate.promise);
  const saving=h.store.saveRecords('regions',A,{'441302':region('old')},old);await wait();h.setUser('bob');
  assert.equal(h.store.getState().userId,'bob');assert.deepEqual(h.store.getState().document,defaultDocument());assert.equal(h.store.canEdit(),false);await wait();
  gate.resolve();assert.equal((await saving).code,'STALE_CONTEXT');assert.equal(h.store.getState().document.members[1].id,B);assert.ok(accounts.includes('bob'));
  assert.equal((await h.store.saveRecords('regions',B,{},old)).code,'STALE_CONTEXT');assert.equal(h.db.get('bob').revision,3);
});

test('a new account operation keeps its own busy lock when an old request completes',async()=>{
  const h=harness({documents:{alice:doc(),bob:doc([B])}});await h.start();const first=deferred(),second=deferred();h.holdWrite(first.promise);
  const a=h.store.updateMember(A,{name:'Alice child'},h.store.context());await wait();h.setUser('bob');await wait();h.holdWrite(second.promise);
  const b=h.store.updateMember(B,{name:'Bob child'},h.store.context());await wait();first.resolve();await a;assert.equal(h.store.getState().busy,true);
  second.resolve();assert.equal((await b).ok,true);assert.equal(h.store.getState().document.members[1].name,'Bob child');
});

test('logout and same-user login invalidate old forms and late reads',async()=>{
  const h=harness({documents:{alice:doc()}});await h.start();const old=h.store.context(),gate=deferred();h.holdRead(gate.promise);const reading=h.store.refresh();await wait();
  h.setUser(null,'SIGNED_OUT');assert.equal(h.store.getState().guest,true);assert.deepEqual(h.store.getState().document,defaultDocument());h.setUser('alice');await wait();gate.resolve();assert.equal((await reading).code,'STALE_CONTEXT');
  assert.equal((await h.store.updateMember(A,{name:'stale'},old)).code,'STALE_CONTEXT');
});

test('duplicate auth events avoid extra reads while editing or saving and never duplicate writes',async()=>{
  const h=harness({documents:{alice:doc()},duplicateInitial:true});await h.start();await wait();assert.equal(h.calls.read.length,1);
  const context=h.store.context();h.setUser('alice','TOKEN_REFRESHED');await wait();assert.equal(h.calls.read.length,1);assert.deepEqual(h.store.context(),context);
  await h.store.updateMember(A,{name:'小明'},context);assert.equal(h.calls.write.length,1);
});

test('invalid server snapshots disable editing while preserving recoverable prior document',async()=>{
  const h=harness({documents:{alice:doc()}});await h.start();h.db.set('alice',{revision:4,document:{version:1}});
  assert.equal((await h.store.refresh()).code,'INVALID_RESPONSE');assert.equal(h.store.canEdit(),false);assert.deepEqual(h.store.getState().document,doc());
  h.db.set('alice',{revision:4,document:doc()});assert.equal((await h.store.refresh()).ok,true);assert.equal(h.store.canEdit(),true);
});

test('all getters and callback snapshots are detached from the saved document',async()=>{
  const h=harness({documents:{alice:doc()}});await h.start();const shown=h.store.getState();shown.document.members[1].name='MUTATED';h.changes.at(-1).document.regions[A]['441302']=region('MUTATED');assert.deepEqual(h.store.getState().document,doc());
});

test('a shared auth client switch before obtaining a token never sends a wrong-account request',async()=>{
  const h=harness({documents:{alice:doc(),bob:doc([B])}});await h.start();const gate=deferred();h.holdSession(gate.promise);
  const saving=h.store.updateMember(A,{name:'old'},h.store.context());h.setUser('bob');await wait();gate.resolve();assert.equal((await saving).code,'STALE_CONTEXT');assert.equal(h.calls.write.length,0);
});
