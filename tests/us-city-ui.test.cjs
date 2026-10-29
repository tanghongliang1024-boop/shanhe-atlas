'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../region-model.js'),C=require('../city-catalog.js');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/geo',name),'utf8'));
const worldIndex=read('world-index.json'),originalCities=read('world-cities.json');
// Exercise the real decoder and real catalogues with isolated, explicitly fake
// towns. No account, local storage, database or network is involved.
const supplement={version:1,columns:['geoid','kind','state','name','longitude','latitude','county'],rows:[
  ...Array.from({length:130},(_,i)=>[String(6990000+i),'place','CA','Fixture Town '+String(i).padStart(3,'0'),-121+i/1000,37,'Fixture County']),
  ['6990130','place','CA','Same Fixture',-120,37,'West County'],
  ['4890000','place','TX','Same Fixture',-99,31,'East County'],
  ['6990131','place','CA','<Pine & Hills>',-120,38,'<County & Coast>']
]};
const worldCities=R.withCitySupplement(originalCities,supplement,worldIndex);
const model=R.catalog(read('china-prefecture-index.json'),worldIndex,[],null,worldCities);
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const helpers=source.slice(source.indexOf('const icon='),source.indexOf('const R='));
const extract=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a);assert.ok(a>=0&&b>a,start);return source.slice(a,b);};
const regionSource=extract('function openWorldRegion(id){',"$('#close-region').onclick");
const openCitySource=extract('function openCity(id){',"$('#close-dialog').onclick");
const row=note=>({visited:true,date:'2018-05-06',note,updatedAt:'2026-10-29T00:00:00.000Z'});
const CA='world:USA:US-CA',TX='world:USA:US-TX',COUNTRY='world:USA';
const fixtureId=i=>'world:USA:city-usplace'+(6990000+i);

