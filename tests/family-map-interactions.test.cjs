'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../region-model.js'),F=require('../family-map-model.js'),L=require('../landmark-model.js'),C=require('../city-catalog.js');
const {createFamilyArchiveAdapter}=require('../family-adapter.js');
const {validateRecords}=require('../cloud-store.js');
const {validateRecords:validateLandmarks}=require('../landmark-store.js');
const {COLORS}=require('../family-store.js');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../assets',name),'utf8'));
const model=R.catalog(read('geo/china-prefecture-index.json'),read('geo/world-index.json'),[],null,read('geo/world-cities.json'));
const world=read('geo/world.geo.json').features,source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const extract=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a);assert.ok(a>=0&&b>a,start);return source.slice(a,b);};
const oneFunction=name=>{const match=source.match(new RegExp('^function '+name+'\\([^\\n]+$','m'));assert.ok(match,'production '+name+' remains available');return match[0];};
const A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const LUCERNE='world:CHE:city-1159133953',BERN=model.citiesByCountry.get('CHE').find(f=>R.id(f)!==LUCERNE).properties.adcode,NARA='poi:JPN:nara';
const place=require('../landmark-catalog.js').places.find(p=>p.name==='奈良');assert.equal(place.id,NARA);
const catalog=L.catalog({version:1,places:[{...place,themeIds:['test']}],themes:[{id:'test',name:'测试景点',placeIds:[NARA]}]});
const row=note=>({visited:true,date:'2020-02-29',note,updatedAt:'2026-10-29T01:02:03.000Z'});
const landmarkRow=note=>({status:'visited',date:'2021-03-04',note,updatedAt:'2026-10-29T02:03:04.000Z'});

// Retain SVG nodes and bubble events through the actual parent tree. This lets
// the production renderer attach its real handlers to flags and city dots.
class SvgNode{constructor(tag,parent=null,datum){Object.assign(this,{tag,parent,datum,children:[],attributes:{},styles:{},events:{}});}}
const descendants=node=>node.children.flatMap(child=>[child,...descendants(child)]);
class Selection{
  constructor(nodes,parents=[]){this.nodes=nodes;this.parents=parents;}
  append(tag){return new Selection(this.nodes.map(item=>{const parent=item.placeholder?item.parent:item,node=new SvgNode(tag,parent,item.datum);parent.children.push(node);return node;}));}
  selectAll(selector){return new Selection(this.nodes.flatMap(descendants).filter(node=>selector==='*'||node.tag===selector),this.nodes);}
  data(values){this.values=values;return this;}
  join(tag){this.remove();const parent=this.parents[0];if(typeof tag==='function')return tag(new Selection(this.values.map(datum=>({placeholder:true,parent,datum}))));return new Selection(this.values.map(datum=>{const node=new SvgNode(tag,parent,datum);parent.children.push(node);return node;}));}
  attr(name,value){this.nodes.forEach(node=>node.attributes[name]=typeof value==='function'?value(node.datum):value);return this;}
  style(name,value){this.nodes.forEach(node=>node.styles[name]=typeof value==='function'?value(node.datum):value);return this;}
  classed(name,value){this.nodes.forEach(node=>{const classes=new Set(String(node.attributes.class||'').split(' ').filter(Boolean));(typeof value==='function'?value(node.datum):value)?classes.add(name):classes.delete(name);node.attributes.class=[...classes].join(' ');});return this;}
  on(name,fn){this.nodes.forEach(node=>node.events[name]=fn);return this;}
  text(value){this.nodes.forEach(node=>node.text=typeof value==='function'?value(node.datum):value);return this;}
  filter(fn){return new Selection(this.nodes.filter(node=>fn(node.datum)));}
  each(fn){this.nodes.forEach(node=>fn.call(node,node.datum));return this;}
  remove(){this.nodes.forEach(node=>{if(node.parent)node.parent.children=node.parent.children.filter(child=>child!==node);});return this;}
}
function dispatch(node,type,key){
  const event={type,key,target:node,currentTarget:null,stopped:false,prevented:false,stopPropagation(){this.stopped=true;},preventDefault(){this.prevented=true;}};
  for(let current=node;current;current=current.parent){event.currentTarget=current;current.events[type]?.(event,current.datum);if(event.stopped)break;}
  return event;
}

