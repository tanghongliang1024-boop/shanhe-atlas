'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../region-model.js'),L=require('../landmark-model.js');
const {createFamilyArchiveAdapter}=require('../family-adapter.js');
const {validateRecords}=require('../cloud-store.js');
const {validateRecords:validateLandmarks}=require('../landmark-store.js');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/geo',name),'utf8'));
const model=R.catalog(read('china-prefecture-index.json'),read('world-index.json'),[],null,read('world-cities.json'));
const catalog=L.catalog(require('../landmark-catalog.js')),source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const extract=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a);assert.ok(a>=0&&b>a,start);return source.slice(a,b);};
const line=pattern=>{const match=source.match(pattern);assert.ok(match,'production initializer remains available');return match[0];};
const A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const LUCERNE='world:CHE:city-1159133953',BERN='world:CHE:city-1159149737',NARA_CITY='world:JPN:city-gn1855612';
const NARA='poi:JPN:nara',TAISHAN='poi:CHN:taishan',JIUZHAIGOU='poi:CHN:jiuzhaigou';
const row=(date,note)=>({visited:true,date,note,updatedAt:'2026-10-29T01:02:03.000Z'});
const landmarkRow=(date,note,status='visited')=>({status,date,note,updatedAt:'2026-10-29T02:03:04.000Z'});
const plain=value=>JSON.parse(JSON.stringify(value));

