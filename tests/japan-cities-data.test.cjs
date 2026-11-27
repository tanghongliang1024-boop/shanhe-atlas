'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const R=require('../region-model.js'),C=require('../city-catalog.js'),F=require('../family-map-model.js');
const read=file=>JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/geo',file),'utf8'));
const data=read('world-cities.json'),index=read('world-index.json'),japan=data.cities.filter(c=>c.countryCode==='JPN');
const originalIds=new Set(('1159141289 1159149965 1159151399 1159147171 1159147175 1159147181 1159149971 1159147169 1159141325 1159149973 1159141317 1159147177 1159141307 1159130371 gn1855395 1159130357 1159130365 gn6940394 gn2113015 1159130375 1159151609 1159130361 1159147167 gn1860672 gn1863357 1159141321 1159147183 1159130341 1159130345 1159147157 1159141295 1159141313 1159141263 1159149961 1159141255 gn1850892 1159141267 1159141271 1159149959 1159141259 1159130353 1159141299 1159149967 1159151537 1159147165 gn1855612 1159141303 1159141027 1159141025 1159130231 1159141017 1159151389 1159130233 gn1848689 1159130271 1159130267 1159147127 1159149935 1159141097 1159149927 gn1853303 1159141033 1159150893 1159141101 1159141105 1159149929 1159130263 1159147123 1159149931').split(' ').map(id=>'world:JPN:city-'+id));
const added=japan.filter(c=>!originalIds.has(c.adcode));
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const model=R.catalog(read('china-prefecture-index.json'),index,[],null,data),cities=model.citiesByCountry.get('JPN');

test('Japan adds 50 cities and towns while preserving all 69 existing records and other countries',()=>{
  assert.equal(japan.length,119);assert.equal(added.length,50);
  assert.equal(hash(japan.filter(c=>originalIds.has(c.adcode))),'d90fbddbf917b1a8ca48159ec4228edb206e0b5009107f6016e761b2e1de9e4e');
  assert.equal(hash(data.cities.filter(c=>c.countryCode!=='JPN')),'ecd4d65b7e93a64b5e8be1650de59de5e07dad65c1db0d1fb259ea02b63cbb08');
  assert.equal(hash(data.legacyCities),'70e412000078e73d6bef5cd11f183f6f5cf2459b06d239ed6d55ee750ba492ac');
  assert.equal(hash(data.exceptions),'58e148b7856de9ae25fda3cf648ca07033b7770b07bc0c87c665e39b515c6f66');
  assert.equal(new Set(data.cities.map(c=>c.adcode)).size,data.cities.length);
});

test('Japan retains its 47 prefecture geometries and every city resolves to its actual prefecture',()=>{
  const geometry=fs.readFileSync(path.join(__dirname,'../assets/geo/world/JPN.geo.json'));
  assert.equal(crypto.createHash('sha256').update(geometry).digest('hex'),'e1a5d0d496757948301c5e7207d8e38239d00bd0371054c6795e0ec0aacdea49');
  const prefectures=index.regions.filter(r=>r.countryCode==='JPN');assert.equal(prefectures.length,47);
  const parents=new Map(prefectures.map(p=>[p.adcode,p]));
  for(const city of japan){
    assert.ok(parents.has(city.parentRegionId),city.name);assert.equal(city.provinceCode,city.parentRegionId);
    assert.equal(city.province,parents.get(city.parentRegionId).name);assert.equal(city.country,'日本');assert.equal(city.level,'city');
    assert.ok(model.citiesByRegion.get(city.parentRegionId).some(c=>R.id(c)===city.adcode));
    assert.ok(city.center.every(Number.isFinite));assert.ok(city.center[0]>=122&&city.center[0]<=154&&city.center[1]>=20&&city.center[1]<=46);
  }
});

