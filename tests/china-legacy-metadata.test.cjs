'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const R=require('../region-model.js');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../assets',name),'utf8'));
const metadata=read('geo/china-legacy-metadata.json');
const originalProvinces=read('provinces.json').features.filter(feature=>/^\d{6}$/.test(String(feature.properties.adcode)));
const originalLegacy=[...read('cities.json').features,...read('taiwan-counties.json').features];
const withoutGeometry=feature=>({...feature,geometry:null});
const china=read('geo/china-prefecture-index.json'),counties=read('geo/china-index.json'),world=read('geo/world-index.json');
const reversal=read('geo/region-level-reversal-map.json'),migration=read('geo/china-prefecture-migration-map.json');
const cities=R.withCitySupplement(read('geo/world-cities.json'),read('geo/us-cities.json'),world);
const before=R.catalog(china,world,[...originalLegacy,...counties.features],reversal,cities,migration);
const after=R.catalog(china,world,[...metadata.legacy,...counties.features],reversal,cities,migration);

// Geometry is the sole intentional difference. Preserve Map key types and
// insertion order, array order, feature IDs, and every other enumerable field.
function comparable(value){
  if(value instanceof Map)return [...value].map(([key,item])=>[key,comparable(item)]);
  if(Array.isArray(value))return value.map(comparable);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,key==='geometry'?null:comparable(item)]));
  return value;
}

test('lightweight metadata retains every province and old city in its original order and ID type',()=>{
  assert.equal(metadata.version,1);
  assert.equal(metadata.provinces.length,34);
  assert.equal(metadata.legacy.length,392);
  assert.deepEqual(metadata.provinces,originalProvinces.map(withoutGeometry));
  assert.deepEqual(metadata.legacy,originalLegacy.map(withoutGeometry));
  for(const feature of [...metadata.provinces,...metadata.legacy])assert.equal(feature.geometry,null);
  const bytes=fs.readFileSync(path.join(__dirname,'../assets/geo/china-legacy-metadata.json'));
  assert.ok(bytes.length<85000,'metadata must not bring the old boundary payload back to startup');
  assert.ok(zlib.gzipSync(bytes).length<13000,'compressed metadata must remain small');
});

test('all catalog directories retain their complete data with the full US city supplement',()=>{
  assert.ok(after.citiesByCountry.get('USA').length>20000,'exercise the complete US supplement');
  assert.deepEqual(Object.keys(after),Object.keys(before));
  for(const key of Object.keys(before)){
    if(before[key] instanceof Map){
      assert.ok(after[key] instanceof Map,key+' remains a Map');
      assert.deepEqual([...after[key].keys()],[...before[key].keys()],key+' identifiers and ordering');
    }
    assert.deepEqual(comparable(after[key]),comparable(before[key]),key+' data');
  }
});

test('historical records retain their labels, country statistics and flags at every map level',()=>{
  const ids=[...before.byId.keys(),...before.legacyById.keys()];
  const records=Object.fromEntries(ids.map((id,index)=>[id,{visited:index%5!==0,date:'2019-03-12',note:'历史足迹'}]));
  records['710000']={visited:true,date:'2018-01-02',note:'旧版台湾省记录'};
  const oldVisits=R.recordsWithFeatures(records,before),newVisits=R.recordsWithFeatures(records,after);
  assert.deepEqual(comparable(newVisits),comparable(oldVisits));
  const stats=visits=>({total:visits.length,countries:[...new Set(visits.filter(f=>!f.properties.prefectureTarget).map(R.countryOf))].sort(),china:visits.filter(f=>R.countryOf(f)==='CHN'&&f.properties.level!=='legacy').length});
  assert.deepEqual(stats(newVisits),stats(oldVisits));
  const france=read('geo/world-france-parts.geo.json').features;
  const countries=read('geo/world.geo.json').features.flatMap(f=>R.id(f)==='world:FRA'?france:[f]);
  for(const scope of [{kind:'world'},{kind:'china'},{kind:'province',code:'440000'},{kind:'province',code:'710000'},{kind:'country',code:'USA'},{kind:'country',code:'FRA'}]){
    assert.deepEqual(comparable(R.groupMarkers(newVisits,scope,countries,metadata.provinces)),comparable(R.groupMarkers(oldVisits,scope,countries,originalProvinces)),JSON.stringify(scope));
  }
  for(const target of ['110000','441300','tw-63000'])assert.deepEqual(comparable(R.prefectureHistory(records,target,after)),comparable(R.prefectureHistory(records,target,before)),target+' historical records');
});
