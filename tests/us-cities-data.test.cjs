'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {readSource,buildUsCities,cityId}=require('../scripts/build-us-cities.cjs');
const read=file=>JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/geo',file)));
const source=readSource(),base=read('world-cities.json'),index=read('world-index.json'),supplement=read('us-cities.json');
const queries=new Map(source.queries.map(q=>[q.name,q]));
const attributes=name=>queries.get(name).response.features.map(f=>f.attributes);
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');

test('frozen official Census source reproduces the supplement without changing existing data',()=>{
  const beforeBase=JSON.stringify(base),beforeIndex=JSON.stringify(index),result=buildUsCities(source,base,index);
  assert.equal(hash(JSON.stringify(result)+'\n'),hash(fs.readFileSync(path.join(__dirname,'../assets/geo/us-cities.json'))));
  assert.equal(JSON.stringify(base),beforeBase);assert.equal(JSON.stringify(index),beforeIndex);
  assert.equal(result.coverage.totalCityCount,23051);assert.equal(result.rows.length,22944);assert.equal(result.matchedExisting.length,107);
  assert.equal(result.retiredRows.length,12555);assert.equal(result.retiredExisting.length,2);
});

test('incorporated places and legal towns remain current while every CDP is retained only for history',()=>{
  const represented=new Set(supplement.rows.map(r=>r[1]+':'+r[0]));
  for(const match of supplement.matchedExisting){const key=match.kind+':'+match.geoid;assert.ok(!represented.has(key));represented.add(key);assert.ok(base.cities.some(c=>c.adcode===match.adcode));}
  const retired=new Set(supplement.retiredRows.map(r=>r[1]+':'+r[0]));
  for(const match of supplement.retiredExisting){const key=match.kind+':'+match.geoid;assert.ok(!retired.has(key));retired.add(key);assert.ok(base.cities.some(c=>c.adcode===match.adcode));}
  for(const p of attributes('incorporated')){assert.ok(represented.has('place:'+p.GEOID));assert.ok(!retired.has('place:'+p.GEOID));}
  for(const p of attributes('cdp')){assert.ok(retired.has('place:'+p.GEOID));assert.ok(!represented.has('place:'+p.GEOID));}
  const excluded=new Set(supplement.representedTowns.map(p=>p.geoid));
  for(const town of attributes('towns')){
    if(town.COUSUBCC==='T5'){assert.ok(excluded.has(town.GEOID));assert.ok(!represented.has('town:'+town.GEOID));}
    else assert.ok(represented.has('town:'+town.GEOID));
  }
  assert.equal(represented.size,23051);assert.equal(retired.size,12557);assert.equal(excluded.size,25);
  assert.ok([...retired].every(id=>!represented.has(id)));assert.equal(new Set([...represented,...retired]).size,35608);
  assert.equal(new Set([...supplement.rows.map(r=>r[2]),...supplement.matchedExisting.map(m=>m.state)]).size,50);assert.ok(supplement.rows.every(r=>r[2]!=='PR'&&r[2]!=='HI'));
});

test('same-name places remain distinct and missing New England towns are included',()=>{
  const saintAnthony=supplement.rows.filter(r=>r[2]==='MN'&&r[3]==='St. Anthony city');
  assert.equal(saintAnthony.length,2);assert.equal(new Set(saintAnthony.map(r=>r[6])).size,2);assert.ok(saintAnthony.every(r=>r[6]));
  const kailua=supplement.retiredRows.filter(r=>r[2]==='HI'&&r[3]==='Kailua CDP');
  assert.equal(kailua.length,2);assert.deepEqual(new Set(kailua.map(r=>r[6])),new Set(['Hawaii County','Honolulu County']));
  assert.equal(new Set(kailua.map(r=>cityId(r[1],r[0]))).size,2);
  const wellesley=supplement.rows.filter(r=>r[2]==='MA'&&r[3]==='Wellesley town');assert.equal(wellesley.length,1);assert.equal(wellesley[0][1],'town');assert.equal(wellesley[0][6],'Norfolk County');
  // Inactive government is not the same as removal from the current official
  // legal geography. No population threshold or inferred abandonment is used.
  assert.ok(supplement.rows.some(r=>r[2]==='VT'&&r[3]==='Somerset town'));
  assert.ok(supplement.matchedExisting.some(m=>m.geoid==='1150000'&&m.name==='Washington city'));
});

test('reviewed name differences retain original IDs instead of adding duplicates',()=>{
  const expected={'1571550':'world:USA:city-1159151221','1608830':'world:USA:city-1159150477','1836003':'world:USA:city-1159149289','4752006':'world:USA:city-1159150519'};
  for(const [geoid,id] of Object.entries(expected)){
    const match=[...supplement.matchedExisting,...supplement.retiredExisting].find(m=>m.geoid===geoid);assert.equal(match.adcode,id);assert.equal(match.matchMethod,'reviewed-official-name');
    assert.ok(!supplement.rows.some(r=>r[0]===geoid&&r[1]==='place'));
  }
  assert.equal(supplement.matchedExisting.find(m=>m.name==='Hartford city').adcode,'world:USA:city-1159146255');
  assert.ok(!supplement.rows.some(r=>r[2]==='CT'&&r[3]==='Hartford town'));
  assert.deepEqual(supplement.retiredExisting.map(m=>m.adcode).sort(),['world:USA:city-1159149209','world:USA:city-1159151221']);
  assert.ok(supplement.retiredExisting.every(m=>!supplement.matchedExisting.some(active=>active.adcode===m.adcode)));
});

test('builder rejects truncated, incomplete, or duplicated official responses',()=>{
  let changed=structuredClone(source);changed.queries.find(q=>q.name==='incorporated').response.exceededTransferLimit=true;
  assert.throws(()=>buildUsCities(changed,base,index),/truncated/);
  changed=structuredClone(source);changed.queries.find(q=>q.name==='towns').response.features.pop();
  assert.throws(()=>buildUsCities(changed,base,index),/Incomplete source query/);
  changed=structuredClone(source);const rows=changed.queries.find(q=>q.name==='cdp').response.features;rows[1].attributes.GEOID=rows[0].attributes.GEOID;
  assert.throws(()=>buildUsCities(changed,base,index),/Duplicate source GEOID/);
});

test('source point counties and the published U.S. identity baseline are mandatory',()=>{
  const noCounty=structuredClone(source);noCounty.countyLookups.pop();assert.throws(()=>buildUsCities(noCounty,base,index));
  const changed=structuredClone(base);changed.cities.find(c=>c.countryCode==='USA').name='changed';
  assert.throws(()=>buildUsCities(source,changed,index),/Published U.S. city entries changed/);
});
