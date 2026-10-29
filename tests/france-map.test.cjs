'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const R = require('../region-model.js');
const F = require('../family-map-model.js');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, '../assets', name), 'utf8'));
const originalWorld = read('geo/world.geo.json').features;
const franceParts = read('geo/world-france-parts.geo.json').features;
const world = originalWorld.flatMap(feature => R.id(feature) === 'world:FRA' ? franceParts : [feature]);
const worldIndex = read('geo/world-index.json');
const provinces = read('provinces.json').features;
const model = R.catalog(read('geo/china-prefecture-index.json'), worldIndex,
  [...read('cities.json').features, ...read('taiwan-counties.json').features, ...read('geo/china-index.json').features],
  read('geo/region-level-reversal-map.json'), read('geo/world-cities.json'), read('geo/china-prefecture-migration-map.json'));
const appSource = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const MAINLAND = 'world:FRA';
const OVERSEAS = ['GF', 'GP', 'MQ', 'RE', 'YT'].map(code => 'world:FRA:FR-' + code);
const PARIS = 'world:FRA:city-1159151613', AJACCIO = 'world:FRA:city-1159141961';
// Real city records for Cayenne, Basse-Terre, Fort-de-France, Saint-Denis and Mamoudzou.
const OVERSEAS_CITIES = [
  ['world:FRA:city-1159150911', OVERSEAS[0]],
  ['world:FRA:city-1159143181', OVERSEAS[1]],
  ['world:FRA:city-1159140257', OVERSEAS[2]],
  ['world:FRA:city-1159150179', OVERSEAS[3]],
  ['world:FRA:city-gn921815', OVERSEAS[4]]
];
const REUNION_CITY = OVERSEAS_CITIES[3][0];
const row = (note = '  首次旅行\r\n保留原文  ') => ({visited:true, date:'2023-08-16', note, updatedAt:'2026-10-28T12:00:00.123Z'});
const visits = records => R.recordsWithFeatures(records, model);
const shaded = records => franceParts.filter(feature => R.worldVisited(feature, visits(records))).map(R.id);
const flags = records => R.groupMarkers(visits(records), {kind:'world'}, world, provinces);
const polygons = feature => feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [feature.geometry.coordinates];

test('France display parts preserve all 21 original polygons and cover exactly its 18 indexed regions', () => {
  const original = originalWorld.find(feature => R.id(feature) === MAINLAND);
  assert.equal(franceParts.length, 6);
  assert.deepEqual(new Set(franceParts.map(R.id)), new Set([MAINLAND, ...OVERSEAS]));
  const originalPolygons = polygons(original).map(JSON.stringify).sort();
  const splitPolygons = franceParts.flatMap(polygons).map(JSON.stringify).sort();
  assert.equal(originalPolygons.length, 21);
  assert.deepEqual(splitPolygons, originalPolygons, 'no island may be dropped, copied, clipped or redrawn');
  assert.equal(new Set(splitPolygons).size, 21);

  const mainland = franceParts.find(feature => R.id(feature) === MAINLAND);
  const franceRegions = worldIndex.regions.filter(region => region.countryCode === 'FRA').map(region => region.adcode);
  assert.equal(mainland.properties.worldRegionIds.length, 13);
  assert.ok(mainland.properties.worldRegionIds.includes('world:FRA:FR-COR'), 'Corsica remains in metropolitan France');
  assert.deepEqual(new Set(franceParts.flatMap(feature => feature.properties.worldRegionIds)), new Set(franceRegions));
  assert.equal(franceParts.flatMap(feature => feature.properties.worldRegionIds).length, 18, 'regions belong to exactly one display part');
  const envelopes = {
    [MAINLAND]:[-6,41,10,52], [OVERSEAS[0]]:[-55,2,-51,6], [OVERSEAS[1]]:[-62,15,-60,17],
    [OVERSEAS[2]]:[-62,14,-60,15.5], [OVERSEAS[3]]:[55,-22,56,-20], [OVERSEAS[4]]:[44,-14,46,-12]
  };
  for (const part of franceParts) {
    assert.equal(part.properties.countryCode, 'FRA');
    assert.equal(part.properties.parentCountryId, MAINLAND);
    assert.equal(part.properties.detailPath, original.properties.detailPath);
    assert.ok(part.properties.center.every(Number.isFinite));
    if (R.id(part) !== MAINLAND) assert.deepEqual(part.properties.worldRegionIds, [R.id(part)]);
    const [west,south,east,north] = envelopes[R.id(part)];
    assert.ok(polygons(part).flat(2).every(([lon,lat]) => lon >= west && lon <= east && lat >= south && lat <= north), R.id(part) + ' receives the correct original geometry');
  }
});

