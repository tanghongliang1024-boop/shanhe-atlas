'use strict';

// Add only the UAE detail map and seven capitals. Do not run the historical
// worldwide builders: this patch preserves every unrelated serialized entry.
// Usage: node scripts/build-uae-data.cjs [--check] [--source-dir <cache directory>]
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const d3=require('../assets/d3.min.js');

const PIN='ca96624a56bd078437bca8184e78163e5039ad19';
const SOURCE_BASE=`https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${PIN}/geojson/`;
const SOURCE_FILES={
  'ne_10m_admin_1_states_provinces.geojson':'22d0e3ad85eb3e27f17cabf8ba2d50e554fbc27a87796ff891d958185da62fb5',
  'ne_10m_populated_places.geojson':'9b8e3de09048ef00dfc70357dbb9fa324493f214b5e0ae4daf1aa79a8d10116b'
};
const CAPITAL_SOURCE='https://www.dcd.gov.ae/portal/portal/yearlyreport/english/OurEmirates-ar-en.pdf';
const MIGRATION_SHA256='2985f0a2adc82053cfdc6e48dad9a0801386bbe5ca446a03bf624da36e8797ee';
// Frozen, reviewed GeoNames row from the same cities1000.zip used by the
// published city catalog. No live name search or refreshed dump affects IDs.
const AJMAN={
  source:'GeoNames',sourceId:'292932',nameEn:'Ajman',
  aliases:['Acman','Adschman','Adzhman','Adzman','Adżman','Adžman','Ajma','Ajman','Ajman City','Ajmán','Ajmã','Al Ajman','QAJ','Ujman','ajamana','ajman','ajuman','Əcmən','ʻg\'mʼn','ʿejamani','ʿjman','ʿyman','Аджман','Аџман','עג\'מאן','اجمان','عجمان','عيمان','अजमान','আজমান','ਅਜਮਾਨ','አጃማን','アジュマーン'],
  center:[55.47878,25.40177],countryCode2:'AE',featureCode:'PPLA',admin1Code:'02',modified:'2026-04-13',
  snapshotDate:'2026-10-22',inputUrl:'https://download.geonames.org/export/dump/cities1000.zip',
  inputSha256:'9d3916f7a9448bb4ea45e93c06c5413d2cceb1a89e03f75c2178bbb08af12018'
};
const EMIRATES=[
  {code:'AE-AZ',sourceId:'ARE-349',name:'阿布扎比',nameEn:'Abu Dhabi',cityId:1159150565,geonamesId:292968,geometryHash:'cf8c40c97fb7b5d20930e617ec5ac281f46fcff0dd89677cc275d9f83533a8bc'},
  {code:'AE-DU',sourceId:'ARE-350',name:'迪拜',nameEn:'Dubai',cityId:1159151497,geonamesId:292223,geometryHash:'7e8929418a73775adbc29d23f08b79bcfa080c6e740c3bab3e396a7f1a15c576'},
  {code:'AE-SH',sourceId:'ARE-348',name:'沙迦',nameEn:'Sharjah',cityId:1159126943,geonamesId:292672,geometryHash:'da7c8b36ae340eebbf9dc9dbc23d01c382095620ff7831fee858f3744051370e'},
  {code:'AE-AJ',sourceId:'ARE-346',name:'阿治曼',nameEn:'Ajman',geonamesId:292932,geometryHash:'5834b777dbd4810016cc7eb6051ded354228ffc402fb34404a8f0414d460643a'},
  {code:'AE-UQ',sourceId:'ARE-339',name:'乌姆盖万',nameEn:'Umm Al Quwain',cityId:1159126925,geonamesId:290594,geometryHash:'998dafb5640338abd9ee2932455b61cd700ec1cafe5605de2c0c451cde03adc3'},
  {code:'AE-RK',sourceId:'ARE-338',name:'拉斯海玛',nameEn:'Ras Al Khaimah',aliases:['哈伊马角','拉斯海马'],cityId:1159134277,geonamesId:291074,geometryHash:'43180154a2b2a5dbf4199731fff14d288a7c93befd83335279598a735d43a124'},
  {code:'AE-FU',sourceId:'ARE-341',name:'富查伊拉',nameEn:'Fujairah',aliases:['富查拉'],cityId:1159134281,geonamesId:292878,geometryHash:'3c76173c53bd069bab0e00354ffb9d63f4afc69ff655a603fe16fad7736c21dd'}
];
const CONTEXT_AREAS=[
  {code:'AE-X01~',sourceId:'ARE-344',name:'富查伊拉—沙迦共管区',administration:['world:ARE:AE-FU','world:ARE:AE-SH'],note:'来源将此片区单列为富查伊拉与沙迦共管区域；仅显示轮廓，不设独立足迹。',geometryHash:'9ab4998c4147dff422165e048275eadbafb172729b16f4493b3969c8e8b0bd38'},
  {code:'AE-X02~',sourceId:'ARE-347',name:'阿治曼—阿曼共管区',administration:['world:ARE:AE-AJ','world:OMN'],note:'来源将此片区单列为阿治曼与阿曼共管区域；仅显示轮廓，不设独立足迹。',geometryHash:'3f029bd9bc78a279bf2d23d658bfdf6e53c3fb5d5f0561f47caba899f4e691a2'}
];
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const geometryHash=geometry=>sha256(JSON.stringify(geometry));
const unique=values=>[...new Set(values.flatMap(v=>typeof v==='string'?v.split(/[|;]/):[]).filter(Boolean))];
const polygons=f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;

