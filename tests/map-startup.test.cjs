'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../region-model.js'),{createLoader}=require('../map-data-loader.js');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',name),'utf8'));
const assetCache=new Map();
const asset=name=>{if(!assetCache.has(name))assetCache.set(name,read(name));return assetCache.get(name);};
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function productionFunction(name){
  const start=source.search(new RegExp('^(?:async )?function '+name+'\\(','m'));
  assert.ok(start>=0,'production '+name+' exists');let text='';
  for(const line of source.slice(start).split('\n').slice(0,150)){
    text+=line+'\n';
    try{new vm.Script(text);return text;}catch(error){if(!(error instanceof SyntaxError))throw error;}
  }
  assert.fail('could not extract production '+name);
}

function harness(){
  const requests=new Map(),elements=new Map(),controls=['[data-view]','#cloud-account-btn','#export-btn','#coverage-btn','#world-shortcut','#china-shortcut','#focus-taiwan','#open-city-picker','#city-search','#country-filter','#province-filter','#status-filter','#landmark-map-toggle','#landmark-map-theme','#landmark-map-status'];
  const events=[],errors=[],messages=[];let modalCount=0,starts=0,viewport={k:1,x:0,y:0};
  const el=selector=>{
    if(!elements.has(selector))elements.set(selector,{disabled:false,hidden:false,value:'',textContent:'',innerHTML:'',attrs:{},setAttribute(key,value){this.attrs[key]=value;},showModal(){modalCount++;}});
    return elements.get(selector);
  };
  const mapData=createLoader({fetch:url=>{const gate=deferred();requests.set(url.split('?')[0],gate);return gate.promise;}});
  const zoom={transform(_selection,transform){viewport=transform;}};
  const svg={node:()=>({}),call(fn,...args){fn(svg,...args);return svg;}};
  const store=()=>({getState:()=>({records:{},ready:true,guest:true}),canEdit:()=>true,start:async()=>{},rememberIntent(){}});
  const context={R,mapData,$:el,document:{querySelectorAll:selector=>selector.split(',').map(el),querySelector:()=>null},
    world:[],provinces:[],features:[],model:undefined,scope:{kind:'world'},shapes:[],contextShapes:[],mapRequest:0,geometryCache:new Map(),
    svg,zoom,d3:{zoomTransform:()=>viewport},records:{},primaryRecords:{},cloud:null,primaryCloud:null,landmarkUI:null,familyUI:null,selectionVersion:0,detailBusy:false,
    console:{error:error=>errors.push(error)},location:{reload:()=>events.push('reload')},
    drawMap(){events.push({type:'draw',modelReady:Boolean(context.model),count:context.shapes.length});viewport={k:1,x:0,y:0};el('#map-loading').hidden=true;},
    renderAll(){assert.ok(context.model&&context.cloud,'normal rendering waits for complete stores');events.push('renderAll');},
    paintNavigation:()=>events.push('navigation'),configureProvinceFilter(){},resetList(){},setMapTouch(){},
    ShanheCityCatalog:{createSearch:features=>{assert.ok(features.length>20000);return {}; }},
    ShanheLandmarks:{catalog:()=>({})},SHANHE_LANDMARK_CATALOG:{},
    createFamilyStore:store,createLandmarkStore:store,createFamilyUI:()=>({}),createLandmarkUI:()=>({}),createLandmarkMap:()=>({}),
    createFamilyArchiveAdapter:store,createShanheCloud:()=>({...store(),start(){starts++;events.push('cloud');}}),
    syncMemberRecords(){},resetFamilyAccount(){},refreshLandmarkViews(){},changeRecordMember(){},renderSummary(){},renderMapState(){},
    activeMemberId:()=> 'self',focusLandmark(){},goView(){},mapMemberEntries(){},openLandmarkFromMap(){},readLocalRecords:()=>({}),
    toast:message=>messages.push(message),esc:value=>String(value),focusRegion(){},openWorldRegion:()=>{modalCount++;}
  };
  vm.createContext(context);
  for(const name of ['jsonFile','navigate','openShape','openCity','init'])vm.runInContext(productionFunction(name),context);
  const release=name=>{const gate=requests.get(name);assert.ok(gate,'requested '+name);gate.resolve({ok:true,status:200,json:async()=>asset(name)});};
  const overviewNames=['assets/geo/world.geo.json','assets/geo/world-france-parts.geo.json'];
  return {context,el,requests,events,errors,messages,controls,
    run:()=>context.init(),release,releaseOverview:()=>overviewNames.forEach(release),
    releaseCatalog:()=>{for(const name of requests.keys())if(!overviewNames.includes(name))release(name);},
    locked:()=>controls.every(selector=>el(selector).disabled),
    setViewport:transform=>{viewport=transform;},viewport:()=>viewport,starts:()=>starts,modalCount:()=>modalCount
  };
}

