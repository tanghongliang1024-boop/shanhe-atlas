'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../region-model.js'),F=require('../family-map-model.js'),C=require('../city-catalog.js');
const {validateRecords}=require('../cloud-store.js');
const {createGuestArchiveStore,SHANHE_GUEST_STORAGE_KEY}=require('../guest-store.js');
const {validateDocument}=require('../family-store.js');
const {validateRecords:validateLandmarks}=require('../landmark-store.js');
const {migrateRecords}=require('../region-migration.js');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/geo',name),'utf8'));
const base=read('world-cities.json'),index=read('world-index.json'),supplement=read('us-cities.json');
const before=structuredClone(base),expanded=R.withCitySupplement(base,supplement,index);
const make=cities=>R.catalog(read('china-prefecture-index.json'),index,[],null,cities);
const old=make(base),model=make(expanded),usa=model.citiesByCountry.get('USA');
const newIds=usa.filter(f=>f.properties.catalogKind).map(R.id);
const retiredBaseIds=new Set(supplement.retiredExisting.map(item=>item.adcode));
const retiredIds=[...supplement.retiredRows.map(row=>'world:USA:city-us'+row[1]+row[0]),...retiredBaseIds];
const HONOLULU='world:USA:city-1159151221',HILO='world:USA:city-1159149209',HI='world:USA:US-HI';
const row=note=>({visited:true,date:'2024-02-29',note,updatedAt:'2026-10-29T01:02:03.000Z'});

test('formal US catalogue preserves every active destination ID and retains retired base CDPs as history',()=>{
  assert.deepEqual(base,before,'decoding must not mutate the base catalogue');
  assert.equal(newIds.length,supplement.rows.length);
  assert.equal(usa.length,109-retiredBaseIds.size+supplement.rows.length);
  assert.equal(usa.length,23051,'19,514 incorporated places plus 3,537 distinct legal towns');
  assert.deepEqual(retiredBaseIds,new Set([HONOLULU,HILO]));
  for(const feature of old.features){
    const id=R.id(feature);
    if(retiredBaseIds.has(id)){
      assert.equal(model.byId.has(id),false);
      assert.equal(model.legacyById.get(id).properties.name,feature.properties.name);
      assert.equal(model.legacyById.get(id).properties.legacyKind,'removed-city');
    }else assert.deepEqual(model.byId.get(id),feature);
  }
  assert.deepEqual([...model.citiesByCountry.keys()],[...old.citiesByCountry.keys()]);
  const states=new Set(usa.map(f=>f.properties.parentRegionId));
  assert.equal(index.regions.filter(p=>p.countryCode==='USA').length,51,'all state/DC map boundaries remain');
  assert.equal(states.size,50,'Hawaii has no qualifying incorporated place or legal town in this source');
  assert.deepEqual(model.citiesByRegion.get(HI),[]);
  for(const f of usa){assert.ok(states.has(f.properties.parentRegionId));assert.ok(index.regions.some(p=>p.adcode===f.properties.parentRegionId&&p.countryCode==='USA'));}
  assert.equal(new Set(usa.map(R.id)).size,usa.length);
});

test('every former CDP ID is excluded from current search, state pickers, spatial points and flags',()=>{
  assert.equal(retiredIds.length,12557);assert.equal(new Set(retiredIds).size,retiredIds.length);
  assert.ok(usa.every(f=>!f.properties.name.endsWith(' CDP')));
  const active=new Set(model.features.map(R.id)),world=read('world.geo.json').features;
  for(const id of retiredIds){
    assert.equal(active.has(id),false,id+' cannot be selected as a new visit');
    const legacy=model.legacyById.get(id);assert.ok(legacy,id+' keeps a named historical entry');
    assert.equal(legacy.properties.legacyKind,'removed-city');
    assert.equal(legacy.properties.mapExcluded,true);assert.equal(legacy.properties.center,null);
    assert.equal(R.countryOf(legacy),'USA');
  }
  const search=C.createSearch(model.features,R);
  assert.deepEqual(search.query({query:' CDP',country:'USA'}),[]);
  assert.deepEqual(search.query({query:'Honolulu',country:'USA'}),[]);
  const records=Object.fromEntries([retiredIds[0],HONOLULU,HILO].map(id=>[id,row('旧 CDP 记录')]));
  const visits=R.recordsWithFeatures(records,model);
  assert.equal(C.createSpatial(visits,point=>point).size,0,'historical coordinates cannot leak into selectable dots');
  for(const region of model.regionsById.values())assert.equal(R.regionVisited(region,visits),false);
  assert.equal(R.worldVisited(world.find(f=>f.properties.countryCode==='USA'),visits),false);
  assert.deepEqual(R.groupMarkers(visits,{kind:'country',code:'USA'},world,[]),[]);
  assert.deepEqual(R.groupMarkers(visits,{kind:'world'},world,[]),[]);
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

test('retired CDP local archives survive reload, import validation, unrelated saves and deliberate cancellation',async()=>{
  const retiredId=retiredIds[0],original={[retiredId]:row('原统计居民点日期和笔记\n第二行'),[HONOLULU]:row('檀香山原记录'),[HILO]:row('希洛原记录')};
  const snapshot=JSON.stringify(original),data=new Map([[SHANHE_GUEST_STORAGE_KEY,JSON.stringify({version:5,revision:7,records:original})]]);
  const storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)},store=createGuestArchiveStore({storage,locks:null});
  assert.deepEqual(store.getState().records,original);
  assert.deepEqual(validateRecords(JSON.parse(snapshot)),original,'saved/imported IDs are accepted independently of current map selection');
  const next={...original,[newIds[0]]:row('本次新增的建制城市')};
  assert.equal((await store.save(next,{expectedRevision:7})).ok,true);
  const reloaded=createGuestArchiveStore({storage,locks:null});assert.deepEqual(reloaded.getState().records,next);
  const cancelled={...next};delete cancelled[retiredId];
  assert.equal((await reloaded.save(cancelled,{expectedRevision:8})).ok,true);
  assert.deepEqual(createGuestArchiveStore({storage,locks:null}).getState().records,cancelled);
  assert.equal(JSON.stringify(original),snapshot,'catalogue changes and cancellation do not mutate other original records');
});