function buildUaeData(adminSource,citySource,country){
  assert.equal(country.adcode,'world:ARE');
  assert.equal(country.countryCode,'ARE');
  const sourceFeatures=adminSource.features.filter(f=>f.properties.adm0_a3==='ARE');
  assert.deepEqual(sourceFeatures.map(f=>f.properties.adm1_code).sort(),[...EMIRATES,...CONTEXT_AREAS].map(e=>e.sourceId).sort(),'UAE membership changed; review all emirates and shared areas');
  const byCode=new Map(sourceFeatures.map(f=>[f.properties.iso_3166_2,f]));
  const byCity=new Map(citySource.features.filter(f=>f.properties.ADM0_A3==='ARE').map(f=>[f.properties.NE_ID,f]));
  function feature(entry,context=false){
    const original=byCode.get(entry.code);assert.ok(original);
    const p=original.properties;
    assert.equal(p.adm1_code,entry.sourceId);
    assert.equal(geometryHash(original.geometry),entry.geometryHash,'Source geometry changed: '+entry.code);
    const center=[p.longitude,p.latitude];
    assert.ok(d3.geoContains(original,center),'Source label must be inside its own area');
    assert.ok(d3.geoArea(original)>0&&d3.geoArea(original)<0.01,'Source winding or extent is invalid');
    const properties={adcode:context?'context:ARE:'+entry.sourceId:'world:ARE:'+entry.code,
      name:context?entry.name:entry.name+'酋长国',nameEn:context?p.name:entry.nameEn,
      province:country.name,provinceCode:'ARE',countryCode:'ARE',country:country.name,
      level:context?'context':'admin1',center,aliases:unique([entry.nameEn,...(entry.aliases||[]),p.name_en,p.name,p.name_alt,p.name_zh,p.name_zht,entry.code]),
      parentId:'world:ARE',source:'Natural Earth',sourceId:entry.sourceId,
      sourceUrl:SOURCE_BASE+'ne_10m_admin_1_states_provinces.geojson',sourceGeometrySha256:entry.geometryHash};
    if(context)Object.assign(properties,{displayOnly:true,sourceName:p.name,sourceNameEn:p.name_en,sourceNote:p.note,sharedAdministration:entry.administration,note:entry.note});
    return {type:'Feature',properties,geometry:structuredClone(original.geometry)};
  }
  const features=EMIRATES.map(e=>feature(e));
  const contextFeatures=CONTEXT_AREAS.map(e=>feature(e,true));
  // No simplification, clipping, joining, or reassignment: every original ring
  // and coordinate appears exactly once across the seven + two display areas.
  assert.deepEqual([...features,...contextFeatures].flatMap(polygons).map(JSON.stringify).sort(),sourceFeatures.flatMap(polygons).map(JSON.stringify).sort());
  const cities=EMIRATES.map((entry,i)=>{
    const region=features[i].properties,rid=region.adcode,ne=entry.cityId?byCity.get(entry.cityId):null;
    assert.ok(ne||entry.code==='AE-AJ');
    if(ne){assert.equal(ne.properties.GEONAMESID,entry.geonamesId);assert.match(ne.properties.FEATURECLA,/^Admin-[01] capital$/);}
    else {assert.equal(AJMAN.sourceId,String(entry.geonamesId));assert.equal(AJMAN.countryCode2,'AE');assert.equal(AJMAN.featureCode,'PPLA');assert.equal(AJMAN.admin1Code,'02');}
    const sourceId=String(ne?entry.cityId:AJMAN.sourceId),center=structuredClone(ne?ne.geometry.coordinates:AJMAN.center);
    assert.ok(d3.geoContains(features[i],center),'Capital must remain at its real source coordinates within its emirate: '+entry.name);
    const city={adcode:'world:ARE:city-'+(ne?'':'gn')+sourceId,name:entry.name,nameEn:entry.nameEn,
      aliases:unique([entry.name,entry.nameEn,...(entry.aliases||[]),...(ne?[ne.properties.NAME,ne.properties.NAMEASCII,ne.properties.NAMEALT,ne.properties.NAME_ZH,ne.properties.NAME_ZHT]:AJMAN.aliases)]),
      country:country.name,countryCode:'ARE',province:region.name,provinceCode:rid,parentRegionId:rid,parentId:rid,
      center,level:'city',source:ne?'Natural Earth':'GeoNames',sourceId,
      sourceUrl:ne?SOURCE_BASE+'ne_10m_populated_places.geojson':`https://www.geonames.org/${sourceId}/`,
      selectionReason:'verified-capital',placeType:'city',capitalOf:[rid],capitalSource:CAPITAL_SOURCE};
    if(ne?.properties.WIKIDATAID)city.wikidataId=ne.properties.WIKIDATAID;
    return city;
  });
  const detail={type:'FeatureCollection',winding:'clockwise-exterior',license:'Public domain',licenseUrl:'https://www.naturalearthdata.com/about/terms-of-use/',attribution:'Natural Earth',
    sourceCommit:PIN,sourceSha256:SOURCE_FILES['ne_10m_admin_1_states_provinces.geojson'],
    modified:'Original geometries retained. Seven emirates are selectable; two source shared areas are display-only context. See ../world-data-sources.md.',features,contextFeatures};
  return {detail,cities,country:{...country,aliases:unique([...country.aliases,'阿联酋','阿聯酋','UAE']),detailPath:'assets/geo/world/ARE.geo.json',childCount:7}};
}

