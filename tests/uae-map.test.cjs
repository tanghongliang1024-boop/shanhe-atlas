'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const d3 = require('../assets/d3.min.js');
const R = require('../region-model.js');
const F = require('../family-map-model.js');
const {validateRecords,createCloudArchiveStore} = require('../cloud-store.js');
const {createGuestArchiveStore,SHANHE_GUEST_STORAGE_KEY} = require('../guest-store.js');
const {validateDocument} = require('../family-store.js');
const {validateRecords:validateLandmarks} = require('../landmark-store.js');
const migration = require('../region-migration.js');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, '../assets', name), 'utf8'));
const worldIndex = read('geo/world-index.json'), worldCities = read('geo/world-cities.json');
const geometry = read('geo/world/ARE.geo.json');
const world = read('geo/world.geo.json').features, provinces = read('provinces.json').features;
const model = R.catalog(read('geo/china-prefecture-index.json'),worldIndex,
  [...read('cities.json').features,...read('taiwan-counties.json').features,...read('geo/china-index.json').features],
  read('geo/region-level-reversal-map.json'),worldCities,read('geo/china-prefecture-migration-map.json'));
const COUNTRY = 'world:ARE';
const CAPITALS = [
  ['AE-AZ','city-1159150565','阿布扎比'], ['AE-DU','city-1159151497','迪拜'],
  ['AE-SH','city-1159126943','沙迦'], ['AE-AJ','city-gn292932','阿治曼'],
  ['AE-UQ','city-1159126925','乌姆盖万'], ['AE-RK','city-1159134277','拉斯海玛'],
  ['AE-FU','city-1159134281','富查伊拉']
].map(([region,city,name])=>({region:'world:ARE:'+region,city:'world:ARE:'+city,name}));
const ABU_DHABI = CAPITALS[0].city, DUBAI = CAPITALS[1].city;
const row = (note='  原始旅行笔记\r\n保留空白与换行  ',date='2019-08-12') => ({visited:true,date,note,updatedAt:'2026-10-28T08:09:10.123Z'});
const resolved = records => R.recordsWithFeatures(records,model);
const detailFlags = records => R.groupMarkers(resolved(records),{kind:'country',code:'ARE'},world,provinces);
const worldFlags = records => R.groupMarkers(resolved(records),{kind:'world'},world,provinces);
const litRegions = records => geometry.features.filter(feature=>R.regionVisited(feature,resolved(records))).map(R.id);
const polygons = feature => feature.geometry.type==='MultiPolygon'?feature.geometry.coordinates:[feature.geometry.coordinates];

function boundaryDistanceKm(point,feature){
  const latScale=Math.PI/180*6371,lonScale=latScale*Math.cos(point[1]*Math.PI/180);
  let best=Infinity;
  for(const polygon of polygons(feature))for(const ring of polygon)for(let i=1;i<ring.length;i++){
    const a=[(ring[i-1][0]-point[0])*lonScale,(ring[i-1][1]-point[1])*latScale];
    const b=[(ring[i][0]-point[0])*lonScale,(ring[i][1]-point[1])*latScale];
    const delta=[b[0]-a[0],b[1]-a[1]],length=delta[0]**2+delta[1]**2;
    const t=length?Math.max(0,Math.min(1,-(a[0]*delta[0]+a[1]*delta[1])/length)):0;
    best=Math.min(best,Math.hypot(a[0]+t*delta[0],a[1]+t*delta[1]));
  }
  return best;
}

