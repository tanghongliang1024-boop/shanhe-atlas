'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const L = require('../landmark-model.js');
const data = require('../landmark-catalog.js');

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
function harness(input=data) {
  const controls = new Map();
  const control = selector => {
    if(!controls.has(selector)) controls.set(selector,{checked:true,value:'all',children:[],events:{},append(child){this.children.push(child);},addEventListener(key,handler){this.events[key]=handler;}});
    return controls.get(selector);
  };
  const world = new Node('svg'), opened = [], state={records:{}};
  const context={window:{ShanheLandmarks:L},document:{querySelector:control,createElement:tag=>new Node(tag)},d3:{select:node=>new Selection([node])}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../landmark-map.js'),'utf8'),context);
  const map=context.window.createLandmarkMap({catalog:L.catalog(input),store:{getState:()=>state},open:id=>opened.push(id)});
  map.mount(new Selection([world]));
  const view={scope:{kind:'world'},projection:([lon,lat])=>[lon+300,lat+250],transform:{k:1,x:0,y:0},width:375,mapHeight:1000};
  const nodes=className=>descendants(world).filter(node=>String(node.attributes.class||'').split(' ').includes(className));
  return {map,state,opened,view,nodes,control};
}

test('map re-render removes a cancelled flag, including when the visited filter is active', () => {
  const h=harness(), id=data.places[0].id;
  h.state.records[id]={status:'visited'};
  h.map.render(h.view);
  assert.equal(h.nodes('landmark-marker').length,data.places.length);
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

test('international, shared-theme and province maps use one marker per matching place', () => {
  const extended=structuredClone(data), id='poi:FRA:test-border';
  extended.places.push({id,name:'测试景点',countryCode:'FRA',countryCodes:['FRA','ITA'],coordinates:[7,45],themeIds:['shared']});
  extended.themes.push({id:'shared',name:'测试主题',placeIds:[id,data.places[0].id,data.places[0].id]});
  const h=harness(extended);
  h.map.render(h.view);
  assert.equal(h.nodes('landmark-marker').length,data.places.length+1);
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
  assert.equal(h.nodes('landmark-marker').length,data.places.length);
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
