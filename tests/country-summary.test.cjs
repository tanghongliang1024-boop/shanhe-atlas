'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../region-model.js'),L=require('../landmark-model.js');
const {createFamilyArchiveAdapter}=require('../family-adapter.js');
const {validateRecords}=require('../cloud-store.js');
const {createLandmarkStore,validateRecords:validateLandmarks,KEY}=require('../landmark-store.js');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/geo',name),'utf8'));
const chinaIndex=read('china-prefecture-index.json'),model=R.catalog(chinaIndex,read('world-index.json'),[],null,read('world-cities.json'));
const catalog=L.catalog(require('../landmark-catalog.js')),source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
// Compile complete production declarations rather than duplicating their logic
// or assuming that every helper stays on one physical source line.
function productionFunction(name){
  const start=source.search(new RegExp('^(?:async )?function '+name+'\\(','m'));assert.ok(start>=0,'production '+name+' exists');
  const lines=source.slice(start).split('\n');let text='';
  for(const line of lines.slice(0,100)){text+=line+'\n';try{new vm.Script(text);return text;}catch(error){if(!(error instanceof SyntaxError))throw error;}}
  assert.fail('could not extract production '+name);
}
const initializer=name=>{const match=source.match(new RegExp('^\\s*'+name+'=create[^\\n]+$','m'));assert.ok(match,'production '+name+' wiring exists');return match[0];};
const A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const NARA='poi:JPN:nara',VAT='poi:VAT:vatican-city',TAISHAN='poi:CHN:taishan',ALPS='poi:CHE:alps',JERUSALEM='poi:PSX:jerusalem';
const NARA_CITY='world:JPN:city-gn1855612',CHINA_CITY=R.id(model.features.find(feature=>R.countryOf(feature)==='CHN'));
const row=()=>({visited:true,date:'2020-01-02',note:'独立城市记录',updatedAt:'2026-10-29T01:02:03.000Z'});
const landmarkRow=(status='visited')=>({status,date:status==='visited'?'2021-02-03':'',note:'独立景点记录',updatedAt:'2026-10-29T02:03:04.000Z'});

function harness({guest=false}={}){
  const elements=new Map(),el=selector=>{if(!elements.has(selector))elements.set(selector,{textContent:'',style:{}});return elements.get(selector);};
  const primary={regions:{},landmarks:{}},primaryStatus={regions:{userId:guest?null:'test-summary-account',ready:true,busy:false,...(guest?{guest:true}:{})},landmarks:{userId:guest?null:'test-summary-account',ready:true,busy:false,guest}};
  const state={document:{version:1,members:[{id:'self',name:'家长',color:'terracotta'},{id:A,name:'甲',color:'blue'},{id:B,name:'乙',color:'purple'}],regions:{[A]:{},[B]:{}},landmarks:{[A]:{},[B]:{}}},userId:'test-summary-account',guest:false,ready:true,busy:false,error:null,revision:5};
  const writes=[],storageData=new Map(),storage={getItem:key=>storageData.get(key)??null,setItem:(key,value)=>storageData.set(key,value)};
  let active='self',context,familyOptions,landmarkOptions,primaryRevision=3;const calls={stats:0,list:0,map:0,landmarks:0};
  const primaryStore=kind=>({getState:()=>({...primaryStatus[kind],records:structuredClone(primary[kind]),revision:primaryRevision}),context:()=>({revision:primaryRevision}),canEdit:()=>true,
    async save(records,ctx){assert.equal(ctx.revision,primaryRevision);primary[kind]=(kind==='regions'?validateRecords:validateLandmarks)(structuredClone(records));primaryRevision++;writes.push({kind,id:'self'});if(kind==='landmarks')landmarkOptions.onChange();else context.syncMemberRecords();return {ok:true};}});
  const primaryRegions=primaryStore('regions'),primaryLandmarks=primaryStore('landmarks');
  const family={getState:()=>structuredClone(state),context:()=>({revision:state.revision}),canEdit:()=>true,
    async saveRecords(kind,id,records,ctx){assert.equal(ctx.revision,state.revision);state.document[kind][id]=(kind==='regions'?validateRecords:validateLandmarks)(structuredClone(records));state.revision++;writes.push({kind,id});familyOptions.onChange();return {ok:true};}};
  context={R,model,chinaIndex,landmarkCatalog:catalog,$:el,records:{},primaryRecords:{},primaryLandmarkStore:null,familyStore:null,landmarkStore:null,cloud:null,currentView:'map',selectionVersion:0,
    familyUI:{activeId:()=>active,visibleIds:()=>['self',A,B],render(){}},landmarkUI:{render(){calls.landmarks++;}},
    renderStats(){calls.stats++;},renderList(){calls.list++;},renderMapState(){calls.map++;},renderLandmarkMap(){calls.map++;},renderCollection(){},hasOpenEditor:()=>false,resetFamilyAccount(){},
    createFamilyStore:options=>{familyOptions=options;return family;},
    createLandmarkStore:options=>{landmarkOptions=options;return guest?createLandmarkStore({...options,storage,locks:null,addEventListener(){}}):primaryLandmarks;}};
  vm.createContext(context);
  for(const name of ['currentLandmarkRecords','visitedCountryCodes','renderSummary','timelineEntries','refreshLandmarkViews','renderAll','syncMemberRecords'])vm.runInContext(productionFunction(name),context);
  vm.runInContext(initializer('familyStore')+initializer('primaryLandmarkStore'),context);
  const adapter=kind=>createFamilyArchiveAdapter({kind,primary:kind==='regions'?primaryRegions:context.primaryLandmarkStore,family,getMemberId:()=>active,getSelectionVersion:()=>context.selectionVersion});
  context.cloud=adapter('regions');context.landmarkStore=adapter('landmarks');
  context.visits=()=>R.recordsWithFeatures(context.records,model).filter(feature=>!feature.properties.prefectureTarget);
  context.syncMemberRecords();
  return {context,el,primary,primaryStatus,state,writes,calls,storageData,
    codes:()=>Array.from(context.visitedCountryCodes()).sort(),count:()=>Number(el('#province-count').textContent),
    setSelf(regions,landmarks){assert.equal(guest,false);primary.regions=structuredClone(regions);primary.landmarks=structuredClone(landmarks);context.syncMemberRecords();},
    select(id){active=id;context.selectionVersion++;context.syncMemberRecords();},
    async saveLandmarks(records){const result=await context.landmarkStore.save(records,context.landmarkStore.context());assert.equal(result.ok,true);}};
}