test('production map initialization replaces only France and leaves every other feature untouched', async () => {
  // Execute the short production asset-loading block rather than reimplementing its merge.
  const start = appSource.indexOf('const [wg,');
  const end = appSource.indexOf('if(tg.outline)', start);
  assert.ok(start >= 0 && end > start, 'map-loading block remains identifiable');
  const loaded = new Map();
  const result = await vm.runInNewContext('(async()=>{let world,provinces;' + appSource.slice(start,end) + 'return {world,provinces};})()', {
    R, jsonFile: async filename => {
      const data = read(filename.replace(/^assets\//, ''));
      loaded.set(filename, data);
      return data;
    }
  });
  assert.ok(loaded.has('assets/geo/world-france-parts.geo.json'));
  const input = loaded.get('assets/geo/world.geo.json').features;
  assert.equal(result.world.length, input.length + 5);
  for (const feature of input.filter(feature => R.id(feature) !== MAINLAND)) {
    assert.equal(result.world.find(item => R.id(item) === R.id(feature)), feature, R.id(feature) + ' is passed through unchanged');
  }
  assert.deepEqual(result.world.filter(feature => feature.properties.countryCode === 'FRA'), loaded.get('assets/geo/world-france-parts.geo.json').features);
  assert.deepEqual(loaded.get('assets/geo/world.geo.json').features, originalWorld, 'loading does not mutate the source geometry');
});

test('Paris, Corsica and each of the five overseas city visits shade and flag only their own display part', () => {
  for (const [cityId, expectedPart] of [[PARIS,MAINLAND], [AJACCIO,MAINLAND], ...OVERSEAS_CITIES]) {
    const city = model.byId.get(cityId);
    assert.ok(city, cityId + ' is a real selectable city');
    assert.equal(city.properties.level, 'city');
    const records = {[cityId]:row(city.properties.name)}, before = structuredClone(records);
    assert.deepEqual(shaded(records), [expectedPart], city.properties.name);
    const markers = flags(records);
    assert.deepEqual(markers.map(feature => [R.id(feature),feature.count,feature.target]), [[expectedPart,1,'country']]);
    assert.deepEqual(records, before, 'drawing retains the original date, note and timestamp');
  }
});

test('world flag counts are per France part and unrelated countries keep their own count', () => {
  const records = {[PARIS]:row('巴黎'), [AJACCIO]:row('科西嘉'), 'world:FRA:city-1159148505':row('库鲁'), 'world:MUS':row('毛里求斯')};
  for (const [cityId] of OVERSEAS_CITIES) records[cityId] = row(cityId);
  const before = structuredClone(records), markers = flags(records);
  assert.equal(markers.length, 7);
  assert.deepEqual(new Map(markers.map(feature => [R.id(feature),feature.count])), new Map([
    [MAINLAND,2], [OVERSEAS[0],2], ...OVERSEAS.slice(1).map(id => [id,1]), ['world:MUS',1]
  ]));
  assert.equal(markers.reduce((sum,feature) => sum + feature.count, 0), Object.keys(records).length);
  assert.deepEqual(new Set(shaded(records)), new Set([MAINLAND,...OVERSEAS]));
  assert.deepEqual(records, before);
});

test('legacy region records retain their own part while a country-only France record shades mainland alone', () => {
  for (const region of worldIndex.regions.filter(region => region.countryCode === 'FRA')) {
    const records = {[region.adcode]:row('旧大区完整笔记')}, before = structuredClone(records);
    assert.equal(visits(records)[0].properties.legacyKind, 'world-region');
    const expected = OVERSEAS.includes(region.adcode) ? region.adcode : MAINLAND;
    assert.deepEqual(shaded(records), [expected]);
    assert.deepEqual(flags(records).map(feature => [R.id(feature),feature.count]), [[expected,1]]);
    assert.deepEqual(records, before);
  }
  const records = {[MAINLAND]:row('旧国家足迹，未提供具体城市')}, before = structuredClone(records);
  assert.equal(visits(records)[0].properties.legacyKind, 'world-country');
  assert.deepEqual(shaded(records), [MAINLAND]);
  assert.deepEqual(flags(records).map(feature => [R.id(feature),feature.count]), [[MAINLAND,1]]);
  assert.deepEqual(records, before);
  assert.equal(records[PARIS], undefined, 'an old country visit must not invent a city visit');
  records[OVERSEAS[3]] = row('另有留尼汪旧记录');
  assert.deepEqual(new Map(flags(records).map(feature => [R.id(feature),feature.count])), new Map([[MAINLAND,1],[OVERSEAS[3],1]]));
});

test('secondary region associations are respected without accepting foreign, excluded or unknown France visits', () => {
  const source = model.byId.get(PARIS);
  const shared = {...source,properties:{...source.properties,regionIds:[...source.properties.regionIds,OVERSEAS[3]]}};
  assert.deepEqual(franceParts.filter(feature => R.worldVisited(feature,[shared])).map(R.id), [MAINLAND,OVERSEAS[3]]);
  assert.deepEqual(R.groupMarkers([shared],{kind:'world'},world,provinces).map(feature => [R.id(feature),feature.count]), [[MAINLAND,1],[OVERSEAS[3],1]], 'matching two associations does not double-count within either part');
  const foreign = {...shared,properties:{...shared.properties,countryCode:'ITA'}};
  const excluded = {...shared,properties:{...shared.properties,mapExcluded:true}};
  const unknown = visits({'world:FRA:unknown-place':row()})[0];
  for (const invalid of [foreign,excluded,unknown]) assert.ok(franceParts.every(feature => !R.worldVisited(feature,[invalid])));
  assert.deepEqual(R.groupMarkers([excluded,unknown],{kind:'world'},world,provinces),[]);
});

test('cancelling one France part removes its color and flag without changing other visits', () => {
  const records = {[PARIS]:row('巴黎'), [AJACCIO]:row('科西嘉'), [REUNION_CITY]:row('留尼汪')};
  const reunion = structuredClone(records[REUNION_CITY]);
  delete records[PARIS];
  assert.deepEqual(new Map(flags(records).map(feature => [R.id(feature),feature.count])), new Map([[MAINLAND,1],[OVERSEAS[3],1]]));
  records[AJACCIO] = {...records[AJACCIO],visited:false};
  assert.deepEqual(shaded(records), [OVERSEAS[3]]);
  assert.deepEqual(flags(records).map(feature => R.id(feature)), [OVERSEAS[3]]);
  assert.deepEqual(records[REUNION_CITY], reunion);
  delete records[REUNION_CITY];
  assert.deepEqual(shaded(records), []);
  assert.deepEqual(flags(records), []);
  assert.equal(records[AJACCIO].note, '科西嘉', 'unvisited record content is not rewritten by rendering');
});

test('family mainland and overseas flags stay separate through member selection and cancellation', () => {
  const a = {member:{id:'child-a',name:'小明',color:'blue'},records:{[PARIS]:row('小明巴黎'),[AJACCIO]:row('小明科西嘉')}};
  const b = {member:{id:'child-b',name:'小花',color:'purple'},records:{[REUNION_CITY]:row('小花留尼汪')}};
  const familyFlags = entries => F.regionMarkers(entries,{kind:'world'},world,provinces,model,R);
  const before = structuredClone([a,b]), initial = familyFlags([a,b]);
  assert.deepEqual(initial.map(feature => [R.id(feature),feature.member.id,feature.count,feature.flagOffset]), [[MAINLAND,'child-a',2,0],[OVERSEAS[3],'child-b',1,0]]);
  assert.deepEqual([a,b],before);
  assert.deepEqual(familyFlags([b]).map(feature => R.id(feature)),[OVERSEAS[3]]);
  assert.deepEqual(familyFlags([a]).map(feature => R.id(feature)),[MAINLAND]);
  assert.deepEqual(familyFlags([]),[]);
  a.records[REUNION_CITY] = row('小明另一次留尼汪');
  const overlapping = familyFlags([a,b]).filter(feature => R.id(feature) === OVERSEAS[3]);
  assert.deepEqual(overlapping.map(feature => feature.member.color),['blue','purple']);
  assert.ok(overlapping[1].flagOffset - overlapping[0].flagOffset >= 44);
  delete a.records[REUNION_CITY]; delete a.records[PARIS]; delete a.records[AJACCIO];
  const remaining = familyFlags([a,b]);
  assert.deepEqual(remaining.map(feature => [R.id(feature),feature.member.id,feature.flagOffset]),[[OVERSEAS[3],'child-b',0]]);
  assert.deepEqual(b,before[1],'one family member cannot alter the other member date or notes');
});

test('production world shading uses the split matching rule for Paris and Reunion', () => {
  const start = appSource.indexOf('function renderMapState(){');
  const end = appSource.indexOf('function renderLandmarkMap()',start);
  assert.ok(start >= 0 && end > start);
  let currentRecords = {[PARIS]:row()}, highlighted = [];
  const context = {
    R, ShanheFamilyMap:F, model, world, provinces, scope:{kind:'world'}, mode:'fill',
    mapVisits:()=>visits(currentRecords),
    mapMemberEntries:()=>[{member:{id:'self'},records:currentRecords}],
    cityShapes:{classed(name, predicate){assert.equal(name,'visited');highlighted=franceParts.filter(predicate).map(R.id);}},
    cityPoints:null, countryLocators:null, southMarkers:null,
    markers:{selectAll(){return {remove(){}};}},
    renderLandmarkMap(){}, updateMapOverlays(){}
  };
  vm.createContext(context);
  vm.runInContext(appSource.slice(start,end),context);
  vm.runInContext('renderMapState()',context);
  assert.deepEqual(highlighted,[MAINLAND]);
  currentRecords = {[REUNION_CITY]:row()};
  vm.runInContext('renderMapState()',context);
  assert.deepEqual(highlighted,[OVERSEAS[3]]);
  currentRecords = {};
  vm.runInContext('renderMapState()',context);
  assert.deepEqual(highlighted,[]);
});