function harness(records={}){
  const elements=new Map(),opened=[];
  function el(selector){
    if(!elements.has(selector)){
      let html='',buttons=[];
      const element={value:'',textContent:'',hidden:false,disabled:false,open:false,scrollTop:0,dataset:{},
        focus(){this.focused=true;},close(){this.open=false;},showModal(){this.open=true;},
        querySelectorAll:query=>query==='[data-city]'?buttons:[]};
      Object.defineProperty(element,'innerHTML',{get:()=>html,set(value){html=value;buttons=[...value.matchAll(/<button\b[^>]*data-city="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)].map(match=>({dataset:{city:match[1]},innerHTML:match[2]}));}});
      elements.set(selector,element);
    }
    return elements.get(selector);
  }
  const context={R,ShanheCityCatalog:C,$:el,model,worldCities,records,regionSelection:null,
    citySearch:C.createSearch(model.features,R),openCity:id=>opened.push(id),focusRegion:()=>{},
    visited:feature=>context.records[R.id(feature)]?.visited===true};
  vm.createContext(context);vm.runInContext(helpers+regionSource,context);
  return {context,el,opened,open:id=>context.openWorldRegion(id),
    buttons:()=>el('#region-cities').querySelectorAll('[data-city]'),
    ids:()=>el('#region-cities').querySelectorAll('[data-city]').map(button=>button.dataset.city),
    search:query=>{el('#region-search').value=query;el('#region-search').oninput();},
    next:()=>{assert.equal(el('#region-next').disabled,false);el('#region-next').onclick();}};
}

test('production state picker renders 60 at a time with exact totals and searches beyond the current page',()=>{
  const h=harness(),cities=model.citiesByRegion.get(CA),expected=cities.map(R.id);
  h.open(CA);
  assert.equal(h.el('#region-dialog').open,true);
  assert.equal(h.el('#region-search-field').hidden,false);
  assert.equal(h.el('#region-prev').disabled,true);
  assert.deepEqual(h.ids(),expected.slice(0,60));
  assert.equal(h.el('#region-page-status').textContent,'共 '+expected.length+' 个地点 · 第 1 / '+Math.ceil(expected.length/60)+' 页');
  h.el('#region-dialog').scrollTop=320;h.next();
  assert.deepEqual(h.ids(),expected.slice(60,120));
  assert.equal(h.el('#region-dialog').scrollTop,0);
  assert.equal(h.el('#region-search').focused,true);
  h.next();assert.deepEqual(h.ids(),expected.slice(120,180));
  assert.equal(h.el('#region-next').disabled,true);
  h.search('Fixture Town 129');
  assert.deepEqual(h.ids(),[fixtureId(129)],'a town on a later page remains searchable');
  assert.equal(h.context.regionSelection.pageIndex,0);
  assert.equal(h.el('#region-pagination').hidden,true);
  h.buttons()[0].onclick();assert.deepEqual(h.opened,[fixtureId(129)]);
  h.search('no such fixture town');
  assert.deepEqual(h.ids(),[]);
  assert.equal(h.el('#region-page-status').textContent,'共 0 个地点 · 第 1 / 1 页');
  assert.match(h.el('#region-cities').innerHTML,/没有找到/);
  h.search('');assert.deepEqual(h.ids(),expected.slice(0,60));
});

test('production region search disambiguates same-name towns by state and preserves escaped text',()=>{
  const h=harness();h.open(CA);h.search('Same Fixture');
  assert.deepEqual(h.ids(),[fixtureId(130)]);
  assert.match(h.el('#region-cities').innerHTML,/West County/);
  h.open(TX);h.search('Same Fixture');
  assert.deepEqual(h.ids(),['world:USA:city-usplace4890000']);
  assert.match(h.el('#region-cities').innerHTML,/East County/);
  h.open(COUNTRY);h.search('Same Fixture');
  assert.deepEqual(new Set(h.ids()),new Set([fixtureId(130),'world:USA:city-usplace4890000']));
  h.open(CA);h.search('Pine & Hills');
  assert.match(h.el('#region-cities').innerHTML,/&lt;Pine &amp; Hills&gt;/);
  assert.match(h.el('#region-cities').innerHTML,/&lt;County &amp; Coast&gt;/);
  assert.doesNotMatch(h.el('#region-cities').innerHTML,/<Pine|<County/);
});

test('production picker reads each member visit dynamically and does not rewrite existing city or legacy records',()=>{
  const oldCity=originalCities.cities.find(city=>city.countryCode==='USA'&&city.parentRegionId===CA);
  const parentRecords={[oldCity.adcode]:row('原城市记录 <保留>'),[CA]:row('原州记录'),[COUNTRY]:row('原国家记录')};
  const childRecords={[fixtureId(129)]:row('孩子的新城镇记录')};
  const before=structuredClone({parentRecords,childRecords}),h=harness(parentRecords);
  h.open(CA);h.search('Fixture Town 129');
  assert.doesNotMatch(h.el('#region-cities').innerHTML,/已经去过/);
  h.context.records=childRecords;h.context.renderRegionCities();
  assert.match(h.el('#region-cities').innerHTML,/已经去过/);
  h.context.records={};h.context.renderRegionCities();
  assert.doesNotMatch(h.el('#region-cities').innerHTML,/已经去过/);
  h.context.records=parentRecords;h.open(CA);
  assert.equal(h.el('#region-legacy').hidden,false);
  h.el('#region-legacy').onclick();assert.equal(h.opened.at(-1),CA);
  assert.deepEqual(R.recordsWithFeatures(parentRecords,model).map(R.id),Object.keys(parentRecords));
  for(const original of originalCities.cities)assert.deepEqual(worldCities.cities.find(city=>city.adcode===original.adcode),original,'supplement preserves '+original.adcode);
  assert.deepEqual({parentRecords,childRecords},before);
});

test('production detail editor still shows original US city dates and notes after catalogue expansion',()=>{
  const oldCity=originalCities.cities.find(city=>city.countryCode==='USA'&&city.parentRegionId===CA),records={[oldCity.adcode]:row('旧城市的旅行记忆\n第二行')},before=structuredClone(records);
  const h=harness(records);
  Object.assign(h.context,{detailBusy:false,selected:null,detailContext:null,detailBase:{},
    cloud:{canEdit:()=>true,context:()=>({memberId:'self'}),getState:()=>({records,guest:true,memberName:'家长'})},
    visits:()=>R.recordsWithFeatures(records,model),isWorldLegacy:feature=>feature.properties.legacyKind==='world-region',
    isCountryLegacy:feature=>feature.properties.legacyKind==='world-country',toast:()=>assert.fail('editable fixture must not toast')});
  vm.runInContext(openCitySource,h.context);
  h.el('#region-dialog').open=true;h.context.openCity(oldCity.adcode);
  assert.equal(R.id(h.context.selected),oldCity.adcode);
  assert.equal(h.el('#detail-date').value,'2018-05-06');
  assert.equal(h.el('#detail-note').value,'旧城市的旅行记忆\n第二行');
  assert.equal(h.el('#detail-visited').checked,true);
  assert.equal(h.el('#region-dialog').open,false);
  assert.equal(h.el('#city-dialog').open,true);
  assert.deepEqual(records,before);
});

test('small-country pickers retain the complete city selection without showing pagination',()=>{
  const h=harness();h.open('world:ARE');
  assert.deepEqual(h.ids(),model.citiesByCountry.get('ARE').map(R.id));
  assert.equal(h.ids().length,7);
  assert.equal(h.el('#region-search-field').hidden,true);
  assert.equal(h.el('#region-pagination').hidden,true);
});

// Minimal data-join adapter: run the actual point renderer, recording the data
// joined to each SVG layer, rather than reproducing its selection logic.
function mockLayer(){
  const layer={items:[],keys:[],classes:new Map(),attributes:new Map()};
  const selection={
    data(items,key){layer.items=items;layer.keys=items.map(key);return this;},
    join(enter){if(typeof enter==='function')enter(this);return this;},
    append(){return this;},on(){return this;},text(){return this;},
    attr(name,value){layer.attributes.set(name,value);return this;},
    classed(name,value){layer.classes.set(name,layer.items.map(value));return this;}
  };
  layer.selectAll=()=>selection;return layer;
}

test('production point refresh caps 30,000 cities, retains focused results and leaves independent flags alone',()=>{
  const cities=Array.from({length:30000},(_,i)=>({type:'Feature',geometry:null,properties:{adcode:'world:USA:city-ui'+i,name:'Town '+i,center:[i%200*5,Math.floor(i/200)*4],level:'city',countryCode:'USA'}}));
  const selected=cities[15555],pointLayer=mockLayer(),labelLayer=mockLayer(),flags={retained:['parent-flag','child-flag']};
  const context={R,citySpatial:C.createSpatial(cities,point=>point),cityPointLayer:pointLayer,cityLabelLayer:labelLayer,
    cityMapPriority:new Set([R.id(cities[0])]),cityFocusId:R.id(selected),mapCityVisited:new Set([R.id(selected)]),
    cityPoints:null,cityPointLabels:null,mapHeight:1000,phoneLayout:{matches:true},projection:point=>point,markers:flags,openCity:()=>{}};
  vm.createContext(context);vm.runInContext(extract('function refreshCityPoints(transform,width){','function updateMapOverlays(){'),context);
  context.refreshCityPoints({k:1,x:0,y:0},390);
  assert.ok(pointLayer.items.length<=100&&pointLayer.items.length>0);
  assert.deepEqual(pointLayer.keys,labelLayer.keys);
  const index=pointLayer.keys.indexOf(R.id(selected));assert.ok(index>=0);
  assert.equal(pointLayer.classes.get('focused')[index],true);
  assert.equal(pointLayer.classes.get('visited')[index],true);
  for(const width of [601,720,850]){
    context.refreshCityPoints({k:1,x:0,y:0},width);
    assert.ok(pointLayer.items.length<=100,'phone layout at '+width+' px keeps the 100-point ceiling');
    assert.ok(pointLayer.keys.includes(R.id(selected)),'focused town remains visible at '+width+' px');
  }
  context.phoneLayout.matches=false;
  context.refreshCityPoints({k:1,x:0,y:0},1000);
  assert.ok(pointLayer.items.length>100&&pointLayer.items.length<=250,'desktop can show more cities within its 250-point ceiling');
  context.mapCityVisited=new Set();context.refreshCityPoints({k:1,x:0,y:0},390);
  assert.ok(pointLayer.classes.get('visited').every(value=>value===false));
  assert.deepEqual(flags,{retained:['parent-flag','child-flag']},'dot thinning cannot discard any member flag');
});

test('production zoom scheduling coalesces repeated events into one overlay update per frame',()=>{
  const queued=[];let updates=0;
  const context={overlayFrame:0,requestAnimationFrame:callback=>{queued.push(callback);return queued.length;},updateMapOverlays:()=>updates++};
  vm.createContext(context);vm.runInContext(extract('function scheduleMapOverlays(){','function refreshCityPoints(transform,width){'),context);
  for(let i=0;i<20;i++)context.scheduleMapOverlays();
  assert.equal(queued.length,1);assert.equal(updates,0);
  queued[0]();assert.equal(updates,1);assert.equal(context.overlayFrame,0);
  context.scheduleMapOverlays();assert.equal(queued.length,2);
});
