'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const L = require('../landmark-model.js');
const F = require('../family-map-model.js');
const geoD3 = require('../assets/d3.min.js');
const data = require('../landmark-catalog.js');
const WUYUE_IDS=['poi:CHN:taishan','poi:CHN:huashan','poi:CHN:hengshan-hunan','poi:CHN:hengshan-shanxi','poi:CHN:songshan'];
const WORLD_MAP_IDS=[...WUYUE_IDS,...data.places.filter(place=>place.countryCode!=='CHN').map(place=>place.id)];

// Small SVG selection fixture: execute the production rendering and event
// handlers, while retaining the resulting tree for state-transition assertions.
class Node {
  constructor(tag, parent = null, datum) { this.tag=tag;this.parent=parent;this.datum=datum;this.children=[];this.attributes={};this.styles={};this.events={}; }
}
function descendants(node) { return node.children.flatMap(child=>[child,...descendants(child)]); }
class Selection {
  constructor(nodes, parents=[]) { this.nodes=nodes;this.parents=parents; }
  append(tag) { return new Selection(this.nodes.map(parent=>{const child=new Node(tag,parent,parent.datum);parent.children.push(child);return child;})); }
  selectAll(selector) { return new Selection(this.nodes.flatMap(descendants).filter(node=>selector==='*'||node.tag===selector),this.nodes); }
  data(values) { this.values=values;return this; }
  join(tag) { const parent=this.parents[0];return new Selection(this.values.map(datum=>{const child=new Node(tag,parent,datum);parent.children.push(child);return child;})); }
  attr(key,value) { this.nodes.forEach(node=>{const v=typeof value==='function'?value(node.datum):value;if(v===null||v===undefined)delete node.attributes[key];else node.attributes[key]=v;});return this; }
  style(key,value) { this.nodes.forEach(node=>{const v=typeof value==='function'?value(node.datum):value;if(v===null||v===undefined)delete node.styles[key];else node.styles[key]=v;});return this; }
  text(value) { this.nodes.forEach(node=>node.text=typeof value==='function'?value(node.datum):value);return this; }
  on(key,handler) { this.nodes.forEach(node=>node.events[key]=handler);return this; }
  filter(predicate) { return new Selection(this.nodes.filter(node=>predicate(node.datum))); }
  each(callback) { this.nodes.forEach(node=>callback.call(node,node.datum));return this; }
  remove() { this.nodes.forEach(node=>node.parent.children=node.parent.children.filter(child=>child!==node));return this; }
}
function harness(input=data,{members}={}) {
  const controls = new Map();
  const control = selector => {
    if(!controls.has(selector)) controls.set(selector,{checked:true,value:'all',children:[],events:{},append(child){this.children.push(child);},addEventListener(key,handler){this.events[key]=handler;}});
    return controls.get(selector);
  };
  const world = new Node('svg'), opened = [], state={records:{}};
  const context={window:{ShanheLandmarks:L,ShanheFamilyMap:F},document:{querySelector:control,createElement:tag=>new Node(tag)},d3:{select:node=>new Selection([node])}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../landmark-map.js'),'utf8'),context);
  const map=context.window.createLandmarkMap({catalog:L.catalog(input),store:{getState:()=>state},getMembers:members?()=>members:undefined,open:id=>opened.push(id)});
  map.mount(new Selection([world]));
  const view={scope:{kind:'world'},projection:([lon,lat])=>[lon+300,lat+250],transform:{k:1,x:0,y:0},width:375,mapHeight:1000};
  const nodes=className=>descendants(world).filter(node=>String(node.attributes.class||'').split(' ').includes(className));
  return {map,state,opened,view,nodes,control,remount(){world.children=[];map.mount(new Selection([world]));}};
}

test('map re-render removes a cancelled flag, including when the visited filter is active', () => {
  const h=harness(), id=data.places[0].id;
  h.state.records[id]={status:'visited'};
  h.map.render(h.view);
  assert.equal(h.nodes('landmark-marker').length,WORLD_MAP_IDS.length);
  assert.equal(h.nodes('landmark-flag').length,1);
  delete h.state.records[id];
  h.map.render();
  assert.equal(h.nodes('landmark-flag').length,0);
  assert.ok(h.nodes('landmark-marker').find(node=>node.datum.id===id).attributes.class.includes('unvisited'));
  h.control('#landmark-map-status').value='visited';
  h.control('#landmark-map-status').events.change();
  assert.equal(h.nodes('landmark-marker').length,0);
  assert.equal(h.control('#landmark-map-count').textContent,'当前地图 0 处名胜');
});

test('a new book landmark can be filtered on the city map and cancelling it removes only its flag', () => {
  const place=data.places.find(item=>item.name==='九寨沟'||item.aliases?.includes('九寨沟'));
  assert.ok(place);
  const h=harness(), other='poi:CHN:taishan';
  h.state.records[place.id]={status:'visited'};
  h.state.records[other]={status:'visited'};
  h.control('#landmark-map-theme').value='china-most-beautiful-100';
  h.control('#landmark-map-status').value='visited';
  h.map.render({...h.view,scope:{kind:'region',code:place.regionIds[0]}});
  assert.deepEqual(h.nodes('landmark-marker').map(node=>node.datum.id),[place.id]);
  assert.equal(h.nodes('landmark-flag').length,1);
  assert.equal(h.control('#landmark-map-count').textContent,'当前地图 1 处名胜');
  delete h.state.records[place.id];
  h.map.render();
  assert.equal(h.nodes('landmark-marker').length,0);
  assert.equal(h.nodes('landmark-flag').length,0);
  h.control('#landmark-map-status').value='all';
  h.control('#landmark-map-status').events.change();
  const marker=h.nodes('landmark-marker').find(node=>node.datum.id===place.id);
  assert.ok(marker.attributes.class.includes('unvisited'));
  assert.equal(h.nodes('landmark-flag').length,0);
  h.control('#landmark-map-status').value='visited';
  h.map.render(h.view);
  assert.deepEqual(h.nodes('landmark-marker').map(node=>node.datum.id),[other]);
  assert.equal(h.nodes('landmark-flag').length,1);
});

test('world render hides a saved non-mountain China flag and restores it on China maps without changing the record', () => {
  const h=harness(),jiuzhaigou=data.places.find(place=>place.name==='九寨沟'),nara=data.places.find(place=>place.name==='奈良');
  assert.ok(jiuzhaigou&&nara);
  h.state.records[jiuzhaigou.id]={status:'visited',date:'2024-06-15',note:'家人一起的旅行'};
  h.state.records[nara.id]={status:'visited',date:'2025-04-03',note:'奈良'};
  const before=structuredClone(h.state.records);
  h.map.render(h.view);
  assert.deepEqual(new Set(h.nodes('landmark-marker').map(node=>node.datum.id)),new Set(WORLD_MAP_IDS));
  assert.deepEqual(new Set(h.nodes('landmark-marker').filter(node=>node.datum.countryCode==='CHN').map(node=>node.datum.id)),new Set(WUYUE_IDS));
  assert.deepEqual(h.nodes('landmark-flag').map(node=>node.datum.id),[nara.id]);
  assert.equal(h.control('#landmark-map-count').textContent,'当前地图 '+WORLD_MAP_IDS.length+' 处名胜');
  h.control('#landmark-map-status').value='visited';h.control('#landmark-map-status').events.change();
  assert.deepEqual(h.nodes('landmark-marker').map(node=>node.datum.id),[nara.id]);
  for(const scope of [{kind:'china'},{kind:'province',code:'510000'}]){
    h.map.render({...h.view,scope});
    assert.deepEqual(h.nodes('landmark-marker').map(node=>node.datum.id),[jiuzhaigou.id]);
    assert.deepEqual(h.nodes('landmark-flag').map(node=>node.datum.id),[jiuzhaigou.id]);
  }
  h.map.render(h.view);
  assert.deepEqual(h.nodes('landmark-flag').map(node=>node.datum.id),[nara.id]);
  assert.deepEqual(h.state.records,before);
});

test('international, shared-theme and province maps use one marker per matching place', () => {
  const extended=structuredClone(data), id='poi:FRA:test-border';
  extended.places.push({id,name:'测试景点',countryCode:'FRA',countryCodes:['FRA','ITA'],coordinates:[7,45],themeIds:['shared']});
  extended.themes.push({id:'shared',name:'测试主题',placeIds:[id,data.places[0].id,data.places[0].id]});
  const h=harness(extended);
  h.map.render(h.view);
  assert.equal(h.nodes('landmark-marker').length,WORLD_MAP_IDS.length+1);
  h.control('#landmark-map-theme').value='shared';
  h.map.render({...h.view,scope:{kind:'country',code:'ITA'}});
  assert.deepEqual(h.nodes('landmark-marker').map(node=>node.datum.id),[id]);
  h.map.render({...h.view,scope:{kind:'province',code:'370000'}});
  assert.deepEqual(h.nodes('landmark-marker').map(node=>node.datum.id),[data.places[0].id]);
  h.map.render({...h.view,scope:{kind:'unknown',code:'CHN'}});
  assert.equal(h.nodes('landmark-marker').length,0);
});

test('phone-size targets remain 44 CSS pixels through zoom and support click and keyboard activation', () => {
  const h=harness();
  for(const k of [1,4,24]){
    h.map.render({...h.view,transform:{k,x:0,y:0}});
    const marker=h.nodes('landmark-marker')[0], hit=h.nodes('landmark-hit')[0];
    const localScale=Number(/scale\(([^)]+)\)/.exec(marker.attributes.transform)[1]);
    assert.ok(Math.abs(2*hit.attributes.r*localScale*k*h.view.width/1000-44)<1e-8);
  }
  const marker=h.nodes('landmark-marker')[0];
  let stopped=0,prevented=0;
  marker.events.click({stopPropagation(){stopped++;}},marker.datum);
  marker.events.keydown({key:'Enter',preventDefault(){prevented++;},stopPropagation(){stopped++;}},marker.datum);
  marker.events.keydown({key:' ',preventDefault(){prevented++;},stopPropagation(){stopped++;}},marker.datum);
  marker.events.keydown({key:'Escape'},marker.datum);
  assert.deepEqual(h.opened,[marker.datum.id,marker.datum.id,marker.datum.id]);
  assert.equal(stopped,3);assert.equal(prevented,2);
  assert.equal(marker.attributes.tabindex,0);
  assert.equal(marker.attributes.role,'button');
});