test('production init displays the world before catalog completion and keeps editing locked',async()=>{
  const h=harness(),running=h.run();await tick();
  assert.equal(h.requests.size,12);assert.ok(h.locked());
  h.releaseOverview();await tick();
  assert.equal(h.events.filter(event=>event.type==='draw').length,1);
  assert.equal(h.events[0].modelReady,false);assert.equal(h.context.world.length,263);
  assert.equal(h.context.model,undefined);assert.equal(h.starts(),0);assert.ok(h.locked());
  assert.equal(h.el('#map-loading').hidden,true);assert.equal(h.el('#startup-status').hidden,false);
  h.context.openShape(h.context.world[0]);h.context.openCity('110000');
  assert.equal(h.modalCount(),0);assert.equal(h.messages.length,2);
  const preview={k:3.5,x:-240,y:120};h.setViewport(preview);
  h.releaseCatalog();await running;
  assert.equal(h.errors.length,0);assert.equal(h.starts(),1);assert.ok(h.context.model.features.length>20000);
  assert.equal(h.events.filter(event=>event.type==='draw').length,2);
  assert.equal(h.events.filter(event=>event.type==='draw')[1].modelReady,true);
  assert.equal(h.viewport(),preview,'finishing startup restores the exact preview pan and zoom');
  assert.ok(h.controls.every(selector=>!h.el(selector).disabled));
  assert.equal(h.el('#city-list').attrs['aria-busy'],'false');assert.equal(h.el('#startup-status').hidden,true);
  assert.equal(h.events.at(-1),'renderAll');
});

test('catalog failure before the overview settles is handled without starting cloud or opening editors',async()=>{
  const h=harness(),unhandled=[],onUnhandled=error=>unhandled.push(error);process.on('unhandledRejection',onUnhandled);
  try{
    const running=h.run();await tick();
    h.requests.get('assets/geo/us-cities.json').reject(new Error('catalog unavailable'));
    await tick();await tick();assert.deepEqual(unhandled,[]);assert.equal(h.errors.length,0);
    h.releaseOverview();await running;
    assert.equal(h.events.filter(event=>event.type==='draw').length,1);
    assert.equal(h.starts(),0);assert.equal(h.context.cloud,null);assert.equal(h.context.model,undefined);assert.ok(h.locked());
    h.context.openShape(h.context.world[0]);h.context.openCity('110000');assert.equal(h.modalCount(),0);
    assert.match(h.el('#startup-status').innerHTML,/retry-startup/);assert.equal(h.errors.length,1);
    h.el('#retry-startup').onclick();assert.equal(h.events.at(-1),'reload');
    h.releaseCatalog();await tick();assert.deepEqual(unhandled,[]);
  }finally{process.removeListener('unhandledRejection',onUnhandled);}
});

test('overview failure leaves controls locked and later catalog failure cannot reject unhandled',async()=>{
  const h=harness(),unhandled=[],onUnhandled=error=>unhandled.push(error);process.on('unhandledRejection',onUnhandled);
  try{
    const running=h.run();await tick();
    h.requests.get('assets/geo/world.geo.json').reject(new Error('overview unavailable'));
    await running;
    assert.equal(h.starts(),0);assert.equal(h.events.filter(event=>event.type==='draw').length,0);assert.ok(h.locked());
    assert.match(h.el('#map-loading').innerHTML,/retry-startup/);
    h.requests.get('assets/geo/us-cities.json').reject(new Error('catalog also unavailable'));
    h.releaseOverview();h.releaseCatalog();await tick();await tick();
    assert.deepEqual(unhandled,[]);assert.equal(h.errors.length,1);
  }finally{process.removeListener('unhandledRejection',onUnhandled);}
});

test('the preview rendering guard never reads record state before a model exists',()=>{
  const context={model:undefined,cityShapes:{},mapVisits:()=>assert.fail('preview must not read incomplete records')};
  vm.createContext(context);vm.runInContext(productionFunction('renderMapState'),context);
  context.renderMapState();
});

test('HTML preloads and the overview loader use the same high-priority fetch URLs',async()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const preloads=[...html.matchAll(/<link\b[^>]*\brel="preload"[^>]*>/g)].map(match=>match[0]).filter(tag=>/\bas="fetch"/.test(tag));
  const requests=[];
  await createLoader({fetch:async(url,options)=>{requests.push([url,options.priority]);return {ok:true,json:async()=>({})};}}).overview();
  for(const [url,priority] of requests){
    const tag=preloads.find(tag=>tag.includes('href="'+url+'"'));
    assert.ok(tag,'HTML preloads the exact loader URL '+url);
    assert.equal(priority,'high');assert.match(tag,/\bfetchpriority="high"/);
    assert.match(tag,/\bcrossorigin(?:\s|=|>)/,'fetch preload uses the same CORS mode as fetch');
  }
});