function harness(){
  const elements=new Map(),landmarkRadios=['unvisited','wish','visited'].map(value=>({value,checked:false}));let checkboxes=[],familyRadios=[],created=0;
  function el(selector){
    if(selector.includes('input[name="lm-state"]:checked'))return landmarkRadios.find(radio=>radio.checked);
    if(selector.includes('input[name="family-color"]:checked'))return familyRadios.find(radio=>radio.checked);
    if(!elements.has(selector)){
      let html='';const element={value:selector.endsWith('-filter')?'all':'',checked:true,innerHTML:'',textContent:'',dataset:{},style:{},hidden:false,open:false,listeners:{},children:[],
        classList:{add(){},toggle(){}},setAttribute(){},focus(){document.activeElement=this;},append(child){this.children.push(child);},
        close(){this.open=false;},showModal(){this.open=true;},reportValidity(){return true;},addEventListener(type,handler){this.listeners[type]=handler;},
        querySelectorAll(query){if(query==='input[name="lm-state"]')return landmarkRadios;if(selector==='#family-member-chips')return checkboxes;if(query==='button,input,textarea,select')return [el('#detail-visited'),el('#detail-date'),el('#detail-note'),el('#legacy-city-target')];return [];}};
      Object.defineProperty(element,'id',{set(value){elements.set('#'+value,this);},get(){return selector.slice(1);}});
      Object.defineProperty(element,'innerHTML',{get:()=>html,set(value){html=value;if(selector==='#family-member-chips')checkboxes=[...value.matchAll(/data-family-visible="([^"]+)"([^>]*)/g)].map(m=>({dataset:{familyVisible:m[1]},checked:/checked/.test(m[2]),focus(){document.activeElement=this;}}));if(selector==='#family-colors')familyRadios=[...value.matchAll(/value="([^"]+)"([^>]*)/g)].map(m=>({value:m[1],checked:/checked/.test(m[2])}));}});
      elements.set(selector,element);
    }return elements.get(selector);
  }
  const document={querySelector:el,querySelectorAll:selector=>selector==='#city-dialog,#city-picker,#region-dialog'?['#city-dialog','#city-picker','#region-dialog'].map(el):[],createElement:()=>el('#created-'+created++),body:{append(){}}};
  const members=[{id:'self',name:'家长甲',color:'terracotta'},{id:A,name:'成员乙',color:'blue'},{id:B,name:'成员丙',color:'purple'}];
  const primary={regions:{[BERN]:row('家长原记录')},landmarks:{}},state={document:{version:1,members,regions:{[A]:{[LUCERNE]:row('乙的卢塞恩原记录')},[B]:{[BERN]:row('丙的原记录')}},landmarks:{[A]:{[NARA]:landmarkRow('乙的奈良原记录')},[B]:{}}},userId:'isolated-family',guest:false,ready:true,busy:false,error:null,revision:8};
  const writes=[],notices=[],navigations=[],activeChanges=[];let selectionVersion=0,context;
  const family={getState:()=>structuredClone(state),context:()=>({userId:state.userId,revision:state.revision,epoch:1}),canEdit:()=>true,
    async saveRecords(kind,id,records,ctx){assert.equal(ctx.revision,state.revision);assert.ok([A,B].includes(id));const next=(kind==='regions'?validateRecords:validateLandmarks)(structuredClone(records));writes.push({kind,id,records:structuredClone(next)});state.document[kind][id]=next;state.revision++;context.records=context.cloud.getState().records;return {ok:true,guest:false};}};
  const primaryStore=kind=>({getState:()=>({records:structuredClone(primary[kind]),userId:state.userId,ready:true,busy:false,guest:false,revision:3}),context:()=>({revision:3}),canEdit:()=>true,async save(records){writes.push({kind,id:'self',records:structuredClone(records)});primary[kind]=structuredClone(records);return {ok:true};}});
  const primaryRegions=primaryStore('regions'),primaryLandmarks=primaryStore('landmarks');
  const svgRoot=new SvgNode('svg'),pointRoot=new SvgNode('g',svgRoot),labelRoot=new SvgNode('g',svgRoot),flagRoot=new SvgNode('g',svgRoot);svgRoot.children.push(pointRoot,labelRoot,flagRoot);
  const shape=new SvgNode('path',svgRoot,world.find(f=>f.properties.countryCode==='CHE'));svgRoot.children.unshift(shape);
  context={document,structuredClone,R,ShanheFamily:{COLORS},ShanheFamilyMap:F,ShanheLandmarks:L,ShanheCityCatalog:C,model,world,provinces:[],familyStore:family,primaryCloud:primaryRegions,primaryLandmarkStore:primaryLandmarks,primaryRecords:primary.regions,
    $:el,records:{},selected:null,detailContext:null,detailBase:{},detailBusy:false,detailOperation:0,selectionVersion:0,
    scope:{kind:'country',code:'CHE'},mode:'flag',cityShapes:new Selection([shape]),markers:new Selection([flagRoot]),southMarkers:null,countryLocators:null,cityPoints:null,mapCityVisited:new Set(),
    cityPointLayer:new Selection([pointRoot]),cityLabelLayer:new Selection([labelRoot]),citySpatial:C.createSpatial(model.citiesByCountry.get('CHE'),point=>point),cityMapPriority:new Set(),cityFocusId:null,phoneLayout:{matches:true},mapHeight:1000,projection:point=>point,
    d3:{select:node=>new Selection([node])},toast:message=>notices.push(message),showSaveResult:result=>{if(!result.ok)notices.push(result.code);},renderAll(){},renderLandmarkMap(){},updateMapOverlays(){},
    navigate:async next=>{navigations.push({next,member:context.familyUI.activeId()});context.scope=next;},focusRegion(){},openWorldRegion(){},
    isWorldLegacy:f=>f?.properties.legacyKind==='world-region',isCountryLegacy:f=>f?.properties.legacyKind==='world-country'};
  context.window=context;vm.createContext(context);
  for(const file of ['family-ui.js','landmark-ui.js','landmark-map.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../'+file),'utf8'),context);
  vm.runInContext(extract('const icon=','const R=')+extract('function closeRecordEditors(){','function toast(')+extract('function setDetailBusy(', 'function showSaveResult('),context);
  context.familyUI=context.createFamilyUI({store:family,onActiveChange:id=>{activeChanges.push(id);selectionVersion++;context.changeRecordMember();},notify:message=>notices.push(message)});
  const adapter=kind=>createFamilyArchiveAdapter({kind,primary:kind==='regions'?primaryRegions:primaryLandmarks,family,getMemberId:()=>context.familyUI.activeId(),getSelectionVersion:()=>selectionVersion});
  context.cloud=adapter('regions');context.landmarkStore=adapter('landmarks');context.landmarkUI=context.createLandmarkUI({catalog,store:context.landmarkStore,notify:message=>notices.push(message)});
  context.visits=()=>R.recordsWithFeatures(context.records,model);context.persist=(records,ctx)=>context.cloud.save(records,ctx);
  vm.runInContext(extract('function openCity(id){',"$('#close-dialog').onclick")+extract('async function saveCity(remove){',"$('#city-form').onsubmit")+extract('function openShape(f){','function openWorldRegion(id){')+
    oneFunction('openRegionFlag')+oneFunction('openLandmarkFromMap')+extract('function renderMapState(){','function renderLandmarkMap(){')+extract('function refreshCityPoints(transform,width){','function updateMapOverlays(){'),context);
  el('#family-active').value=B;el('#family-active').onchange();activeChanges.length=0;
  // Execute the production initializer too: a correct helper left unused by an
  // old member-switching callback must not make this regression pass.
  const mapInitializer=source.match(/^\s*landmarkMap=createLandmarkMap\([^\n]+$/m);assert.ok(mapInitializer);
  context.landmarkCatalog=catalog;vm.runInContext(mapInitializer[0],context);
  const map=context.landmarkMap;map.mount(new Selection([svgRoot]));
  const nodes=className=>descendants(svgRoot).filter(node=>String(node.attributes.class||'').split(' ').includes(className));
  return {context,el,state,primary,writes,notices,navigations,activeChanges,nodes,svgRoot,map,active:()=>context.familyUI.activeId(),
    renderFlags(scope={kind:'country',code:'CHE'}){context.scope=scope;context.renderMapState();},
    renderPoints(){context.refreshCityPoints({k:1,x:0,y:0},390);},
    renderLandmarks(){map.render({scope:{kind:'country',code:'JPN'},projection:([x,y])=>[x+300,y+250],transform:{k:1,x:0,y:0},width:390,mapHeight:1000});},
    select(id){el('#family-active').value=id;el('#family-active').onchange();}};
}