// Read JSON value spans without reserializing adjacent countries or cities.
// This deliberately preserves number formatting, key order, and raw bytes of
// every existing non-UAE array member as well as all unrelated root metadata.
function valueEnd(text,start){
  const opening=text[start];
  if(opening==='"'){let i=start+1;for(;i<text.length;i++){if(text[i]==='\\'){i++;continue;}if(text[i]==='"')return i+1;}throw Error('Unclosed JSON string');}
  if(opening==='{'||opening==='['){let i=start+1;for(;i<text.length;){if(text[i]==='"'||text[i]==='{'||text[i]==='['){i=valueEnd(text,i);continue;}if(text[i]===(opening==='{'?'}':']'))return i+1;i++;}throw Error('Unclosed JSON container');}
  let i=start;while(i<text.length&&!/[\s,}\]]/.test(text[i]))i++;return i;
}
const skipSpace=(text,i)=>{while(/\s/.test(text[i]||'')&&i<text.length)i++;return i;};
function rootSpan(text,key){
  let i=skipSpace(text,0);assert.equal(text[i++],'{');
  while(i<text.length){i=skipSpace(text,i);if(text[i]==='}')break;const end=valueEnd(text,i),name=JSON.parse(text.slice(i,end));i=skipSpace(text,end);assert.equal(text[i++],':');i=skipSpace(text,i);const last=valueEnd(text,i);if(name===key)return {start:i,end:last};i=skipSpace(text,last);assert.equal(text[i++],',');}
  throw Error('Missing root property: '+key);
}
function rawItems(text,key){
  const span=rootSpan(text,key);assert.equal(text[span.start],'[');const result=[];
  let i=skipSpace(text,span.start+1);while(i<span.end-1){const end=valueEnd(text,i);result.push(text.slice(i,end));i=skipSpace(text,end);if(text[i]===']')break;assert.equal(text[i++],',');i=skipSpace(text,i);}return result;
}
function replaceItems(text,key,items){const s=rootSpan(text,key);return text.slice(0,s.start)+'['+items.join(',')+']'+text.slice(s.end);}
function patchItems(text,key,belongs,replacement){
  const items=rawItems(text,key),parsed=items.map(JSON.parse),indexes=parsed.flatMap((p,i)=>belongs(p)?[i]:[]),at=indexes.length?indexes[0]:items.length;
  const before=items.filter((_,i)=>!belongs(parsed[i]));
  const result=[];for(let i=0;i<=items.length;i++){if(i===at)result.push(...replacement.map(JSON.stringify));if(i<items.length&&!belongs(parsed[i]))result.push(items[i]);}
  const output=replaceItems(text,key,result);
  assert.deepEqual(rawItems(output,key).filter(s=>!belongs(JSON.parse(s))),before,'Unrelated serialized entries changed: '+key);
  return output;
}
function patchCatalogs(indexText,citiesText,built){
  const originalIndex=JSON.parse(indexText);assert.equal(originalIndex.sourceCommit,PIN);
  let index=patchItems(indexText,'countries',p=>p.countryCode==='ARE',[built.country]);
  index=patchItems(index,'regions',p=>p.countryCode==='ARE',built.detail.features.map(f=>f.properties));
  index=patchItems(index,'detailCountries',p=>p==='ARE',['ARE']);
  const cities=patchItems(citiesText,'cities',p=>p.countryCode==='ARE',built.cities);
  assert.deepEqual(JSON.parse(index).legacyRegions,originalIndex.legacyRegions);
  assert.deepEqual(JSON.parse(cities).legacyCities,JSON.parse(citiesText).legacyCities);
  assert.equal(new Set(JSON.parse(index).regions.map(p=>p.adcode)).size,JSON.parse(index).regions.length);
  assert.equal(new Set(JSON.parse(cities).cities.map(p=>p.adcode)).size,JSON.parse(cities).cities.length);
  return {index,cities,detail:JSON.stringify(built.detail)+'\n'};
}

