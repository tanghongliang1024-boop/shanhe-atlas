'use strict';

// Rebuild the U.S. city supplement from the frozen Census 2026 source, offline.
// Run: node scripts/build-us-cities.cjs [--check]
// Existing world-cities.json, city IDs, coordinates, and archives are read-only.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');

const SOURCE_GZIP_SHA256='1342509960f4728567f11d9e697c38b8bb12454a366f3d9108c416417a45ff87';
const SOURCE_JSON_SHA256='1382ce2cc5de6c865c6740a4833a0d973bec54e476e255973965216e6ea869e7';
const BASE_USA_SHA256='900a8ce4f928275a5b89eee81a37ba9fee4388e6165750337ff5f9a2734094d7';
const COLUMNS=['geoid','kind','state','name','longitude','latitude','county'];
const TOWN_STATES=new Set(['CT','ME','MA','NH','RI','VT','NY','WI']);
const EXPECTED_COUNTS={states:51,counties:3144,incorporated:19514,cdp:12557,towns:3562};
// Reviewed differences between the existing travel-city name and the official
// statistical name. This suppresses duplicates; it never migrates a visit.
const REVIEWED_MATCHES={
  'world:USA:city-1159151221':{geoid:'1571550',name:'Urban Honolulu CDP',state:'HI'},
  'world:USA:city-1159150477':{geoid:'1608830',name:'Boise City city',state:'ID'},
  'world:USA:city-1159149289':{geoid:'1836003',name:'Indianapolis city (balance)',state:'IN'},
  'world:USA:city-1159150519':{geoid:'4752006',name:'Nashville-Davidson metropolitan government (balance)',state:'TN'}
};
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const norm=text=>String(text||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\bsaint\b/g,'st').replace(/[^a-z0-9]/g,'');
const compare=(a,b)=>a<b?-1:a>b?1:0;
const distanceKm=(a,b)=>111.2*Math.hypot(((a[0]-b[0]+540)%360-180)*Math.cos((a[1]+b[1])*Math.PI/360),a[1]-b[1]);
const sourceKey=(kind,p)=>kind+':'+p.GEOID;
const cityId=(kind,geoid)=>'world:USA:city-us'+kind+geoid;

function readSource(file=path.join(__dirname,'us-cities-source.json.gz')){
  const gzip=fs.readFileSync(file);assert.equal(sha256(gzip),SOURCE_GZIP_SHA256,'Frozen Census source archive changed; review before rebuilding');
  const json=zlib.gunzipSync(gzip);assert.equal(sha256(json),SOURCE_JSON_SHA256,'Frozen Census JSON changed');
  return JSON.parse(json);
}