test('UAE has exactly seven selectable emirates and one real capital per emirate', () => {
  const country=model.countries.get('ARE');
  assert.equal(country.detailPath,'assets/geo/world/ARE.geo.json');
  assert.equal(country.childCount,7);
  assert.ok(worldIndex.detailCountries.includes('ARE'));
  const regions=worldIndex.regions.filter(region=>region.countryCode==='ARE');
  const cities=worldCities.cities.filter(city=>city.countryCode==='ARE');
  assert.equal(regions.length,7);assert.equal(cities.length,7);assert.equal(geometry.features.length,7);
  assert.deepEqual(new Set(regions.map(region=>region.adcode)),new Set(CAPITALS.map(item=>item.region)));
  assert.deepEqual(new Set(geometry.features.map(R.id)),new Set(CAPITALS.map(item=>item.region)));
  assert.deepEqual(new Set(cities.map(city=>city.adcode)),new Set(CAPITALS.map(item=>item.city)));
  assert.equal(new Set(cities.map(city=>city.parentRegionId)).size,7);
  for(const {region,city,name} of CAPITALS){
    const feature=model.byId.get(city);assert.ok(feature,name);
    assert.equal(feature.properties.parentRegionId,region,name);
    assert.deepEqual(feature.properties.capitalOf,[region],name+' is identified as the capital of only its emirate');
    assert.equal(feature.properties.level,'city');
    assert.equal(R.countryOf(feature),'ARE');
    assert.deepEqual(model.citiesByRegion.get(region).map(R.id),[city]);
    assert.ok(R.matches(feature,name,'ARE',region),name+' is searchable in its emirate');
  }
  assert.equal(model.byId.has(COUNTRY),false,'the previous whole-country choice becomes retained history');
});

test('each capital coordinate is in or near its own detailed geometry and contextual areas remain separate', () => {
  for(const {region,city,name} of CAPITALS){
    const point=model.byId.get(city).properties.center,shape=geometry.features.find(feature=>R.id(feature)===region);
    assert.equal(point.length,2);assert.ok(point.every(Number.isFinite));
    assert.ok(point[0]>=51&&point[0]<=57&&point[1]>=22&&point[1]<=27,name+' is in the UAE coordinate range');
    // Natural Earth coastlines are generalized; a coastal city may fall just outside.
    const distance=d3.geoContains(shape,point)?0:boundaryDistanceKm(point,shape);
    assert.ok(distance<=10,name+' is '+distance.toFixed(2)+' km outside its assigned emirate');
    assert.ok(polygons(shape).length>0);
    assert.ok(polygons(shape).every(polygon=>polygon.every(ring=>ring.length>=4)));
  }
  assert.equal(geometry.contextFeatures.length,2);
  const cityIds=new Set(model.features.map(R.id)),regionIds=new Set(worldIndex.regions.map(region=>region.adcode));
  for(const context of geometry.contextFeatures){
    assert.equal(context.properties.displayOnly,true);
    assert.ok(polygons(context).length>0,'shared areas keep their source land geometry');
    assert.equal(regionIds.has(R.id(context)),false,'a shared area must not be assigned to an emirate');
    assert.equal(cityIds.has(R.id(context)),false,'background context is not a record or search result');
    assert.equal(model.legacyById.has(R.id(context)),false);
    assert.equal(model.citiesByRegion.has(R.id(context)),false);
    assert.throws(()=>validateRecords({[R.id(context)]:row()}),/无效的地区编号/,'display-only IDs cannot enter saved archives');
  }
  const records=Object.fromEntries(CAPITALS.map(item=>[item.city,row(item.name)]));
  assert.deepEqual(new Set(detailFlags(records).map(R.id)),new Set(CAPITALS.map(item=>item.city)),'context geometry cannot introduce extra flags');
});