test('hiding the layer removes targets and showing it resets stale filters', () => {
  const h=harness();h.map.render(h.view);
  h.control('#landmark-map-toggle').checked=false;
  h.control('#landmark-map-toggle').events.change();
  assert.equal(h.nodes('landmark-marker').length,0);
  h.control('#landmark-map-theme').value='missing';
  h.control('#landmark-map-status').value='visited';
  h.map.show();
  assert.equal(h.nodes('landmark-marker').length,WORLD_MAP_IDS.length);
  assert.equal(h.control('#landmark-map-theme').value,'all');
  assert.equal(h.control('#landmark-map-status').value,'all');
});

test('a projection that cannot represent a point hides it instead of writing NaN or throwing', () => {
  const h=harness();
  h.map.render({...h.view,projection:()=>null});
  assert.ok(h.nodes('landmark-marker').every(node=>node.styles.display==='none'&&!('transform' in node.attributes)));
  assert.ok(h.nodes('landmark-map-label').every(node=>node.styles.display==='none'));
  h.map.update(h.view);
  assert.ok(h.nodes('landmark-marker').every(node=>node.styles.display===undefined&&node.attributes.transform));
});

function jerusalemView(h,width){
  const height=width<851?1000:740,projection=geoD3.geoEqualEarth().fitExtent([[22,90],[978,height-100]],{type:'Sphere'});
  const place=data.places.find(p=>p.id==='poi:PSX:jerusalem'),point=projection(place.coordinates),k=8;
  return {...h.view,width,mapHeight:height,projection,transform:{k,x:500-k*point[0],y:height/2-k*point[1]}};
}
function coveringMarkers(h,id,view){
  const target=view.projection(data.places.find(p=>p.id===id).coordinates);
  return h.nodes('landmark-marker').filter(node=>{
    if(node.styles.display==='none')return false;
    const point=view.projection(node.datum.coordinates),offset=node.datum.flagOffset||0;
    const dx=(point[0]-target[0])*view.transform.k*view.width/1000+offset,dy=(point[1]-target[1])*view.transform.k*view.width/1000;
    return Math.hypot(dx,dy)<=22;
  });
}