function buildUsCities(source,worldCities,worldIndex){
  assert.equal(source.vintage,'2026-01-01');assert.equal(source.source,'U.S. Census Bureau TIGERweb');
  const queries=new Map(source.queries.map(q=>[q.name,q]));
  assert.deepEqual([...queries.keys()].sort(),Object.keys(EXPECTED_COUNTS).sort());
  const data={};
  for(const [name,count] of Object.entries(EXPECTED_COUNTS)){
    const query=queries.get(name);assert.match(query.metadata.description,/January 1, 2026 vintage/);
    assert.equal(query.countResponse.count,count,'Official count proof changed: '+name);
    assert.equal(query.response.features.length,count,'Incomplete source query: '+name);
    assert.ok(!query.response.exceededTransferLimit,'Source query truncated: '+name);
    assert.match(query.url,/orderByFields=GEOID\+ASC/,'Source must have a stable ordering');
    data[name]=query.response.features.map(f=>f.attributes);
    const ids=data[name].map(p=>p.GEOID);assert.equal(new Set(ids).size,count,'Duplicate source GEOID: '+name);
    assert.deepEqual(ids,ids.slice().sort(),'Unordered source response: '+name);
  }
  const states=new Map(data.states.map(p=>[p.STATE,p.STUSAB]));
  assert.equal(states.size,51);assert.ok(![...states.values()].includes('PR'));
  const stateRegions=new Map(worldIndex.regions.filter(p=>p.countryCode==='USA').map(p=>[p.adcode.slice(-2),p]));
  for(const state of states.values())assert.ok(stateRegions.has(state),'Missing existing state boundary: '+state);
  const counties=new Map(data.counties.map(p=>[p.GEOID,p.NAME]));
  const places=[...data.incorporated,...data.cdp];
  assert.equal(new Set(places.map(p=>p.GEOID)).size,32071,'Place layers overlap');
  for(const p of places){assert.match(p.GEOID,/^\d{7}$/);assert.ok(states.has(p.STATE));assert.ok(['G4110','G4210'].includes(p.MTFCC));assert.equal(p.GEOID.slice(0,2),p.STATE);}
  for(const p of data.towns){assert.match(p.GEOID,/^\d{10}$/);assert.equal(p.LSADC,'43');assert.equal(p.MTFCC,'G4040');assert.ok(TOWN_STATES.has(states.get(p.STATE)));assert.ok(['T1','T5','T9'].includes(p.COUSUBCC));assert.ok(counties.has(p.GEOID.slice(0,5)));}
  // T5 explicitly means an active subdivision coextensive with an incorporated
  // place. Keep its source in the audit, not a second selectable travel place.
  // T9 is a still-listed legal town with an inactive government, not evidence
  // of an abandoned settlement. It remains in this current Census coverage.
  const representedTowns=data.towns.filter(p=>p.COUSUBCC==='T5');
  const towns=data.towns.filter(p=>p.COUSUBCC!=='T5');
  assert.equal(representedTowns.length,25);assert.equal(towns.length,3537);

  const all=[...places.map(p=>({kind:'place',p})),...towns.map(p=>({kind:'town',p}))];
  const existing=worldCities.cities.filter(p=>p.countryCode==='USA');
  assert.equal(existing.length,109);assert.equal(sha256(JSON.stringify(existing)),BASE_USA_SHA256,'Published U.S. city entries changed; re-audit duplicate matching');
  const matchedExisting=[],used=new Set();
  for(const city of existing){
    const state=city.parentRegionId.slice(-2),review=REVIEWED_MATCHES[city.adcode];
    const names=new Set([city.nameEn,...(city.aliases||[])].map(norm).filter(Boolean));
    const matches=all.filter(({p,kind})=>states.get(p.STATE)===state&&(review?kind==='place'&&p.GEOID===review.geoid:names.has(norm(p.BASENAME))));
    assert.equal(matches.length,1,'Existing city needs explicit identity review: '+city.nameEn);
    const {kind,p}=matches[0];if(review){assert.equal(p.NAME,review.name);assert.equal(state,review.state);}
    const distance=distanceKm(city.center,[+p.INTPTLON,+p.INTPTLAT]);
    // Anchorage's large municipality and San Francisco's offshore territory
    // move Census internal points far from the already-preserved urban marker.
    assert.ok(distance<(['world:USA:city-1159151249','world:USA:city-1159151479'].includes(city.adcode)?70:20),'Unexpected city-to-source distance: '+city.nameEn);
    const key=sourceKey(kind,p);assert.ok(!used.has(key),'Two existing cities matched one official place');used.add(key);
    matchedExisting.push({kind,geoid:p.GEOID,adcode:city.adcode,name:p.NAME,state,matchMethod:review?'reviewed-official-name':'unique-name-in-same-state',distanceKm:Math.round(distance*100)/100});
  }

  const nameGroups=new Map();
  for(const p of places){const key=p.STATE+':'+p.NAME;nameGroups.has(key)?nameGroups.get(key).push(p):nameGroups.set(key,[p]);}
  const duplicatePlaces=[...nameGroups.values()].filter(group=>group.length>1).flat();
  const countyLookups=new Map((source.countyLookups||[]).map(q=>[q.geoid,q]));
  assert.equal(countyLookups.size,172);assert.deepEqual([...countyLookups.keys()].sort(),duplicatePlaces.map(p=>p.GEOID).sort(),'Every same-state same-name place needs a county discriminator');
  function countyFor(kind,p){
    if(kind==='town')return counties.get(p.GEOID.slice(0,5));
    const lookup=countyLookups.get(p.GEOID);if(!lookup)return '';
    assert.ok(!lookup.response.error&&!lookup.response.exceededTransferLimit);
    const matches=lookup.response.features.map(f=>f.attributes).filter(c=>c.STATE===p.STATE);
    assert.equal(matches.length,1,'Ambiguous representative-point county: '+p.GEOID);
    assert.equal(counties.get(matches[0].GEOID),matches[0].NAME);
    // This county contains the official representative point. A place may
    // cross counties; do not describe this as its exclusive jurisdiction.
    return matches[0].NAME;
  }
  const rows=all.filter(({kind,p})=>!used.has(sourceKey(kind,p))).map(({kind,p})=>{
    const longitude=+p.INTPTLON,latitude=+p.INTPTLAT;
    assert.ok(Number.isFinite(longitude)&&longitude>=-180&&longitude<=180);
    assert.ok(Number.isFinite(latitude)&&latitude>=-90&&latitude<=90);
    return [p.GEOID,kind,states.get(p.STATE),p.NAME,longitude,latitude,countyFor(kind,p)];
  }).sort((a,b)=>compare(a[2],b[2])||compare(a[0],b[0])||compare(a[1],b[1]));
  assert.equal(rows.length,35499);
  const ids=rows.map(r=>cityId(r[1],r[0]));assert.equal(new Set(ids).size,rows.length);
  assert.ok(ids.every(id=>!worldCities.cities.some(c=>c.adcode===id)));
  const labels=new Map();
  for(const row of rows){const key=[row[2],row[3],row[6]].join('|');assert.ok(!labels.has(key),'Unresolved name ambiguity: '+key);labels.set(key,row[0]);}
  const byState={};
  for(const state of [...states.values()].sort()){
    const placeCount=places.filter(p=>states.get(p.STATE)===state).length,townCount=towns.filter(p=>states.get(p.STATE)===state).length;
    byState[state]={places:placeCount,towns:townCount,existing:matchedExisting.filter(p=>p.state===state).length,supplemental:rows.filter(r=>r[2]===state).length,total:placeCount+townCount};
  }
  const statusCounts=list=>list.reduce((counts,p)=>(counts[p.FUNCSTAT]=(counts[p.FUNCSTAT]||0)+1,counts),{});
  return {version:1,generatedAt:'2026-10-29',vintage:'2026-01-01',countryCode:'USA',
    source:'U.S. Census Bureau TIGERweb',sourceDocument:'assets/geo/us-cities-sources.md',license:'Public domain (U.S. federal government data)',
    columns:COLUMNS,rows,matchedExisting,
    coverage:{states:51,placeCount:32071,sourceTownCount:3562,coextensiveTownCount:25,townCount:3537,existingCityCount:109,matchedExistingCount:109,supplementalCityCount:rows.length,totalCityCount:35608,byState},
    representedTowns:representedTowns.map(p=>({geoid:p.GEOID,name:p.NAME,state:states.get(p.STATE),classCode:p.COUSUBCC,reason:'Census T5: coextensive with an incorporated place; covered by the Places layer'})),
    functionalStatusCounts:{incorporated:statusCounts(data.incorporated),cdp:statusCounts(data.cdp),supplementalTowns:statusCounts(towns)},
    countyMeaning:'For towns, the official parent county; for same-name Places, the county containing the Census internal point, not necessarily every county crossed by the place.',
    sources:source.queries.map(q=>({name:q.name,url:q.url,countUrl:q.countUrl,count:q.countResponse.count,vintage:'2026-01-01',responseSha256:sha256(JSON.stringify(q.response))})),
    sourceSnapshot:{path:'scripts/us-cities-source.json.gz',gzipSha256:SOURCE_GZIP_SHA256,jsonSha256:SOURCE_JSON_SHA256,baseUsaSha256:BASE_USA_SHA256}};
}