// Use the production editors, member adapter, and change callbacks. The only
// substitute for persistence is an isolated, revision-checked memory archive.
function harness(){
  const elements=new Map(),radios=['unvisited','wish','visited'].map(value=>({value,checked:false}));let created=0;
  function el(selector){
    if(selector.includes('input[name="lm-state"]:checked'))return radios.find(item=>item.checked);
    if(!elements.has(selector)){
      let html='';const element={value:selector.endsWith('-filter')?'all':'',checked:false,textContent:'',dataset:{},hidden:false,open:false,buttons:[],listeners:{},
        classList:{add(){},toggle(){}},setAttribute(){},focus(){},close(){this.open=false;},showModal(){this.open=true;},reportValidity(){return true;},
        addEventListener(type,handler){this.listeners[type]=handler;},
        querySelectorAll(query){if(query==='input[name="lm-state"]')return radios;if(query==='button,input,textarea,select')return [el('#detail-date'),el('#detail-note'),el('#detail-visited')];return [];}};
      Object.defineProperty(element,'id',{set(value){elements.set('#'+value,this);}});
      Object.defineProperty(element,'innerHTML',{get:()=>html,set(value){html=value;if(selector==='#timeline')element.buttons=[...value.matchAll(/<button\b([^>]*data-timeline-kind="([^"]+)"[^>]*data-timeline-id="([^"]+)"[^>]*)>/g)].map(match=>({attributes:match[1],dataset:{timelineKind:match[2],timelineId:match[3]},closest(query){return query==='button[data-timeline-id]'?this:null;}}));}});
      elements.set(selector,element);
    }return elements.get(selector);
  }
  const document={querySelector:el,querySelectorAll:selector=>selector==='#city-dialog,#city-picker,#region-dialog'?['#city-dialog','#city-picker','#region-dialog'].map(el):[],createElement:()=>el('#created-'+created++),body:{append(){}}};
  const members=[{id:'self',name:'家长甲',color:'terracotta'},{id:A,name:'成员乙',color:'blue'},{id:B,name:'成员丙',color:'purple'}];
  const primary={regions:{[BERN]:row('2018-01-01','家长城市')},landmarks:{[NARA]:landmarkRow('2019-01-01','家长景点')}};
  const state={document:{version:1,members,regions:{[A]:{[LUCERNE]:row('2010-01-01','乙的城市')},[B]:{[LUCERNE]:row('2022-03-04','丙的城市'),[BERN]:row('','丙的未填写日期')}},landmarks:{[A]:{[NARA]:landmarkRow('2011-01-01','乙的景点')},[B]:{[NARA]:landmarkRow('2020-01-02','丙的奈良'),[TAISHAN]:landmarkRow('2021-02-03','丙的泰山'),[JIUZHAIGOU]:landmarkRow('','想去九寨沟','wish')}}},userId:'isolated-timeline-account',guest:false,ready:true,busy:false,error:null,revision:8};
  const primaryState={userId:state.userId,guest:false,ready:true,busy:false,revision:3};
  const writes=[],notices=[],renderCounts={list:0,map:0};let active=B,context,familyOptions,landmarkOptions;
  const family={getState:()=>structuredClone(state),context:()=>({userId:state.userId,revision:state.revision,epoch:1}),canEdit:()=>true,
    async saveRecords(kind,id,records,ctx){assert.equal(ctx.revision,state.revision);assert.ok([A,B].includes(id));const next=(kind==='regions'?validateRecords:validateLandmarks)(structuredClone(records));writes.push({kind,id,records:structuredClone(next)});state.document[kind][id]=next;state.revision++;familyOptions.onChange();return {ok:true,guest:false};}};
  const primaryStore=kind=>({getState:()=>({...primaryState,records:structuredClone(primary[kind])}),context:()=>({revision:primaryState.revision}),canEdit:()=>true,
    async save(records,ctx){assert.equal(ctx.revision,primaryState.revision);const next=(kind==='regions'?validateRecords:validateLandmarks)(structuredClone(records));writes.push({kind,id:'self',records:structuredClone(next)});primary[kind]=next;primaryState.revision++;if(kind==='landmarks')landmarkOptions.onChange();else context.syncMemberRecords();return {ok:true,guest:false};}});
  const primaryRegions=primaryStore('regions'),primaryLandmarks=primaryStore('landmarks');
  context={document,structuredClone,R,model,features:model.features,landmarkCatalog:catalog,landmarkUI:null,landmarkStore:null,cloud:null,familyStore:null,primaryLandmarkStore:null,
    primaryRecords:primary.regions,$:el,records:{},selected:null,detailContext:null,detailBase:{},detailBusy:false,detailOperation:0,selectionVersion:0,currentView:'stats',
    familyUI:{activeId:()=>active,render(){},reset(){active='self';}},
    createFamilyStore:options=>{familyOptions=options;return family;},createLandmarkStore:options=>{landmarkOptions=options;return primaryLandmarks;},hasOpenEditor:()=>false,
    d3:{group(items,key){const groups=new Map();for(const item of items){const value=key(item);if(!groups.has(value))groups.set(value,[]);groups.get(value).push(item);}return groups;}},
    dateString:value=>value?value.replaceAll('-','.'):'初见日期待补充',toast:message=>notices.push(message),showSaveResult:result=>{if(!result.ok)notices.push(result.code);},
    renderSummary(){},renderList(){renderCounts.list++;},renderMapState(){},renderLandmarkMap(){renderCounts.map++;},renderCollection(){},
    isWorldLegacy:f=>f?.properties.legacyKind==='world-region',isCountryLegacy:f=>f?.properties.legacyKind==='world-country'};
  context.window=context;vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../landmark-ui.js'),'utf8'),context);
  vm.runInContext(extract('const icon=','const R=')+extract('function closeRecordEditors(){','function mapMemberEntries(')+
    extract('function setDetailBusy(','function showSaveResult(')+extract('function renderStats(){',"$('#export-btn').onclick")+
    extract('function openCity(id){',"$('#close-dialog').onclick")+extract('async function saveCity(remove){',"$('#city-form').onsubmit")+
    line(/^async function persist\([^\n]+$/m),context);
  vm.runInContext(line(/^\s*familyStore=createFamilyStore\([^\n]+$/m)+line(/^\s*primaryLandmarkStore=createLandmarkStore\([^\n]+$/m),context);
  const adapter=kind=>createFamilyArchiveAdapter({kind,primary:kind==='regions'?primaryRegions:primaryLandmarks,family,getMemberId:()=>active,getSelectionVersion:()=>context.selectionVersion});
  context.cloud=adapter('regions');context.landmarkStore=adapter('landmarks');context.landmarkUI=context.createLandmarkUI({catalog,store:context.landmarkStore,notify:message=>notices.push(message)});
  context.visits=()=>R.recordsWithFeatures(context.records,model).filter(feature=>!feature.properties.prefectureTarget);
  context.syncMemberRecords();
  return {context,el,state,primary,primaryState,writes,notices,renderCounts,active:()=>active,entries:()=>plain(context.timelineEntries()),buttons:()=>el('#timeline').buttons,
    select(id){active=id;context.changeRecordMember();},
    click(kind,id){const button=el('#timeline').buttons.find(item=>item.dataset.timelineKind===kind&&item.dataset.timelineId===id);assert.ok(button,'the rendered timeline contains this edit button');el('#timeline').onclick({target:{closest:query=>button.closest(query)}});},
    async saveLandmark(status,date){radios.forEach(radio=>radio.checked=radio.value===status);radios.find(radio=>radio.checked).onchange();el('#lm-detail-date').value=date;await el('#lm-detail-form').onsubmit({preventDefault(){}});}};
}

test('timeline merges visited regions and landmarks once, sorts dates, and places undated visits last',()=>{
  const h=harness(),before=structuredClone(h.state.document);
  assert.deepEqual(h.entries().map(entry=>[entry.kind,entry.id,entry.date]),[['landmark',NARA,'2020-01-02'],['landmark',TAISHAN,'2021-02-03'],['region',LUCERNE,'2022-03-04'],['region',BERN,'']]);
  assert.equal(catalog.byId.get(TAISHAN).themeIds.length,2,'the real Tai Shan belongs to two themes');
  assert.equal(h.entries().filter(entry=>entry.id===TAISHAN).length,1);
  h.context.landmarkCatalog={...catalog,places:[...catalog.places,catalog.byId.get(TAISHAN)]};
  assert.equal(h.entries().filter(entry=>entry.id===TAISHAN).length,1,'even duplicate catalog membership cannot duplicate a visit');
  assert.equal(h.entries().some(entry=>entry.id===JIUZHAIGOU),false,'wish entries are excluded');
  h.state.document.regions[B][LUCERNE].visited=false;h.context.syncMemberRecords();
  assert.equal(h.entries().some(entry=>entry.id===LUCERNE),false,'non-visited region entries are excluded');
  assert.equal(h.writes.length,0);assert.deepEqual(h.state.document.landmarks,before.landmarks);
});

test('equal dates have deterministic name/type/id order and same-name city and landmark remain independent',()=>{
  const h=harness(),name=R.displayName(model.byId.get(NARA_CITY));
  h.state.document.regions[B]={[NARA_CITY]:row('2020-01-02','同名城市')};
  h.state.document.landmarks[B]={[NARA]:landmarkRow('2020-01-02','同名景点'),[TAISHAN]:landmarkRow('2020-01-02','测试同名第二景点')};
  h.context.landmarkCatalog={...catalog,places:catalog.places.map(place=>[NARA,TAISHAN].includes(place.id)?{...place,name}:place)};
  h.context.syncMemberRecords();
  assert.deepEqual(h.entries().map(entry=>[entry.kind,entry.id,entry.name]),[['landmark',TAISHAN,name],['landmark',NARA,name],['region',NARA_CITY,name]]);
  const first=h.entries();h.context.renderStats();assert.deepEqual(h.entries(),first);
  h.click('region',NARA_CITY);assert.equal(R.id(h.context.selected),NARA_CITY);assert.equal(h.el('#detail-note').value,'同名城市');
  h.click('landmark',NARA);assert.equal(h.el('#lm-detail-note').value,'同名景点');assert.equal(h.active(),B);assert.equal(h.writes.length,0);
});

test('rendered native edit buttons route nested clicks by type and escape member-authored notes',()=>{
  const h=harness();h.state.document.regions[B][LUCERNE].note='<img src=x onerror=alert(1)> & "旅行"';h.context.syncMemberRecords();
  assert.match(h.el('#timeline').innerHTML,/&lt;img src=x onerror=alert\(1\)&gt; &amp; &quot;旅行&quot;/);
  for(const button of h.buttons()){assert.match(button.attributes,/type="button"/);assert.match(button.attributes,/aria-label="编辑/);}
  h.click('region',LUCERNE);assert.equal(h.el('#city-dialog').open,true);assert.match(h.el('#detail-member').textContent,/成员丙/);
  h.click('landmark',NARA);assert.equal(h.el('#landmark-dialog').open,true);assert.match(h.el('#lm-detail-member').textContent,/成员丙/);
  h.el('#timeline').onclick({target:{closest:()=>null}});h.context.openTimelineEntry('unknown',NARA);assert.equal(h.writes.length,0);
});

test('editing a city date updates only the active member and immediately reorders or removes the timeline entry',async()=>{
  const h=harness(),untouched=structuredClone({a:h.state.document.regions[A],landmarks:h.state.document.landmarks,primary:h.primary});
  h.click('region',LUCERNE);h.el('#detail-date').value='2015-04-05';await h.context.saveCity(false);
  assert.equal(h.writes.length,1);assert.equal(h.writes[0].id,B);assert.equal(h.entries()[0].id,LUCERNE);
  assert.match(h.el('#timeline').innerHTML,/2015\.04\.05/);assert.equal(h.state.document.regions[B][LUCERNE].note,'丙的城市');
  assert.deepEqual({a:h.state.document.regions[A],landmarks:h.state.document.landmarks,primary:h.primary},untouched);
  h.click('region',LUCERNE);h.el('#detail-visited').checked=false;await h.context.saveCity(false);
  assert.equal(h.entries().some(entry=>entry.id===LUCERNE),false);assert.equal(h.buttons().some(button=>button.dataset.timelineId===LUCERNE),false);assert.equal(h.active(),B);
});

test('editing a landmark date uses the active member archive and wish/unvisited changes remove it immediately',async()=>{
  const h=harness(),untouched=structuredClone({a:h.state.document.landmarks[A],regions:h.state.document.regions,primary:h.primary});
  h.click('landmark',TAISHAN);await h.saveLandmark('visited','2014-05-06');
  assert.equal(h.writes.length,1);assert.equal(h.writes[0].kind,'landmarks');assert.equal(h.writes[0].id,B);assert.equal(h.entries()[0].id,TAISHAN);
  assert.equal(h.state.document.landmarks[B][TAISHAN].note,'丙的泰山');assert.match(h.el('#timeline').innerHTML,/2014\.05\.06/);
  h.click('landmark',TAISHAN);await h.saveLandmark('wish','2014-05-06');
  assert.equal(h.entries().some(entry=>entry.id===TAISHAN),false);assert.equal(h.state.document.landmarks[B][TAISHAN].status,'wish');
  h.click('landmark',NARA);await h.saveLandmark('unvisited','');assert.equal(h.state.document.landmarks[B][NARA],undefined);
  assert.deepEqual({a:h.state.document.landmarks[A],regions:h.state.document.regions,primary:h.primary},untouched);assert.equal(h.active(),B);
});

test('the actual primary landmark-store callback refreshes the open timeline after saves',async()=>{
  const h=harness();h.select('self');const before=structuredClone(h.state.document),counts={...h.renderCounts};
  h.click('landmark',NARA);await h.saveLandmark('visited','2010-06-07');
  assert.equal(h.writes.at(-1).id,'self');assert.equal(h.entries()[0].id,NARA);assert.match(h.el('#timeline').innerHTML,/2010\.06\.07/);
  assert.ok(h.renderCounts.list>counts.list);assert.ok(h.renderCounts.map>counts.map);assert.deepEqual(h.state.document,before);
  h.click('landmark',NARA);await h.saveLandmark('unvisited','');assert.equal(h.buttons().some(button=>button.dataset.timelineId===NARA),false);
});

test('changing the active member replaces both timeline sources and rejects a stale editor context',async()=>{
  const h=harness();h.click('region',LUCERNE);const stale=h.context.detailContext;
  h.select(A);assert.equal(h.el('#city-dialog').open,false);assert.deepEqual(h.entries().map(entry=>entry.date),['2010-01-01','2011-01-01']);
  assert.equal((await h.context.cloud.save({},stale)).code,'STALE_CONTEXT');assert.equal(h.writes.length,0);
  h.click('landmark',NARA);assert.match(h.el('#lm-detail-member').textContent,/成员乙/);assert.equal(h.el('#lm-detail-note').value,'乙的景点');
  h.select(B);assert.equal(h.el('#landmark-dialog').open,false);assert.equal(h.entries()[0].date,'2020-01-02');
});

test('pending or mismatched account state cannot expose old-account landmarks, while a ready busy archive stays visible',()=>{
  const h=harness(),savedLandmark=h.context.landmarkStore,savedCloud=h.context.cloud;
  const landmarkState=savedLandmark.getState(),regionState=savedCloud.getState();
  for(const [lmPatch,regionPatch]of [[{ready:false},{}],[{}, {ready:false}],[{userId:'previous-account'},{}],[{guest:true},{}]]){
    h.context.landmarkStore={getState:()=>({...landmarkState,...lmPatch})};h.context.cloud={getState:()=>({...regionState,...regionPatch})};h.context.renderStats();
    assert.equal(h.entries().filter(entry=>entry.kind==='landmark').length,0);assert.equal(h.buttons().filter(button=>button.dataset.timelineKind==='landmark').length,0);
  }
  h.context.landmarkStore={getState:()=>({...landmarkState,busy:true})};h.context.cloud={getState:()=>({...regionState,busy:true})};h.context.renderStats();
  assert.equal(h.entries().filter(entry=>entry.kind==='landmark').length,2);
});

test('signed-in primary archives merge when cloud-store omits guest and landmark-store returns guest false',()=>{
  const h=harness();h.select('self');
  const regionState=h.context.cloud.getState(),landmarkState=h.context.landmarkStore.getState();
  delete regionState.guest;landmarkState.guest=false;
  h.context.cloud={getState:()=>regionState};h.context.landmarkStore={getState:()=>landmarkState};h.context.renderStats();
  assert.deepEqual(h.entries().map(entry=>[entry.kind,entry.id]),[['region',BERN],['landmark',NARA]]);
  assert.equal(h.buttons().filter(button=>button.dataset.timelineKind==='landmark').length,1);
});