test('focusing Jerusalem makes its label visible and puts its touch target above nearby landmarks on phones and desktop', () => {
  const id='poi:PSX:jerusalem';
  for(const width of [375,800]){
    const h=harness(),view=jerusalemView(h,width);h.map.render(view);
    const before=coveringMarkers(h,id,view);
    assert.ok(before.length>1,'use the real dense Middle East geometry');
    assert.notEqual(before.at(-1).datum.id,id,'the original target order can intercept Jerusalem');
    h.map.focus(id);
    const labels=h.nodes('landmark-map-label'),target=h.nodes('landmark-marker').at(-1);
    assert.equal(labels[0].datum.id,id);assert.notEqual(labels[0].styles.display,'none');
    assert.equal(target.datum.id,id);assert.equal(coveringMarkers(h,id,view).at(-1).datum.id,id);
    assert.equal(h.nodes('landmark-focus-ring').length,1);
    assert.equal(h.nodes('landmark-focus-ring')[0].attributes['pointer-events'],'none');
    target.events.click({stopPropagation(){}},target.datum);
    assert.deepEqual(h.opened,[id]);
    const point=view.projection(data.places.find(place=>place.id===id).coordinates);
    h.map.update({...view,transform:{k:9,x:500-9*point[0],y:view.mapHeight/2-9*point[1]}});
    assert.equal(h.nodes('landmark-marker').at(-1).datum.id,id,'zoom keeps the selected target on top');
    assert.notEqual(h.nodes('landmark-map-label')[0].styles.display,'none');
  }
});