test('landmark-only visits to Japan and Vatican increase countries without changing city totals or China progress',()=>{
  const h=harness();h.setSelf({},{[NARA]:landmarkRow(),[VAT]:landmarkRow()});
  assert.deepEqual(h.codes(),['JPN','VAT']);assert.equal(h.count(),2);
  assert.equal(Number(h.el('#city-count').textContent),0);assert.equal(Number(h.el('#progress-count').textContent),0);
});

test('city and landmark visits in the same country are counted once, including a landmark in multiple themes',()=>{
  const h=harness();h.setSelf({[NARA_CITY]:row(),[CHINA_CITY]:row()},{});
  const cityTotal=h.el('#city-count').textContent,progress=h.el('#progress-count').textContent,ring=h.el('#progress-ring').style.background;
  h.primary.landmarks={[NARA]:landmarkRow(),[TAISHAN]:landmarkRow()};h.context.refreshLandmarkViews();
  assert.equal(catalog.byId.get(TAISHAN).themeIds.length,2);assert.deepEqual(h.codes(),['CHN','JPN']);assert.equal(h.count(),2);
  assert.equal(h.el('#city-count').textContent,cityTotal);assert.equal(h.el('#progress-count').textContent,progress);assert.equal(h.el('#progress-ring').style.background,ring);
});

test('wishes, non-visited records, and unknown landmark IDs do not add a country',()=>{
  const h=harness();h.setSelf({},{[NARA]:landmarkRow('wish'),[VAT]:landmarkRow('unvisited'),'poi:FRA:unknown-saved-place':landmarkRow()});
  assert.deepEqual(h.codes(),[]);assert.equal(h.count(),0);
  h.primary.landmarks[NARA]=landmarkRow();h.context.refreshLandmarkViews();assert.deepEqual(h.codes(),['JPN']);
});

test('cross-border landmarks count only their catalog primary country, not every geographic association',()=>{
  const h=harness();assert.ok(catalog.byId.get(ALPS).countryCodes.length>2);assert.deepEqual(catalog.byId.get(JERUSALEM).countryCodes,['PSX','ISR']);
  h.setSelf({},{[ALPS]:landmarkRow(),[JERUSALEM]:landmarkRow()});
  assert.deepEqual(h.codes(),['CHE','PSX']);assert.equal(h.count(),2);
});

test('Hong Kong, Macao, and Taiwan country aliases normalize through the existing China navigation mapping',()=>{
  const h=harness(),codes=['HKG','MAC','TWN'];
  for(const code of codes)assert.equal(model.countries.get(code).navigationCountry,'CHN');
  h.context.landmarkCatalog={places:codes.map(code=>({id:'poi:'+code+':summary-fixture',countryCode:code}))};
  h.setSelf({'810000':row(),'820000':row(),'tw-63000':row()},Object.fromEntries(codes.map(code=>['poi:'+code+':summary-fixture',landmarkRow()])));
  assert.deepEqual(h.codes(),['CHN']);assert.equal(h.count(),1);
  h.primary.landmarks={};h.context.visits=()=>codes.map(countryCode=>({properties:{countryCode,level:'legacy'}}));h.context.renderSummary();
  assert.deepEqual(h.codes(),['CHN'],'legacy geographic codes normalize on the region side too');
});