for(const action of ['click','Enter',' '])test('another member city flag keeps the current editor owner for '+JSON.stringify(action),async()=>{
  const h=harness(),before=structuredClone({primary:h.primary,a:h.state.document.regions[A],landmarks:h.state.document.landmarks});h.renderFlags();
  const flag=h.nodes('city-marker').find(node=>node.datum.member.id===A&&R.id(node.datum)===LUCERNE);assert.ok(flag);
  const rect=flag.children.find(node=>node.tag==='rect'),offset=(flag.datum.flagOffset||0)-11;
  assert.ok(rect.attributes.x+offset<=0&&rect.attributes.x+offset+rect.attributes.width>=0&&rect.attributes.y<=0&&rect.attributes.y+rect.attributes.height>=0,'the real transparent flag hit target covers the city center');
  const event=dispatch(action==='click'?rect:flag,action==='click'?'click':'keydown',action);
  assert.equal(h.active(),B);assert.deepEqual(h.activeChanges,[]);assert.equal(R.id(h.context.selected),LUCERNE);
  assert.match(h.el('#detail-member').textContent,/成员丙/);assert.equal(h.el('#detail-note').value,'');assert.equal(h.el('#detail-visited').checked,false);
  if(action==='click')assert.equal(event.stopped,true);else assert.equal(event.prevented,true);
  h.el('#detail-visited').checked=true;h.el('#detail-date').value='2025-06-07';h.el('#detail-note').value='丙自己的卢塞恩记录';await h.context.saveCity(false);
  assert.equal(h.writes.length,1);assert.equal(h.writes[0].id,B);assert.equal(h.writes[0].kind,'regions');
  assert.equal(h.state.document.regions[B][LUCERNE].note,'丙自己的卢塞恩记录');assert.equal(h.state.document.regions[B][LUCERNE].date,'2025-06-07');
  assert.deepEqual({primary:h.primary,a:h.state.document.regions[A],landmarks:h.state.document.landmarks},before);
});