async function main(){
  const args=process.argv.slice(2),check=args.includes('--check');let sourceDir;
  for(let i=0;i<args.length;i++){if(args[i]==='--check')continue;if(args[i]==='--source-dir'){assert.ok(args[i+1]);sourceDir=path.resolve(args[++i]);continue;}throw Error('Usage: node scripts/build-uae-data.cjs [--check] [--source-dir <cache directory>]');}
  const oldCache=path.resolve(__dirname,'../../scripts/world-cache');
  sourceDir||=fs.existsSync(oldCache)?oldCache:path.join(__dirname,'.cache','uae');
  const inputs=await Promise.all(Object.entries(SOURCE_FILES).map(async([name,hash])=>{
    const file=path.join(sourceDir,name);let bytes;
    if(fs.existsSync(file))bytes=fs.readFileSync(file);
    else {const response=await fetch(SOURCE_BASE+name);assert.ok(response.ok,'Pinned source download failed: '+response.status);bytes=Buffer.from(await response.arrayBuffer());assert.equal(sha256(bytes),hash,'Downloaded source hash mismatch');fs.mkdirSync(sourceDir,{recursive:true});fs.writeFileSync(file,bytes);}
    assert.equal(sha256(bytes),hash,'Pinned source hash mismatch: '+name);return JSON.parse(bytes);
  }));
  const geo=path.resolve(__dirname,'../assets/geo'),indexPath=path.join(geo,'world-index.json'),citiesPath=path.join(geo,'world-cities.json'),detailPath=path.join(geo,'world/ARE.geo.json');
  const migration=fs.readFileSync(path.join(geo,'world-city-migration-map.json'));assert.equal(sha256(migration),MIGRATION_SHA256,'Historical capital mappings must remain unchanged');
  const protectedFiles=fs.readdirSync(geo,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&e.name.endsWith('.json')).map(e=>path.join(e.parentPath,e.name)).filter(file=>![indexPath,citiesPath,detailPath].includes(file));
  const before=new Map(protectedFiles.map(file=>[file,sha256(fs.readFileSync(file))]));
  const indexText=fs.readFileSync(indexPath,'utf8'),citiesText=fs.readFileSync(citiesPath,'utf8');
  const built=buildUaeData(...inputs,JSON.parse(indexText).countries.find(p=>p.countryCode==='ARE'));
  const output=patchCatalogs(indexText,citiesText,built);
  for(const [file,text] of [[indexPath,output.index],[citiesPath,output.cities],[detailPath,output.detail]]){
    if(check)assert.equal(fs.readFileSync(file,'utf8'),text,'Generated data is stale: '+path.basename(file));
    else if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==text)fs.writeFileSync(file,text);
  }
  for(const [file,hash] of before)assert.equal(sha256(fs.readFileSync(file)),hash,'Unrelated geographical data changed: '+file);
  console.log(JSON.stringify({checkOnly:check,emirates:built.detail.features.length,displayOnlyAreas:built.detail.contextFeatures.length,capitals:built.cities.length,unchangedPolygons:[...built.detail.features,...built.detail.contextFeatures].flatMap(polygons).length,totalRegions:JSON.parse(output.index).regions.length,totalCities:JSON.parse(output.cities).cities.length,protectedFilesUnchanged:before.size,migrationSha256:MIGRATION_SHA256}));
}
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={buildUaeData,patchCatalogs,rawItems,EMIRATES,CONTEXT_AREAS,AJMAN,SOURCE_FILES,PIN};
