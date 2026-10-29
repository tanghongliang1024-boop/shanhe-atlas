'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../region-model.js'),F=require('../family-map-model.js');
const {validateRecords}=require('../cloud-store.js');
const {createGuestArchiveStore,SHANHE_GUEST_STORAGE_KEY}=require('../guest-store.js');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/geo',name),'utf8'));
const base=read('world-cities.json'),index=read('world-index.json'),supplement=read('us-cities.json');
const before=structuredClone(base),expanded=R.withCitySupplement(base,supplement,index);
const make=cities=>R.catalog(read('china-prefecture-index.json'),index,[],null,cities);
const old=make(base),model=make(expanded),usa=model.citiesByCountry.get('USA');
const newIds=usa.filter(f=>f.properties.catalogKind).map(R.id);
const row=note=>({visited:true,date:'2024-02-29',note,updatedAt:'2026-10-29T01:02:03.000Z'});

test('US supplemental catalogue preserves every existing destination and stable record ID',()=>{
  assert.deepEqual(base,before,'decoding must not mutate the base catalogue');
  assert.equal(newIds.length,supplement.rows.length);
  assert.equal(usa.length,109+supplement.rows.length);
  assert.ok(usa.length>30000,'national coverage must not be a small curated list');
  for(const feature of old.features)assert.deepEqual(model.byId.get(R.id(feature)),feature);
  assert.deepEqual([...model.citiesByCountry.keys()],[...old.citiesByCountry.keys()]);
  const states=new Set(usa.map(f=>f.properties.parentRegionId));
  assert.equal(states.size,51);
  for(const f of usa){assert.ok(states.has(f.properties.parentRegionId));assert.ok(index.regions.some(p=>p.adcode===f.properties.parentRegionId&&p.countryCode==='USA'));}
  assert.equal(new Set(usa.map(R.id)).size,usa.length);
});

test('same-name US places retain separate state identities and official names are searchable',()=>{
  const same=usa.filter(f=>f.properties.name==='Springfield city');
  assert.ok(same.length>=3);assert.equal(new Set(same.map(R.id)).size,same.length);
  for(const f of same){assert.ok(R.matches(f,'Springfield','USA',f.properties.parentRegionId));}
  const namedTown=usa.find(f=>f.properties.catalogKind==='census-town'&&f.properties.county);
  assert.ok(namedTown,'legal towns include their county context');
  assert.match(R.trail(namedTown),new RegExp(namedTown.properties.county.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});

test('a new city can be saved and cancelled without changing old US or other-country records',async()=>{
  const newId=newIds[0],oldId=base.cities.find(p=>p.countryCode==='USA').adcode,otherId=base.cities.find(p=>p.countryCode==='ARE').adcode;
  const original={[oldId]:row('旧美国城市日期和笔记'),[otherId]:row('其他国家保留')};
  const data=new Map([[SHANHE_GUEST_STORAGE_KEY,JSON.stringify({version:5,revision:1,records:original})]]),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  const store=createGuestArchiveStore({storage,locks:null}),added={...original,[newId]:row('新增城市')};
  assert.deepEqual(validateRecords(added),added);
  assert.equal((await store.save(added,{expectedRevision:1})).ok,true);
  assert.deepEqual(createGuestArchiveStore({storage,locks:null}).getState().records,added);
  assert.equal((await store.save(original,{expectedRevision:2})).ok,true);
  const restored=createGuestArchiveStore({storage,locks:null}).getState().records;
  assert.deepEqual(restored,original);
  assert.equal(R.recordsWithFeatures(restored,model).some(f=>R.id(f)===newId),false);
});

test('family members keep independent flags for the same newly added US place',()=>{
  const id=newIds[0],world=read('world.geo.json').features;
  const a={member:{id:'a',name:'甲',color:'blue',hex:'#4488aa'},records:{[id]:row('甲的日期笔记')}};
  const b={member:{id:'b',name:'乙',color:'purple',hex:'#8866aa'},records:{[id]:row('乙的日期笔记')}};
  const flags=members=>F.regionMarkers(members,{kind:'country',code:'USA'},world,[],model,R);
  assert.equal(flags([a,b]).length,2);
  assert.equal(flags([a,b])[1].flagOffset-flags([a,b])[0].flagOffset,44);
  assert.equal(flags([b]).length,1);const saved=structuredClone(b);delete a.records[id];
  assert.equal(flags([a,b]).length,1);assert.deepEqual(b,saved);
});

test('supplement validation rejects duplicate IDs, unknown parents and invalid coordinates',()=>{
  const change=fn=>{const s=structuredClone(supplement);fn(s);return s;};
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.rows.push(s.rows[0])),index),/Duplicate/);
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.rows[0][2]='XX'),index),/Invalid/);
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.rows[0][4]=null),index),/Invalid/);
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.rows[0][0]='bad-id'),index),/Invalid/);
});