test('world country flags navigate without selecting their owner for mouse and keyboard activation',async()=>{
  const h=harness(),before=structuredClone(h.state.document);
  for(const action of ['click','Enter',' ']){
    h.renderFlags({kind:'world'});const flag=h.nodes('city-marker').find(node=>node.datum.member.id===A&&R.id(node.datum)==='world:CHE');assert.ok(flag);
    dispatch(flag,action==='click'?'click':'keydown',action);await Promise.resolve();
    assert.equal(h.active(),B);assert.deepEqual(h.activeChanges,[]);
    assert.equal(h.navigations.at(-1).member,B);assert.deepEqual(JSON.parse(JSON.stringify(h.navigations.at(-1).next)),{kind:'country',code:'CHE'});
  }
  assert.deepEqual(h.writes,[]);assert.deepEqual(h.state.document,before);
});

test('ordinary city dots retain the current member and stop a covered map shape receiving the click',()=>{
  const h=harness();let parentClicks=0;h.svgRoot.events.click=()=>parentClicks++;h.renderPoints();
  const point=h.nodes('world-city-point').find(node=>R.id(node.datum)===LUCERNE);assert.ok(point);
  for(const action of ['click','Enter',' ']){
    const event=dispatch(action==='click'?point.children[0]:point,action==='click'?'click':'keydown',action);
    assert.equal(h.active(),B);assert.equal(R.id(h.context.selected),LUCERNE);
    if(action==='click')assert.equal(event.stopped,true);else assert.equal(event.prevented,true);
  }
  assert.equal(parentClicks,0);assert.deepEqual(h.activeChanges,[]);assert.deepEqual(h.writes,[]);
});