test('the selected member alone supplies country counts even when all family flags are visible',()=>{
  const h=harness();h.setSelf({},{[NARA]:landmarkRow()});
  h.state.document.landmarks[A]={[VAT]:landmarkRow()};h.state.document.landmarks[B]={[TAISHAN]:landmarkRow()};
  const before=structuredClone({primary:h.primary,document:h.state.document});
  assert.deepEqual(h.codes(),['JPN']);h.select(A);assert.deepEqual(h.codes(),['VAT']);h.select(B);assert.deepEqual(h.codes(),['CHN']);h.select('self');assert.deepEqual(h.codes(),['JPN']);
  assert.deepEqual({primary:h.primary,document:h.state.document},before);assert.equal(h.writes.length,0);
});

test('unready or mismatched account state excludes landmarks from both summary and timeline until both archives agree',()=>{
  const h=harness();h.setSelf({},{[NARA]:landmarkRow()});
  assert.equal(h.primaryStatus.regions.guest,undefined);assert.equal(h.primaryStatus.landmarks.guest,false);assert.equal(h.count(),1);
  const original=structuredClone(h.primaryStatus);
  for(const [kind,patch]of [['landmarks',{ready:false}],['regions',{ready:false}],['landmarks',{userId:'previous-user'}],['landmarks',{guest:true}]]){
    Object.assign(h.primaryStatus.regions,original.regions);Object.assign(h.primaryStatus.landmarks,original.landmarks);Object.assign(h.primaryStatus[kind],patch);h.context.refreshLandmarkViews();
    assert.equal(h.count(),0);assert.equal(h.context.timelineEntries().filter(entry=>entry.kind==='landmark').length,0);
  }
  Object.assign(h.primaryStatus.regions,original.regions,{busy:true});Object.assign(h.primaryStatus.landmarks,original.landmarks,{busy:true});h.context.refreshLandmarkViews();
  assert.equal(h.count(),1);assert.equal(h.context.timelineEntries().filter(entry=>entry.kind==='landmark').length,1);
});

test('the primary store callback refreshes the homepage number after saving or cancelling while the timeline is hidden',async()=>{
  const h=harness();h.context.currentView='passport';const before=h.calls.stats;
  await h.saveLandmarks({[NARA]:landmarkRow(),[VAT]:landmarkRow()});assert.equal(h.count(),2);
  await h.saveLandmarks({[NARA]:landmarkRow('wish'),[VAT]:landmarkRow()});assert.equal(h.count(),1);
  await h.saveLandmarks({});assert.equal(h.count(),0);assert.equal(h.calls.stats,before);assert.deepEqual(h.writes.map(write=>write.id),['self','self','self']);
});

test('a real temporary landmark store updates country counts through the production callback and retains its local archive',async()=>{
  const h=harness({guest:true});assert.equal(h.context.primaryLandmarkStore.getState().guest,true);
  await h.saveLandmarks({[NARA]:landmarkRow()});assert.equal(h.count(),1);assert.equal(h.el('#city-count').textContent,0);
  assert.deepEqual(JSON.parse(h.storageData.get(KEY)).records,{[NARA]:landmarkRow()});
  await h.saveLandmarks({});assert.equal(h.count(),0);assert.deepEqual(JSON.parse(h.storageData.get(KEY)).records,{});assert.equal(h.calls.stats,0);
});

test('child landmark saves and cancellations refresh only that member without altering other family archives',async()=>{
  const h=harness();h.setSelf({},{[NARA]:landmarkRow()});h.state.document.landmarks[A]={[VAT]:landmarkRow()};
  const other=structuredClone({primary:h.primary,a:h.state.document.landmarks[A],regions:h.state.document.regions});h.select(B);
  await h.saveLandmarks({[TAISHAN]:landmarkRow(),[VAT]:landmarkRow()});assert.deepEqual(h.codes(),['CHN','VAT']);assert.equal(h.count(),2);
  await h.saveLandmarks({[TAISHAN]:landmarkRow()});assert.equal(h.count(),1);assert.deepEqual(h.codes(),['CHN']);
  assert.deepEqual({primary:h.primary,a:h.state.document.landmarks[A],regions:h.state.document.regions},other);assert.deepEqual(h.writes.map(write=>write.id),[B,B]);
});