test('family document round trips keep each child CDP history while map flags only use active cities',()=>{
  const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',id=retiredIds[0];
  const document={version:1,members:[{id:'self',name:'家长',color:'terracotta'},{id:a,name:'甲',color:'blue'},{id:b,name:'乙',color:'purple'}],
    regions:{[a]:{[id]:row('甲的旧记录'),[HONOLULU]:row('甲的檀香山'),[newIds[0]]:row('甲的城市')},[b]:{[id]:row('乙的旧记录'),[HILO]:row('乙的希洛'),[newIds[0]]:row('乙的城市')}},landmarks:{[a]:{},[b]:{}}};
  const before=structuredClone(document),restored=validateDocument(JSON.parse(JSON.stringify(document)),{regions:validateRecords,landmarks:validateLandmarks});
  assert.deepEqual(restored,before);
  const world=read('world.geo.json').features;
  const flags=ids=>F.regionMarkers(restored.members.filter(m=>ids.includes(m.id)).map(member=>({member,records:restored.regions[member.id]})),{kind:'country',code:'USA'},world,[],model,R);
  assert.deepEqual(flags([a,b]).map(R.id),[newIds[0],newIds[0]]);
  assert.equal(flags([b]).length,1);
  delete restored.regions[a][id];delete restored.regions[a][newIds[0]];
  assert.deepEqual(restored.regions[b],before.regions[b],'one child cancellation cannot affect the other child history');
  assert.deepEqual(flags([a,b]).map(R.id),[newIds[0]]);
  assert.deepEqual(document,before);
});

test('old Hawaii state and CDP records are not silently migrated into a retired capital or another city',()=>{
  const manifest=read('world-city-migration-map.json');
  assert.ok(Object.values(manifest.mappings).every(item=>item.verified!==true||!retiredIds.includes(item.targetId)));
  for(const records of [{[HI]:row('原夏威夷州')},{[HONOLULU]:row('原檀香山'),[HILO]:row('原希洛')},{[HI]:row('州记录'),[HONOLULU]:row('城市记录') }]){
    const result=migrateRecords(records,manifest);
    assert.equal(result.changed,false);assert.deepEqual(result.records,records);
  }
  assert.throws(()=>R.moveLegacyRegionRecord({[HI]:row('保留州')},HI,HONOLULU,model),/请选择该省州内的城市/);
});

test('supplement validation rejects duplicate IDs, unknown parents and invalid coordinates',()=>{
  const change=fn=>{const s=structuredClone(supplement);fn(s);return s;};
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.rows.push(s.rows[0])),index),/Duplicate/);
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.rows[0][2]='XX'),index),/Invalid/);
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.rows[0][4]=null),index),/Invalid/);
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.rows[0][0]='bad-id'),index),/Invalid/);
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.retiredRows.push(s.retiredRows[0])),index),/Duplicate/);
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.rows.push(s.retiredRows[0])),index),/Duplicate|Invalid/);
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.retiredExisting.push(s.retiredExisting[0])),index),/Duplicate|Invalid/);
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.retiredExisting[0].adcode='world:USA:city-unknown'),index),/Invalid/);
  assert.throws(()=>R.withCitySupplement(base,change(s=>s.retiredExisting[0].adcode=base.cities.find(p=>p.countryCode==='ARE').adcode),index),/Invalid/);
});