for(const action of ['click','Enter',' '])test('another member landmark flag opens and saves for the current member via '+JSON.stringify(action),async()=>{
  const h=harness(),before=structuredClone({primary:h.primary,a:h.state.document.landmarks[A],regions:h.state.document.regions});h.renderLandmarks();
  const marker=h.nodes('landmark-marker').find(node=>node.datum.member?.id===A&&node.datum.id===NARA);assert.ok(marker);
  const event=dispatch(action==='click'?marker.children[0]:marker,action==='click'?'click':'keydown',action);
  assert.equal(h.active(),B);assert.deepEqual(h.activeChanges,[]);assert.match(h.el('#lm-detail-member').textContent,/成员丙/);
  assert.equal(h.el('#lm-detail-note').value,'');assert.equal(event.stopped,true);if(action!=='click')assert.equal(event.prevented,true);
  const radios=h.el('#lm-detail-form').querySelectorAll('input[name="lm-state"]');radios.forEach(radio=>radio.checked=radio.value==='visited');radios.find(radio=>radio.checked).onchange();
  h.el('#lm-detail-date').value='2025-08-09';h.el('#lm-detail-note').value='丙自己的奈良记录';await h.el('#lm-detail-form').onsubmit({preventDefault(){}});
  assert.equal(h.writes.length,1);assert.equal(h.writes[0].kind,'landmarks');assert.equal(h.writes[0].id,B);
  assert.equal(h.state.document.landmarks[B][NARA].note,'丙自己的奈良记录');
  assert.deepEqual({primary:h.primary,a:h.state.document.landmarks[A],regions:h.state.document.regions},before);
});

test('explicit member selection still changes the editor owner and rejects a previously opened member context',async()=>{
  const h=harness();h.renderFlags();const flag=h.nodes('city-marker').find(node=>node.datum.member.id===A&&R.id(node.datum)===LUCERNE);
  dispatch(flag,'click');const oldContext=h.context.detailContext;assert.equal(h.el('#city-dialog').open,true);
  h.select(A);assert.equal(h.active(),A);assert.deepEqual(h.activeChanges,[A]);assert.equal(h.el('#city-dialog').open,false);
  assert.equal((await h.context.cloud.save({},oldContext)).code,'STALE_CONTEXT');assert.deepEqual(h.writes,[]);
  h.context.openCity(LUCERNE);assert.match(h.el('#detail-member').textContent,/成员乙/);assert.equal(h.el('#detail-note').value,'乙的卢塞恩原记录');
  h.el('#detail-note').value='主动选择乙后编辑';await h.context.saveCity(false);
  assert.equal(h.writes[0].id,A);assert.equal(h.state.document.regions[A][LUCERNE].note,'主动选择乙后编辑');
  assert.equal(h.state.document.regions[B][LUCERNE],undefined);
});
