'use strict';

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../region-model.js'),F=require('../family-map-model.js'),geoD3=require('../assets/d3.min.js');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/geo',name),'utf8'));
const world=read('world.geo.json').features,index=read('world-index.json');
const model=R.catalog(read('china-prefecture-index.json'),index,[],null,read('world-cities.json'));
const mauritius=world.find(f=>f.properties.countryCode==='MUS'),madagascar=world.find(f=>f.properties.countryCode==='MDG');
const row=()=>({visited:true,date:'2024-06-15',note:'海岛旅行',updatedAt:'2026-10-28T00:00:00Z'});

test('Mauritius remains a searchable country with its existing ID and real island geometry',()=>{
  assert.equal(R.id(mauritius),'world:MUS');
  assert.deepEqual(mauritius.properties,index.countries.find(p=>p.countryCode==='MUS'));
  assert.equal(model.byId.get('world:MUS').properties.level,'country');
  assert.equal(model.features.filter(f=>R.id(f)==='world:MUS').length,1);
  assert.equal(model.legacyById.has('world:MUS'),false);
  assert.equal(geoD3.geoContains(mauritius,mauritius.properties.center),true);
  const [lon,lat]=mauritius.properties.center;
  assert.ok(lon>57&&lon<58&&lat>-21&&lat<-20,'anchor stays on Mauritius main island');
  for(const query of ['毛里求斯','Mauritius','模里西斯','MUS'])assert.equal(R.matches(model.byId.get('world:MUS'),query),true);
  assert.equal(R.matches(model.byId.get('world:MUS'),'','MUS'),true);
  assert.equal(R.matches(model.byId.get('world:MUS'),'','MDG'),false);
});

// Execute the production locator, map-state and overlay handlers against a small
// SVG selection fixture. Projection math comes from the application's real D3.
class Element {
  constructor(tag,parent=null,datum){this.tag=tag;this.parent=parent;this.datum=datum;this.children=[];this.attrs={};this.styles={};this.events={};}
}
const descendants=node=>node.children.flatMap(child=>[child,...descendants(child)]);
const matches=(node,selector)=>selector==='*'||(selector.startsWith('.')?String(node.attrs.class||'').split(' ').includes(selector.slice(1)):node.tag===selector);
class Selection {
  constructor(nodes,parents=[]){this.nodes=nodes;this.parents=parents;}
  append(tag){return new Selection(this.nodes.map(parent=>{const child=new Element(tag,parent,parent.datum);parent.children.push(child);return child;}));}
  selectAll(selector){return new Selection(this.nodes.flatMap(descendants).filter(n=>matches(n,selector)),this.nodes);}
  data(values){this.values=values;return this;}
  join(tag){const parent=this.parents[0];return new Selection(this.values.map(datum=>{const node=new Element(tag,parent,datum);parent.children.push(node);return node;}));}
  attr(key,value){this.nodes.forEach(node=>{const result=typeof value==='function'?value(node.datum):value;if(result==null)delete node.attrs[key];else node.attrs[key]=result;});return this;}
  style(key,value){this.nodes.forEach(node=>{const result=typeof value==='function'?value(node.datum):value;if(result==null)delete node.styles[key];else node.styles[key]=result;});return this;}
  text(value){this.nodes.forEach(node=>node.text=typeof value==='function'?value(node.datum):value);return this;}
  on(key,value){this.nodes.forEach(node=>node.events[key]=value);return this;}
  each(fn){this.nodes.forEach(node=>fn.call(node,node.datum));return this;}
  filter(fn){return new Selection(this.nodes.filter(node=>fn(node.datum)));}
  classed(name,value){this.nodes.forEach(node=>{const classes=new Set(String(node.attrs.class||'').split(' ').filter(Boolean));const state=typeof value==='function'?value(node.datum):value;state?classes.add(name):classes.delete(name);node.attrs.class=[...classes].join(' ');});return this;}
  remove(){this.nodes.forEach(node=>node.parent.children=node.parent.children.filter(child=>child!==node));return this;}
  node(){return this.nodes[0];}
}
function harness({width=375,phone=true,kind='world'}={}){
  const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
  const section=(start,end)=>{const from=source.indexOf(start),to=source.indexOf(end,from);assert.ok(from>=0&&to>from);return source.slice(from,to);};
  const root=new Element('svg'),state={width,transform:{k:1,x:0,y:0},records:{},opened:[]};
  root.getBoundingClientRect=()=>({width:state.width});
  const d3={select:node=>new Selection([node]),zoomTransform:()=>state.transform};
  const projection=geoD3.geoEqualEarth().fitExtent([[22,90],[978,(phone?1000:740)-100]],{type:'Sphere'});
  const install=new Function('root','state','d3','R','model','world','ShanheFamilyMap','projection','phone','kind',`
    let scope={kind},mapHeight=phone?1000:740,phoneLayout={matches:phone},mode='flag';
    const svg=d3.select(root),layer=svg.append('g'),mainShapes=world,provinces=[];
    const cityShapes=layer.append('g').selectAll('path').data(world).join('path');
    let countryLocators,labels,cityPoints=null,cityPointLabels=null,southMarkers=null,southProjection=null;
    const shortName=name=>name,openCity=id=>state.opened.push(id),navigate=next=>state.opened.push(next);
    const $=()=>({hidden:false}),renderLandmarkMap=()=>{},landmarkMap=null;
    const familyUI={selectMember(){}},mapVisits=()=>R.recordsWithFeatures(state.records,model);
    const mapMemberEntries=()=>[{member:{id:'self',name:'我',color:'terracotta'},records:state.records}];
    ${section('function openShape(f){','function openWorldRegion(id){')}
    ${section("  const locatorCountries=",'  const countryCities=')}
    const markers=layer.append('g');
    ${section('function renderMapState(){','function renderLandmarkMap(){')}
    ${section('function updateMapOverlays(){','function renderCollection(){')}
    return {renderMapState,updateMapOverlays};
  `);
  const api=install(root,state,d3,R,model,world,F,projection,phone,kind);
  const nodes=name=>descendants(root).filter(node=>matches(node,'.'+name));
  return {api,state,nodes,projection,root};
}
const transformValues=node=>{
  const text=node.attrs.transform;
  return {origin:text.match(/translate\(([^)]+)\)/)[1].split(',').map(Number),scale:Number(text.match(/scale\(([^)]+)\)/)[1])};
};