test('focus is cleared by user filters and navigation and never bypasses the domestic world-overview rule', () => {
  const h=harness(),id='poi:PSX:jerusalem';h.map.render(jerusalemView(h,375));
  for(const selector of ['#landmark-map-toggle','#landmark-map-theme','#landmark-map-status']){
    h.map.focus(id);assert.equal(h.nodes('landmark-focus-ring').length,1);
    h.control(selector).events.change();assert.equal(h.nodes('landmark-focus-ring').length,0);
  }
  h.map.focus(id);h.map.render({...h.view,scope:{kind:'country',code:'PSX'}});
  assert.equal(h.nodes('landmark-focus-ring').length,0,'a different geographical scope clears the focus');
  h.map.focus(id);h.remount();h.map.render({...h.view,scope:{kind:'country',code:'PSX'}});
  assert.equal(h.nodes('landmark-focus-ring').length,0,'a fresh map mount clears focus even in the same scope');
  h.map.render(h.view);h.map.focus(data.places.find(p=>p.name==='九寨沟').id);
  assert.equal(h.nodes('landmark-focus-ring').length,0);
  assert.deepEqual(new Set(h.nodes('landmark-marker').filter(node=>node.datum.countryCode==='CHN').map(node=>node.datum.id)),new Set(WUYUE_IDS));
  h.map.focus(id);h.map.show();assert.equal(h.nodes('landmark-focus-ring').length,0);
  h.map.focus('poi:PSX:missing');assert.equal(h.nodes('landmark-focus-ring').length,0);
});

test('focusing a family landmark raises the whole place while retaining member order, colors and offsets', () => {
  const id='poi:PSX:jerusalem',neighbor='poi:JOR:jerash';
  const members=[
    {member:{id:'a',name:'甲',color:'blue',hex:'#478ab7'},records:{[id]:{status:'visited',date:'2024-04-01',note:'甲的旅行'},[neighbor]:{status:'wish'}}},
    {member:{id:'b',name:'乙',color:'purple',hex:'#916aa9'},records:{[id]:{status:'visited',date:'2025-05-02',note:'乙的旅行'}}}
  ];
  const h=harness(data,{members}),before=structuredClone(members);h.map.render(jerusalemView(h,375));
  const original=h.nodes('landmark-marker').filter(node=>node.datum.id===id).map(node=>({member:node.datum.member.id,offset:node.datum.flagOffset}));
  h.map.focus(id);
  const selected=h.nodes('landmark-marker').slice(-2);
  assert.ok(selected.every(node=>node.datum.id===id));
  assert.deepEqual(selected.map(node=>({member:node.datum.member.id,offset:node.datum.flagOffset})),original);
  assert.deepEqual(selected.map(node=>node.datum.member.hex),['#478ab7','#916aa9']);
  assert.equal(h.nodes('landmark-focus-ring').length,2);
  assert.equal(h.nodes('landmark-map-label').filter(node=>node.datum.id===id).length,1);
  assert.notEqual(h.nodes('landmark-map-label')[0].styles.display,'none');
  assert.deepEqual(members,before,'painting focus cannot mutate either archive');
});