if(require.main===module){
  const args=process.argv.slice(2);assert.ok(args.length===0||(args.length===1&&args[0]==='--check'),'Usage: node scripts/build-us-cities.cjs [--check]');
  const geo=path.resolve(__dirname,'../assets/geo'),output=path.join(geo,'us-cities.json');
  const protectedPaths=fs.readdirSync(geo,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&e.name.endsWith('.json')).map(e=>path.join(e.parentPath,e.name)).filter(p=>p!==output);
  const before=new Map(protectedPaths.map(p=>[p,sha256(fs.readFileSync(p))]));
  const result=buildUsCities(readSource(),JSON.parse(fs.readFileSync(path.join(geo,'world-cities.json'))),JSON.parse(fs.readFileSync(path.join(geo,'world-index.json'))));
  const text=JSON.stringify(result)+'\n';
  if(args[0]==='--check')assert.equal(fs.readFileSync(output,'utf8'),text,'U.S. city supplement is stale');
  else fs.writeFileSync(output,text);
  for(const [file,hash] of before)assert.equal(sha256(fs.readFileSync(file)),hash,'Existing geography changed: '+file);
  console.log(JSON.stringify({checkOnly:args[0]==='--check',supplemental:result.rows.length,existing:result.matchedExisting.length,total:result.coverage.totalCityCount,bytes:Buffer.byteLength(text),protectedFilesUnchanged:before.size,sha256:sha256(text)}));
}
module.exports={buildUsCities,readSource,cityId,COLUMNS,EXPECTED_COUNTS,REVIEWED_MATCHES,SOURCE_GZIP_SHA256,SOURCE_JSON_SHA256,BASE_USA_SHA256};