test('Mauritius locator stays at the real island, readable and touch-sized through phone and desktop zoom',()=>{
  for(const [width,phone] of [[375,true],[1100,false]]){
    const h=harness({width,phone});
    for(const k of [1,3,12]){
      const p=h.projection(mauritius.properties.center);
      h.state.transform={k,x:500-p[0]*k,y:500-p[1]*k};h.api.updateMapOverlays();
      const locators=h.nodes('country-locator');assert.equal(locators.length,1);
      const locator=locators[0],hit=h.nodes('country-locator-hit')[0],label=h.nodes('country-locator-label')[0];
      const transform=transformValues(locator),unit=transform.scale*k*width/1000;
      assert.deepEqual(transform.origin,p,'zoom must not move the geographic anchor');
      assert.ok(hit.attrs.width*unit>=44-1e-8);assert.ok(hit.attrs.height*unit>=44-1e-8);
      assert.equal(label.text,'毛里求斯');assert.notEqual(locator.styles.display,'none');assert.notEqual(label.styles.display,'none');
      assert.equal(h.nodes('city-label').filter(n=>R.id(n.datum)==='world:MUS').length,0,'only one island label');
      const neighbor=h.projection(madagascar.properties.center),relative=neighbor.map((value,i)=>(value-p[i])/transform.scale);
      const intercepts=relative[0]>=hit.attrs.x&&relative[0]<=hit.attrs.x+hit.attrs.width&&relative[1]>=hit.attrs.y&&relative[1]<=hit.attrs.y+hit.attrs.height;
      assert.equal(intercepts,false,'Mauritius enlarged hit area must not capture Madagascar');
    }
  }
  assert.equal(harness({kind:'china'}).nodes('country-locator').length,0,'world-only aid must not appear in China view');
});

test('pointer and keyboard locator activation edit the existing Mauritius country record',()=>{
  const h=harness(),locator=h.nodes('country-locator')[0];let stopped=0,prevented=0;
  assert.equal(locator.attrs.role,'button');assert.equal(locator.attrs.tabindex,0);
  locator.events.click({stopPropagation(){stopped++;}},mauritius);
  for(const key of ['Enter',' '])locator.events.keydown({key,preventDefault(){prevented++;}},mauritius);
  locator.events.keydown({key:'Escape',preventDefault(){throw Error('unhandled key');}},mauritius);
  assert.deepEqual(h.state.opened,['world:MUS','world:MUS','world:MUS']);assert.equal(stopped,1);assert.equal(prevented,2);
});

test('canceling Mauritius removes its flag and visited styling while retaining its location and other visits',()=>{
  const h=harness();h.state.records={'world:MUS':row(),'world:MDG':row()};h.api.renderMapState();
  assert.equal(h.nodes('city-marker').filter(n=>R.id(n.datum)==='world:MUS').length,1);
  assert.ok(h.nodes('country-locator')[0].attrs.class.includes('visited'));
  const originalOther=structuredClone(h.state.records['world:MDG']);delete h.state.records['world:MUS'];h.api.renderMapState();
  assert.equal(h.nodes('city-marker').filter(n=>R.id(n.datum)==='world:MUS').length,0);
  assert.equal(h.nodes('city-marker').filter(n=>R.id(n.datum)==='world:MDG').length,1);
  assert.equal(h.nodes('country-locator').length,1);assert.equal(h.nodes('country-locator')[0].attrs.class.includes('visited'),false);
  assert.deepEqual(h.state.records['world:MDG'],originalOther);
});

test('Mauritius family flags remain independent when one child cancels or is hidden',()=>{
  const entries=['a','b'].map((id,i)=>({member:{id,name:id,color:i?'purple':'blue'},records:{'world:MUS':row()}}));
  const marks=items=>F.regionMarkers(items,{kind:'world'},world,[],model,R);
  assert.deepEqual(marks(entries).map(f=>f.member.id),['a','b']);
  assert.ok(marks(entries).every(f=>R.id(f)==='world:MUS'&&f.count===1));
  delete entries[0].records['world:MUS'];
  assert.deepEqual(marks(entries).map(f=>f.member.id),['b']);assert.equal(marks(entries)[0].flagOffset,0);
  assert.deepEqual(marks([entries[0]]),[]);assert.equal(entries[1].records['world:MUS'].note,'海岛旅行');
});
