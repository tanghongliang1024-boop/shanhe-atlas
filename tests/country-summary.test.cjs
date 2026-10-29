'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../region-model.js'),L=require('../landmark-model.js');
const {createFamilyArchiveAdapter}=require('../family-adapter.js');
const {validateRecords}=require('../cloud-store.js');
const {createLandmarkStore,validateRecords:validateLandmarks,KEY}=require('../landmark-store.js');
const {COLORS}=require('../family-store.js');
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
  const elements=new Map(),el=selector=>{if(!elements.has(selector))elements.set(selector,{textContent:'',innerHTML:'',hidden:false,style:{}});return elements.get(selector);};
  const primary={regions:{},landmarks:{}},primaryStatus={regions:{userId:guest?null:'test-summary-account',ready:true,busy:false,...(guest?{guest:true}:{})},landmarks:{userId:guest?null:'test-summary-account',ready:true,busy:false,guest}};
  const state={document:{version:1,members:guest?[{id:'self',name:'我',color:'terracotta'}]:[{id:'self',name:'家长',color:'terracotta'},{id:A,name:'甲',color:'blue'},{id:B,name:'乙',color:'purple'}],regions:{[A]:{},[B]:{}},landmarks:{[A]:{},[B]:{}}},userId:guest?null:'test-summary-account',guest,ready:true,busy:false,error:null,revision:5};
  const writes=[],storageData=new Map(),storage={getItem:key=>storageData.get(key)??null,setItem:(key,value)=>storageData.set(key,value)};
  let active='self',visible=['self'],context,familyOptions,landmarkOptions,familyUIOptions,primaryRevision=3;const calls={stats:0,list:0,map:0,landmarks:0};
  const familyUI={activeId:()=>active,visibleIds:()=>visible,render(){}};
  const primaryStore=kind=>({getState:()=>({...primaryStatus[kind],records:structuredClone(primary[kind]),revision:primaryRevision}),context:()=>({revision:primaryRevision}),canEdit:()=>true,
    async save(records,ctx){assert.equal(ctx.revision,primaryRevision);primary[kind]=(kind==='regions'?validateRecords:validateLandmarks)(structuredClone(records));primaryRevision++;writes.push({kind,id:'self'});if(kind==='landmarks')landmarkOptions.onChange();else context.syncMemberRecords();return {ok:true};}});
  const primaryRegions=primaryStore('regions'),primaryLandmarks=primaryStore('landmarks');
  const family={getState:()=>structuredClone(state),context:()=>({revision:state.revision}),canEdit:()=>true,
    async saveRecords(kind,id,records,ctx){assert.equal(ctx.revision,state.revision);state.document[kind][id]=(kind==='regions'?validateRecords:validateLandmarks)(structuredClone(records));state.revision++;writes.push({kind,id});familyOptions.onChange();return {ok:true};}};
  context={R,model,chinaIndex,ShanheFamily:{COLORS},landmarkCatalog:catalog,$:el,records:{},primaryRecords:{},primaryCloud:primaryRegions,primaryLandmarkStore:null,familyStore:null,landmarkStore:null,cloud:null,currentView:'map',selectionVersion:0,
    familyUI,landmarkUI:{render(){calls.landmarks++;}},toast(){},changeRecordMember(){},
    renderStats(){calls.stats++;},renderList(){calls.list++;},renderMapState(){calls.map++;},renderLandmarkMap(){calls.map++;},renderCollection(){},hasOpenEditor:()=>false,resetFamilyAccount(){},
    createFamilyStore:options=>{familyOptions=options;return family;},
    createFamilyUI:options=>{familyUIOptions=options;return familyUI;},
    createLandmarkStore:options=>{landmarkOptions=options;return guest?createLandmarkStore({...options,storage,locks:null,addEventListener(){}}):primaryLandmarks;}};
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('const icon='),source.indexOf('const R=')),context);
  for(const name of ['currentLandmarkRecords','visitedCountryCodes','summaryMemberEntries','renderSummary','timelineEntries','refreshLandmarkViews','renderAll','syncMemberRecords'])vm.runInContext(productionFunction(name),context);
  vm.runInContext(initializer('familyStore')+initializer('primaryLandmarkStore')+initializer('familyUI'),context);
  const adapter=kind=>createFamilyArchiveAdapter({kind,primary:kind==='regions'?primaryRegions:context.primaryLandmarkStore,family,getMemberId:()=>active,getSelectionVersion:()=>context.selectionVersion});
  context.cloud=adapter('regions');context.landmarkStore=adapter('landmarks');
  context.visits=()=>R.recordsWithFeatures(context.records,model).filter(feature=>!feature.properties.prefectureTarget);
  context.syncMemberRecords();
  const rows=metric=>[...el('#summary-'+metric).innerHTML.matchAll(/<li\b([^>]*data-summary-member="([^"]+)"[^>]*)>([\s\S]*?)<\/li>/g)].map(match=>({id:match[2],attributes:match[1],html:match[3],value:(match[3].match(/<strong\b[^>]*>([\s\S]*?)<\/strong>/)||[])[1]}));
  const metric=(kind,id='self')=>{const value=rows(kind).find(entry=>entry.id===id)?.value;if(value==null)return undefined;const stripped=value.replace(/<[^>]*>/g,'').replace('%','').trim();return stripped!==''&&Number.isFinite(Number(stripped))?Number(stripped):undefined;};
  return {context,el,primary,primaryStatus,state,writes,calls,storageData,
    rows,metric,codes:()=>Array.from(context.visitedCountryCodes()).sort(),count:(id='self')=>metric('countries',id),active:()=>active,
    setSelf(regions,landmarks){assert.equal(guest,false);primary.regions=structuredClone(regions);primary.landmarks=structuredClone(landmarks);context.syncMemberRecords();},
    select(id){active=id;context.selectionVersion++;context.syncMemberRecords();},
    show(ids){visible=[...ids];familyUIOptions.onVisibilityChange();},
    async savePrimaryLandmarks(records){const result=await context.primaryLandmarkStore.save(records,context.primaryLandmarkStore.context());assert.equal(result.ok,true);},
    async saveMemberLandmarks(id,records){const result=await family.saveRecords('landmarks',id,records,family.context());assert.equal(result.ok,true);},
    async saveLandmarks(records){const result=await context.landmarkStore.save(records,context.landmarkStore.context());assert.equal(result.ok,true);}};
}