test('new Japanese destinations are separately sourced cities or towns with searchable names',()=>{
  const search=C.createSearch(cities,R);
  for(const city of added){
    assert.ok(['city','town'].includes(city.placeType),city.name+' must not be a village, attraction or neighbourhood');
    assert.match(city.sourceUrl,/^https:\/\//);assert.ok(city.sourceId);assert.ok(city.nameEn);
    assert.ok(city.aliases.length>0);
    for(const query of [city.name,city.nameEn,...city.aliases.filter(a=>/[ぁ-んァ-ン]/.test(a))]){
      assert.ok(search.query({query,country:'JPN',province:city.parentRegionId}).some(f=>R.id(f)===city.adcode),city.name+': '+query);
    }
  }
  const first=C.page(search.query({country:'JPN'}),0,60),second=C.page(search.query({country:'JPN'}),1,60);
  assert.equal(first.total,119);assert.equal(first.items.length,60);assert.equal(second.items.length,59);
  assert.equal(new Set([...first.items,...second.items].map(R.id)).size,119);
});

const row=note=>({visited:true,date:'2024-05-06',note,updatedAt:'2026-10-29T01:02:03Z'});
test('existing and new Japan city records retain separate family flags and original dates and notes',()=>{
  const oldId=[...originalIds][0],newId=added[0]?.adcode;assert.ok(newId);
  const input=[{member:{id:'self',name:'家长',color:'terracotta'},records:{[oldId]:row('旧城市\n原笔记'),[newId]:row('新城市')}},{member:{id:'child',name:'孩子',color:'blue'},records:{[newId]:row('孩子自己的笔记')}}];
  const before=structuredClone(input),world=read('world.geo.json').features;
  const flags=F.regionMarkers(input,{kind:'country',code:'JPN'},world,[],model,R);
  assert.equal(flags.length,3);assert.equal(flags.filter(f=>R.id(f)===newId).length,2);
  assert.deepEqual(R.recordsWithFeatures(input[0].records,model).map(R.id),[oldId,newId]);
  const overview=F.regionMarkers(input,{kind:'world'},world,[],model,R);assert.deepEqual(overview.map(f=>f.count),[2,1]);
  assert.deepEqual(input,before);
  delete input[1].records[newId];assert.equal(F.regionMarkers(input,{kind:'country',code:'JPN'},world,[],model,R).length,2);
  assert.deepEqual(input[0],before[0]);
});

const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const extract=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a);assert.ok(a>=0&&b>a);return source.slice(a,b);};
const locateSource=extract("$('#detail-show-map').onclick=",'function localGeometry(f)');
function locationHarness(feature){
  const elements=new Map(),moves=[],regionFocus=[];
  const el=id=>{if(!elements.has(id))elements.set(id,{value:'',open:true,close(){this.open=false;},scrollIntoView(){this.scrolled=true;}});return elements.get(id);};
  const svg={transition(){return this;},duration(){return this;},call(fn,transform){moves.push(transform);return this;}};
  const context={$:el,R,selected:feature,scope:{kind:'world'},currentView:'map',mapRequest:0,cityFocusId:null,mapHeight:1000,svg,zoom:{transform(){}},
    projection:point=>[point[0]*2,point[1]*3],isWorldLegacy:()=>false,isCountryLegacy:()=>false,
    focusRegion:id=>regionFocus.push(id),goView:view=>{context.currentView=view;},
    navigate:async next=>{context.mapRequest++;context.scope=next;},
    d3:{zoomIdentity:{translate(x,y){return {x,y,scale(k){return {x,y,k};}};}}}};
  vm.createContext(context);vm.runInContext(locateSource,context);
  return {context,el,moves,regionFocus,locate:()=>el('#detail-show-map').onclick()};
}

test('Japanese city detail locates the chosen city centre, focuses it and scrolls the mobile map into view',async()=>{
  for(const city of [cities[0],cities.at(-1)]){
    const h=locationHarness(city);await h.locate();const point=h.context.projection(city.properties.center),move=h.moves[0];
    assert.equal(h.context.scope.code,'JPN');assert.equal(h.context.cityFocusId,R.id(city));assert.equal(move.k,12);
    assert.equal(point[0]*move.k+move.x,500);assert.equal(point[1]*move.k+move.y,500);
    assert.deepEqual(h.regionFocus,[]);assert.equal(h.el('#map-stage').scrolled,true);assert.equal(h.el('#city-dialog').open,false);
  }
});

test('city location preserves US zoom and county/province focus for Chinese records',async()=>{
  const us=locationHarness(model.citiesByCountry.get('USA')[0]);await us.locate();assert.equal(us.moves[0].k,32);
  const china=model.features.find(f=>R.countryOf(f)==='CHN'),cn=locationHarness(china);await cn.locate();
  assert.equal(cn.moves.length,0);assert.equal(cn.regionFocus.length,1);assert.equal(cn.context.scope.kind,'province');
});

test('an obsolete map request or switched view cannot apply a delayed city focus',async()=>{
  for(const changed of ['map','view']){
    const h=locationHarness(cities[0]);let finish;
    h.context.navigate=next=>{h.context.mapRequest++;h.context.scope=next;return new Promise(resolve=>{finish=resolve;});};
    const pending=h.locate();if(changed==='map')h.context.mapRequest++;else h.context.currentView='stats';finish();await pending;
    assert.equal(h.moves.length,0);assert.equal(h.context.cityFocusId,null);assert.equal(h.el('#map-stage').scrolled,undefined);
  }
});

test('focused Japan city label is evaluated first even when the small-country spatial list retains every city',()=>{
  const order=[],chain={data(items){order.push(items);return this;},selectAll(){return this;},join(){return this;},attr(){return this;},classed(){return this;},text(){return this;}};
  const context={R,phoneLayout:{matches:true},mapHeight:1000,citySpatial:C.createSpatial(cities,p=>p),cityPointLayer:chain,cityLabelLayer:chain,cityMapPriority:new Set(),cityFocusId:R.id(cities.at(-1)),mapCityVisited:new Set(),projection:p=>p};
  vm.createContext(context);vm.runInContext(extract('function refreshCityPoints(', 'function updateMapOverlays('),context);
  context.refreshCityPoints({k:1,x:0,y:0},390);
  assert.equal(order[0].length,cities.length);assert.equal(R.id(order[1][0]),context.cityFocusId);
  assert.deepEqual(new Set(order[1].map(R.id)),new Set(cities.map(R.id)));
});