test('all nine original Natural Earth areas retain their exact geometry and 30 polygons', () => {
  // Independently calculated from the pinned original admin-1 source. These
  // hashes keep the regression self-contained without requiring the large cache.
  const originals={
    'ARE-341':['3c76173c53bd069bab0e00354ffb9d63f4afc69ff655a603fe16fad7736c21dd',3],
    'ARE-348':['da7c8b36ae340eebbf9dc9dbc23d01c382095620ff7831fee858f3744051370e',5],
    'ARE-338':['43180154a2b2a5dbf4199731fff14d288a7c93befd83335279598a735d43a124',2],
    'ARE-350':['7e8929418a73775adbc29d23f08b79bcfa080c6e740c3bab3e396a7f1a15c576',2],
    'ARE-344':['9ab4998c4147dff422165e048275eadbafb172729b16f4493b3969c8e8b0bd38',1],
    'ARE-347':['3f029bd9bc78a279bf2d23d658bfdf6e53c3fb5d5f0561f47caba899f4e691a2',1],
    'ARE-349':['cf8c40c97fb7b5d20930e617ec5ac281f46fcff0dd89677cc275d9f83533a8bc',13],
    'ARE-339':['998dafb5640338abd9ee2932455b61cd700ec1cafe5605de2c0c451cde03adc3',1],
    'ARE-346':['5834b777dbd4810016cc7eb6051ded354228ffc402fb34404a8f0414d460643a',2]
  };
  const areas=[...geometry.features,...geometry.contextFeatures];
  assert.equal(areas.length,9);
  assert.deepEqual(new Set(areas.map(feature=>feature.properties.sourceId)),new Set(Object.keys(originals)));
  for(const feature of areas){
    const [expectedHash,count]=originals[feature.properties.sourceId];
    const hash=crypto.createHash('sha256').update(JSON.stringify(feature.geometry)).digest('hex');
    assert.equal(hash,expectedHash,feature.properties.sourceId+' geometry stays byte-for-byte equivalent');
    assert.equal(feature.properties.sourceGeometrySha256,expectedHash);
    assert.equal(polygons(feature).length,count);
  }
  assert.equal(areas.flatMap(polygons).length,30);
  assert.equal(new Set(areas.flatMap(polygons).map(JSON.stringify)).size,30,'no shared area is copied into multiple emirates');
});

test('an old whole-UAE record stays accessible without inventing city visits or shading all emirates', () => {
  const records={[COUNTRY]:row()},before=structuredClone(records),old=model.legacyById.get(COUNTRY);
  assert.ok(old);assert.equal(old.properties.legacyKind,'world-country');assert.equal(old.properties.center,null);
  assert.equal(R.countryOf(old),'ARE');assert.ok(R.matches(old,'阿拉伯','ARE'));
  assert.deepEqual(resolved(records).map(R.id),[COUNTRY]);
  assert.deepEqual(litRegions(records),[]);
  assert.deepEqual(detailFlags(records),[]);
  assert.deepEqual(worldFlags(records).map(feature=>[R.id(feature),feature.count]),[[COUNTRY,1]]);
  assert.equal(new Set(resolved(records).map(R.countryOf)).size,1,'the country statistic remains one');
  assert.deepEqual(records,before);
  assert.ok(CAPITALS.every(item=>records[item.city]===undefined));
  for(const manifest of ['geo/world-city-migration-map.json','geo/county-migration-map.json','geo/region-level-reversal-map.json']){
    const result=migration.migrateRecords(records,read(manifest));
    assert.deepEqual(result.records,before,manifest+' must not infer a capital from the old country visit');
    assert.equal(result.changed,false);
  }
});