test('landmark-only visits to Japan and Vatican increase countries without changing city totals or China progress',()=>{
  const h=harness();h.setSelf({},{[NARA]:landmarkRow(),[VAT]:landmarkRow()});
  assert.deepEqual(h.codes(),['JPN','VAT']);assert.equal(h.count(),2);
  assert.equal(h.metric('regions'),0);assert.equal(h.metric('progress'),0);
});

test('city and landmark visits in the same country are counted once, including a landmark in multiple themes',()=>{
  const h=harness();h.setSelf({[NARA_CITY]:row(),[CHINA_CITY]:row()},{});
  const cityTotal=h.metric('regions'),progress=h.metric('progress');
  h.primary.landmarks={[NARA]:landmarkRow(),[TAISHAN]:landmarkRow()};h.context.refreshLandmarkViews();
  assert.equal(catalog.byId.get(TAISHAN).themeIds.length,2);assert.deepEqual(h.codes(),['CHN','JPN']);assert.equal(h.count(),2);
  assert.equal(h.metric('regions'),cityTotal);assert.equal(h.metric('progress'),progress);
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

test('each checked member has independent statistics while the default country helper still describes the active editor',()=>{
  const h=harness();h.setSelf({},{[NARA]:landmarkRow()});
  h.state.document.landmarks[A]={[VAT]:landmarkRow()};h.state.document.landmarks[B]={[TAISHAN]:landmarkRow()};
  const before=structuredClone({primary:h.primary,document:h.state.document});h.show(['self',A,B]);
  for(const kind of ['regions','countries','progress'])assert.deepEqual(h.rows(kind).map(entry=>entry.id),['self',A,B]);
  assert.deepEqual(['self',A,B].map(id=>h.count(id)),[1,1,1]);
  assert.deepEqual(h.codes(),['JPN']);h.select(A);assert.deepEqual(h.codes(),['VAT']);h.select(B);assert.deepEqual(h.codes(),['CHN']);h.select('self');assert.deepEqual(h.codes(),['JPN']);
  assert.deepEqual(['self',A,B].map(id=>h.count(id)),[1,1,1]);
  assert.deepEqual({primary:h.primary,document:h.state.document},before);assert.equal(h.writes.length,0);
});

test('unready or mismatched account state excludes landmarks from both summary and timeline until both archives agree',()=>{
  const h=harness();h.setSelf({},{[NARA]:landmarkRow()});
  assert.equal(h.primaryStatus.regions.guest,undefined);assert.equal(h.primaryStatus.landmarks.guest,false);assert.equal(h.count(),1);
  const original=structuredClone(h.primaryStatus);
  for(const [kind,patch]of [['landmarks',{ready:false}],['regions',{ready:false}],['landmarks',{userId:'previous-user'}],['landmarks',{guest:true}]]){
    Object.assign(h.primaryStatus.regions,original.regions);Object.assign(h.primaryStatus.landmarks,original.landmarks);Object.assign(h.primaryStatus[kind],patch);h.context.refreshLandmarkViews();
    assert.equal(h.count(),undefined,'unready statistics show a pending label rather than a misleading zero');
    assert.match(h.rows('countries')[0].html,/读取中/);assert.equal(h.context.timelineEntries().filter(entry=>entry.kind==='landmark').length,0);
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
  await h.saveLandmarks({[NARA]:landmarkRow()});assert.equal(h.count(),1);assert.equal(h.metric('regions'),0);
  assert.deepEqual(JSON.parse(h.storageData.get(KEY)).records,{[NARA]:landmarkRow()});
  await h.saveLandmarks({});assert.equal(h.count(),0);assert.deepEqual(JSON.parse(h.storageData.get(KEY)).records,{});assert.equal(h.calls.stats,0);
  for(const kind of ['regions','countries','progress']){assert.deepEqual(h.rows(kind).map(entry=>entry.id),['self']);assert.match(h.rows(kind)[0].html,/>我<\/span>/);}
});

test('child landmark saves and cancellations refresh only that member without altering other family archives',async()=>{
  const h=harness();h.setSelf({},{[NARA]:landmarkRow()});h.state.document.landmarks[A]={[VAT]:landmarkRow()};
  const other=structuredClone({primary:h.primary,a:h.state.document.landmarks[A],regions:h.state.document.regions});h.select(B);h.show([A,B]);
  await h.saveLandmarks({[TAISHAN]:landmarkRow(),[VAT]:landmarkRow()});assert.deepEqual(h.codes(),['CHN','VAT']);assert.equal(h.count(B),2);assert.equal(h.count(A),1);
  await h.saveLandmarks({[TAISHAN]:landmarkRow()});assert.equal(h.count(B),1);assert.deepEqual(h.codes(),['CHN']);assert.equal(h.count(A),1);
  assert.deepEqual({primary:h.primary,a:h.state.document.landmarks[A],regions:h.state.document.regions},other);assert.deepEqual(h.writes.map(write=>write.id),[B,B]);
});

test('visible-member changes update all three lists without selecting a different editor or falling back when none are checked',()=>{
  const h=harness();h.setSelf({[NARA_CITY]:row()},{[NARA]:landmarkRow()});h.state.document.landmarks[A]={[VAT]:landmarkRow()};h.state.document.landmarks[B]={[TAISHAN]:landmarkRow()};
  h.select(B);const before=structuredClone({primary:h.primary,document:h.state.document}),maps=h.calls.map;
  h.show([A]);assert.equal(h.active(),B);assert.equal(h.calls.map,maps+1,'the real visibility callback refreshes the map too');
  for(const kind of ['regions','countries','progress'])assert.deepEqual(h.rows(kind).map(entry=>entry.id),[A]);
  assert.equal(h.count(A),1);assert.equal(h.count(B),undefined);assert.equal(h.el('#summary-empty').hidden,true);
  h.show([]);for(const kind of ['regions','countries','progress'])assert.deepEqual(h.rows(kind),[]);
  assert.equal(h.el('#summary-empty').hidden,false);assert.equal(h.active(),B);
  h.show([B,'self']);for(const kind of ['regions','countries','progress'])assert.deepEqual(h.rows(kind).map(entry=>entry.id),['self',B],'rows retain the saved family order');
  assert.equal(h.el('#summary-empty').hidden,true);assert.equal(h.active(),B);assert.deepEqual({primary:h.primary,document:h.state.document},before);assert.equal(h.writes.length,0);
});

test('shared destinations are deduplicated within each member but never merged across family members',()=>{
  const h=harness();h.setSelf({[NARA_CITY]:row()},{[NARA]:landmarkRow()});
  h.state.document.regions[A]={[NARA_CITY]:row()};h.state.document.landmarks[A]={[NARA]:landmarkRow()};h.state.document.landmarks[B]={[NARA]:landmarkRow()};h.show(['self',A,B]);
  assert.deepEqual(['self',A,B].map(id=>h.count(id)),[1,1,1]);assert.deepEqual(['self',A,B].map(id=>h.metric('regions',id)),[1,1,0]);
  assert.deepEqual(['self',A,B].map(id=>h.metric('progress',id)),[0,0,0]);
  h.primary.regions[CHINA_CITY]=row();h.primary.landmarks[TAISHAN]=landmarkRow();h.context.syncMemberRecords();
  assert.deepEqual(['self',A,B].map(id=>h.count(id)),[2,1,1]);assert.deepEqual(['self',A,B].map(id=>h.metric('regions',id)),[2,1,0]);
  assert.ok(h.metric('progress','self')>0);assert.equal(h.metric('progress',A),0);assert.equal(h.metric('progress',B),0);
});

test('explicit country-helper inputs stay independent from the active editor and include each member landmarks only once',()=>{
  const h=harness();h.setSelf({},{[VAT]:landmarkRow()});
  const countries=h.context.visitedCountryCodes([model.byId.get(NARA_CITY)],{[NARA]:landmarkRow(),[TAISHAN]:landmarkRow()});
  assert.deepEqual(Array.from(countries).sort(),['CHN','JPN']);assert.deepEqual(h.codes(),['VAT']);assert.equal(h.count(),1);
});

test('background saves refresh checked non-active members while preserving the hidden editor and other archives',async()=>{
  const h=harness();h.setSelf({},{[NARA]:landmarkRow()});h.state.document.landmarks[A]={[VAT]:landmarkRow()};h.state.document.landmarks[B]={[TAISHAN]:landmarkRow()};
  h.select(B);h.show(['self',A]);const beforeB=structuredClone(h.state.document.landmarks[B]);
  await h.savePrimaryLandmarks({[NARA]:landmarkRow(),[VAT]:landmarkRow()});assert.equal(h.count(),2);assert.equal(h.count(A),1);assert.equal(h.count(B),undefined);
  await h.saveMemberLandmarks(A,{[VAT]:landmarkRow(),[ALPS]:landmarkRow()});assert.equal(h.count(),2);assert.equal(h.count(A),2);
  await h.savePrimaryLandmarks({});assert.equal(h.count(),0);assert.equal(h.count(A),2);
  await h.saveMemberLandmarks(A,{});assert.equal(h.count(A),0);assert.equal(h.active(),B);assert.deepEqual(h.state.document.landmarks[B],beforeB);
});

test('family and primary account transitions retain checked member rows but never show mismatched-account totals',()=>{
  const h=harness();h.setSelf({[NARA_CITY]:row()},{[NARA]:landmarkRow()});h.state.document.landmarks[A]={[VAT]:landmarkRow()};h.state.document.landmarks[B]={[TAISHAN]:landmarkRow()};h.show(['self',A,B]);
  const originalFamilyUser=h.state.userId;h.state.userId='previous-account';h.context.renderSummary();
  for(const kind of ['regions','countries','progress']){assert.deepEqual(h.rows(kind).map(entry=>entry.id),['self',A,B]);for(const id of ['self',A,B])assert.equal(h.metric(kind,id),undefined);}
  h.state.userId=originalFamilyUser;h.state.ready=false;h.context.renderSummary();assert.deepEqual(h.rows('countries').map(entry=>entry.id),['self',A,B]);assert.equal(h.count(),1);assert.equal(h.count(A),undefined);assert.equal(h.count(B),undefined);
  h.state.ready=true;h.primaryStatus.regions.ready=false;h.context.renderSummary();
  for(const kind of ['regions','countries','progress']){assert.deepEqual(h.rows(kind).map(entry=>entry.id),['self',A,B]);for(const id of ['self',A,B])assert.equal(h.metric(kind,id),undefined);for(const entry of h.rows(kind))assert.match(entry.html,/读取中/);}
  h.primaryStatus.regions.ready=true;h.primaryStatus.regions.userId='new-account';h.context.renderSummary();
  assert.equal(h.count(),undefined);assert.deepEqual(h.rows('countries').map(entry=>entry.id),['self',A,B]);
  h.show([A,B]);for(const kind of ['regions','countries','progress']){assert.deepEqual(h.rows(kind).map(entry=>entry.id),[A,B]);for(const entry of h.rows(kind))assert.match(entry.html,/读取中/);}assert.equal(h.el('#summary-empty').hidden,true);
  h.primaryStatus.regions.userId=originalFamilyUser;h.context.renderSummary();assert.deepEqual(h.rows('countries').map(entry=>entry.id),[A,B]);assert.deepEqual([h.count(A),h.count(B)],[1,1]);
});

test('a newly selected family account cannot display the previous primary account totals even when both primary stores still agree',()=>{
  const h=harness(),newChild='cccccccc-cccc-4ccc-8ccc-cccccccccccc';h.setSelf({[NARA_CITY]:row(),[CHINA_CITY]:row()},{[NARA]:landmarkRow()});assert.equal(h.count(),2);
  h.state.userId='next-family-account';h.state.document.members=[{id:'self',name:'新账号家长',color:'terracotta'},{id:newChild,name:'新账号孩子',color:'gold'}];
  h.state.document.regions={[newChild]:{}};h.state.document.landmarks={[newChild]:{[VAT]:landmarkRow()}};h.show(['self',newChild]);
  assert.equal(h.primaryStatus.regions.userId,h.primaryStatus.landmarks.userId,'both primary stores still hold the old account');
  for(const kind of ['regions','countries','progress']){assert.deepEqual(h.rows(kind).map(entry=>entry.id),['self',newChild]);assert.equal(h.metric(kind),undefined);assert.equal(h.metric(kind,newChild),undefined);}
  assert.match(h.rows('countries')[0].html,/新账号家长/);assert.match(h.rows('countries')[0].html,/读取中/);assert.equal(h.el('#summary-empty').hidden,true);
  h.primaryStatus.regions.userId='next-family-account';h.primary.regions={};h.context.renderSummary();
  assert.equal(h.count(),undefined,'the new family and regions must not use the previous primary landmark archive');assert.equal(h.count(newChild),1);
  h.primaryStatus.landmarks.userId='next-family-account';h.primary.landmarks={[VAT]:landmarkRow()};h.context.renderSummary();
  assert.equal(h.count(),1);assert.equal(h.count(newChild),1);assert.equal(h.metric('regions'),0);assert.equal(h.metric('progress'),0);assert.equal(h.writes.length,0);
});

test('a checked child remains visible as loading while the same-account family archive is not ready',()=>{
  const h=harness();h.state.document.landmarks[A]={[VAT]:landmarkRow()};h.show([A]);assert.equal(h.count(A),1);
  h.state.ready=false;h.context.renderSummary();
  for(const kind of ['regions','countries','progress']){assert.deepEqual(h.rows(kind).map(entry=>entry.id),[A]);assert.equal(h.metric(kind,A),undefined);assert.match(h.rows(kind)[0].html,/读取中/);}
  assert.equal(h.el('#summary-empty').hidden,true,'the user already checked a member and must not be asked to check one again');assert.equal(h.active(),'self');
  h.state.ready=true;h.context.renderSummary();assert.equal(h.count(A),1);assert.equal(h.el('#summary-empty').hidden,true);
});

test('per-member names are escaped and each row uses that member color consistently across statistics',()=>{
  const h=harness();h.state.document.members[1].name='<甲 & "孩子">';h.show([A]);
  for(const kind of ['regions','countries','progress']){
    const entry=h.rows(kind)[0];assert.match(entry.html,/&lt;甲 &amp; &quot;孩子&quot;&gt;/);assert.doesNotMatch(entry.html,/<甲/);
    assert.match(entry.attributes,new RegExp('--member-color:'+COLORS.find(color=>color.id==='blue').hex));assert.equal(h.metric(kind,A),0);
  }
});

test('all four family members retain separate rows and saved totals during a background refresh',()=>{
  const h=harness(),fourth='cccccccc-cccc-4ccc-8ccc-cccccccccccc';h.setSelf({},{[NARA]:landmarkRow()});
  h.state.document.members.push({id:fourth,name:'第三位孩子',color:'gold'});h.state.document.regions[fourth]={[CHINA_CITY]:row()};h.state.document.landmarks[fourth]={[TAISHAN]:landmarkRow(),[VAT]:landmarkRow()};
  h.state.document.landmarks[A]={[VAT]:landmarkRow()};h.state.document.landmarks[B]={[ALPS]:landmarkRow()};
  h.show(['self',A,B,fourth]);h.state.busy=true;h.primaryStatus.regions.busy=true;h.primaryStatus.landmarks.busy=true;h.context.renderSummary();
  for(const kind of ['regions','countries','progress'])assert.deepEqual(h.rows(kind).map(entry=>entry.id),['self',A,B,fourth]);
  assert.deepEqual(['self',A,B,fourth].map(id=>h.count(id)),[1,1,1,2]);assert.deepEqual(['self',A,B,fourth].map(id=>h.metric('regions',id)),[0,0,0,1]);
  assert.match(h.rows('countries')[3].attributes,new RegExp('--member-color:'+COLORS.find(color=>color.id==='gold').hex));assert.equal(h.active(),'self');assert.equal(h.writes.length,0);
});