test('the production travel collection exposes the original UAE country date and notes', () => {
  const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
  const begin=source.indexOf('function renderCollection(){'),end=source.indexOf('function renderStats()',begin);
  assert.ok(begin>=0&&end>begin);
  const records={[COUNTRY]:row('  旧国家记忆 <保留>\r\n第二行  ')},before=structuredClone(records),elements=new Map();
  const el=selector=>{
    if(selector==='#start-exploring')return null;
    if(!elements.has(selector))elements.set(selector,{innerHTML:'',querySelectorAll:()=>[]});
    return elements.get(selector);
  };
  const helpers=source.slice(source.indexOf('const icon='),source.indexOf('const R='));
  const context={R,records,$:el,allVisits:()=>resolved(records),dateString:value=>value.replaceAll('-','.'),
    isCountryLegacy:feature=>feature.properties.legacyKind==='world-country',isWorldLegacy:feature=>feature.properties.legacyKind==='world-region'};
  vm.createContext(context);vm.runInContext(helpers+source.slice(begin,end)+'renderCollection();',context);
  const html=el('#visited-grid').innerHTML;
  assert.match(html,/data-city="world:ARE"/);
  assert.match(html,/旧国家足迹 · 内容完整保留/);
  assert.match(html,/2019\.08\.12/);
  assert.match(html,/旧国家记忆 &lt;保留&gt;\r\n第二行/);
  assert.doesNotMatch(html,/data-city="world:ARE:city-/);
  assert.deepEqual(records,before);
});

test('production progress counts current UAE cities separately from retained country history', () => {
  const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
  const begin=source.indexOf('function renderStats(){'),end=source.indexOf('function renderAll()',begin);
  assert.ok(begin>=0&&end>begin);
  const elements=new Map(),el=selector=>{
    if(!elements.has(selector))elements.set(selector,{innerHTML:''});
    return elements.get(selector);
  };
  const helpers=source.slice(source.indexOf('const icon='),source.indexOf('const R='));
  const context={R,d3,model,features:model.features,records:{[COUNTRY]:row('旧国家笔记')},$:el,landmarkStore:null,landmarkCatalog:null,cloud:null,
    dateString:value=>value?value.replaceAll('-','.'):'待补充'};
  context.visits=()=>resolved(context.records);
  vm.createContext(context);vm.runInContext(helpers+source.slice(begin,end)+'renderStats();',context);
  assert.match(el('#province-stats').innerHTML,/0 \/ 7 个地区 · 另有 1 条旧足迹/);
  assert.match(el('#province-stats').innerHTML,/width:0%/);
  assert.match(el('#timeline').innerHTML,/旧国家笔记/);
  assert.equal((el('#timeline').innerHTML.match(/class="timeline-item"/g)||[]).length,1);
  context.records={...context.records,...Object.fromEntries(CAPITALS.map(item=>[item.city,row(item.name)]))};
  const before=structuredClone(context.records);
  vm.runInContext('renderStats()',context);
  assert.match(el('#province-stats').innerHTML,/7 \/ 7 个地区 · 另有 1 条旧足迹/);
  assert.match(el('#province-stats').innerHTML,/width:100%/);
  assert.doesNotMatch(el('#province-stats').innerHTML,/8 \/ 7/);
  assert.equal((el('#timeline').innerHTML.match(/class="timeline-item"/g)||[]).length,8,'the original trip remains on the timeline');
  assert.match(el('#timeline').innerHTML,/旧国家笔记/);
  assert.deepEqual(context.records,before);
});

test('a capital visit shades only its own emirate and cancellation cannot resurrect it from a country record', () => {
  for(const {region,city,name} of CAPITALS){
    const records={[city]:row(name)},before=structuredClone(records);
    assert.deepEqual(litRegions(records),[region],name);
    assert.deepEqual(detailFlags(records).map(feature=>[R.id(feature),feature.target,feature.count]),[[city,'record',1]]);
    assert.deepEqual(worldFlags(records).map(feature=>[R.id(feature),feature.count]),[[COUNTRY,1]]);
    assert.deepEqual(records,before);
  }
  const records={[COUNTRY]:row('笼统国家记录'),[DUBAI]:row('迪拜')},original=structuredClone(records[COUNTRY]);
  assert.deepEqual(litRegions(records),['world:ARE:AE-DU']);
  assert.deepEqual(worldFlags(records).map(feature=>feature.count),[2],'old country and new city remain two independent records');
  delete records[DUBAI];
  assert.deepEqual(litRegions(records),[]);assert.deepEqual(detailFlags(records),[]);
  assert.deepEqual(records[COUNTRY],original);
  assert.deepEqual(worldFlags(records).map(feature=>feature.count),[1]);
});

test('family capital flags and cancellations are independent while country history produces no city flag', () => {
  const a={member:{id:'a',name:'小明',color:'blue'},records:{[COUNTRY]:row('小明国家历史'),[DUBAI]:row('小明迪拜')}};
  const b={member:{id:'b',name:'小花',color:'purple'},records:{[ABU_DHABI]:row('小花阿布扎比'),[DUBAI]:row('小花迪拜')}};
  const before=structuredClone([a,b]);
  const flags=entries=>F.regionMarkers(entries,{kind:'country',code:'ARE'},world,provinces,model,R);
  const initial=flags([a,b]),shared=initial.filter(feature=>R.id(feature)===DUBAI);
  assert.equal(initial.length,3);assert.equal(shared.length,2);
  assert.deepEqual(shared.map(feature=>feature.member.color),['blue','purple']);
  assert.ok(shared[1].flagOffset-shared[0].flagOffset>=44);
  assert.equal(initial.some(feature=>R.id(feature)===COUNTRY),false);
  assert.deepEqual([a,b],before);
  assert.deepEqual(new Set(flags([b]).map(R.id)),new Set([ABU_DHABI,DUBAI]));
  assert.deepEqual(flags([]),[]);
  const worldFlags=F.regionMarkers([a,b],{kind:'world'},world,provinces,model,R);
  assert.deepEqual(worldFlags.map(feature=>[R.id(feature),feature.member.id,feature.count]),[[COUNTRY,'a',2],[COUNTRY,'b',2]]);
  delete a.records[DUBAI];
  assert.deepEqual(flags([a]),[]);
  const remaining=flags([a,b]).filter(feature=>R.id(feature)===DUBAI);
  assert.equal(remaining.length,1);assert.equal(remaining[0].member.id,'b');assert.equal(remaining[0].flagOffset,0);
  assert.deepEqual(b,before[1]);assert.deepEqual(a.records[COUNTRY],before[0].records[COUNTRY]);
});

test('old-country and new capital records survive local and simulated cloud saves without conversion', async () => {
  const original={[COUNTRY]:row()},all={...original,...Object.fromEntries(CAPITALS.map(item=>[item.city,row(item.name)]))};
  assert.deepEqual(validateRecords(all),all);
  const data=new Map([[SHANHE_GUEST_STORAGE_KEY,JSON.stringify({version:5,revision:4,records:original})]]);
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const guest=createGuestArchiveStore({storage,locks:null});
  assert.deepEqual(guest.getState().records,original);
  assert.equal((await guest.save(all,{expectedRevision:4})).ok,true);
  assert.deepEqual(createGuestArchiveStore({storage,locks:null}).getState().records,all);
  const cloudState={records:structuredClone(original),revision:10},writes=[];
  const transport={read:async()=>structuredClone(cloudState),write:async(userId,payload)=>{
    assert.equal(userId,'synthetic-uae-account');assert.equal(payload.expectedRevision,cloudState.revision);
    writes.push(structuredClone(payload));cloudState.records=structuredClone(payload.records);cloudState.revision++;
    return structuredClone(cloudState);
  }};
  const cloud=createCloudArchiveStore({transport});
  assert.equal((await cloud.setUser('synthetic-uae-account')).ok,true);
  assert.equal((await cloud.save(all,{expectedRevision:10})).ok,true);
  assert.equal(writes.length,1);assert.deepEqual(writes[0].records,all);
  await cloud.refresh();assert.deepEqual(cloud.getState().records,all);
  const cancelled={...all};delete cancelled[DUBAI];
  assert.equal((await cloud.save(cancelled,{expectedRevision:11})).ok,true);
  await cloud.refresh();assert.deepEqual(cloud.getState().records,cancelled);
  assert.deepEqual(cloud.getState().records[COUNTRY],original[COUNTRY]);
});

test('family archive validation accepts all seven capital IDs while preserving separate child records', () => {
  const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002';
  const document={version:1,members:[{id:'self',name:'家长',color:'terracotta'},{id:a,name:'小明',color:'blue'},{id:b,name:'小花',color:'purple'}],
    regions:{[a]:{[COUNTRY]:row('旧国家记录'),...Object.fromEntries(CAPITALS.map(item=>[item.city,row('小明 '+item.name)]))},[b]:{[DUBAI]:row('小花独立日期','2025-02-03')}},landmarks:{[a]:{},[b]:{}}};
  const before=structuredClone(document),validated=validateDocument(document,{regions:validateRecords,landmarks:validateLandmarks});
  assert.deepEqual(validated,before);assert.deepEqual(document,before);
  delete validated.regions[a][DUBAI];
  const next=validateDocument(validated,{regions:validateRecords,landmarks:validateLandmarks});
  assert.equal(next.regions[a][DUBAI],undefined);assert.deepEqual(next.regions[b],before.regions[b]);
  assert.deepEqual(next.regions[a][COUNTRY],before.regions[a][COUNTRY]);
});
