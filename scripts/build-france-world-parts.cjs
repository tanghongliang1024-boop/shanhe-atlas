'use strict';

// Display-only split of the pinned Natural Earth France country geometry.
// Existing country/region/city identifiers and archive data are never rewritten.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');

const SOURCE_FRANCE_GEOMETRY_SHA256='be4ee5ffb4b2ca8f223d7c5024e63cf1d274aee6b831e7e2ace561f22283ddb2';
const METROPOLITAN_REGIONS=['ARA','BFC','BRE','COR','CVL','GES','HDF','IDF','NAQ','NOR','OCC','PAC','PDL'].map(code=>'world:FRA:FR-'+code);
// Polygon indices are valid only for the exact geometry hash above. Bounding
// boxes additionally verify the geographic identity of every assigned ring.
const PARTS=[
  {id:'world:FRA',name:'法国本土',indices:[1,10,11,12,13,14,15,16,17,20],bounds:[-6,41,10,52],regionIds:METROPOLITAN_REGIONS},
  {id:'world:FRA:FR-GF',name:'法属圭亚那',indices:[0],bounds:[-55,1,-51,6]},
  {id:'world:FRA:FR-GP',name:'瓜德罗普',indices:[3,4,5,6,18,19],bounds:[-62,15.5,-60.8,16.7]},
  {id:'world:FRA:FR-MQ',name:'马提尼克',indices:[2],bounds:[-61.5,14,-60.5,15]},
  {id:'world:FRA:FR-RE',name:'留尼汪',indices:[7],bounds:[55,-21.6,56,-20.5]},
  {id:'world:FRA:FR-YT',name:'马约特',indices:[8,9],bounds:[44.8,-13.2,45.5,-12.4]}
];
const sha256=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const inBounds=([x,y],[west,south,east,north])=>Number.isFinite(x)&&Number.isFinite(y)&&x>=west&&x<=east&&y>=south&&y<=north;

function buildFranceWorldParts(world,detail,index){
  const sources=world.features.filter(f=>f.properties.adcode==='world:FRA');
  assert.equal(sources.length,1,'Expected one original France country feature');
  const source=sources[0];
  assert.equal(source.properties.countryCode,'FRA');
  assert.equal(source.properties.level,'country');
  assert.equal(source.geometry.type,'MultiPolygon');
  assert.equal(sha256(source.geometry),SOURCE_FRANCE_GEOMETRY_SHA256,'France source geometry changed: re-audit polygon assignments before regenerating');
  const polygons=source.geometry.coordinates;
  assert.equal(polygons.length,21);
  const sourceRegions=index.regions.filter(p=>p.countryCode==='FRA');
  const regions=new Map(sourceRegions.map(p=>[p.adcode,p]));
  const assignedRegions=PARTS.flatMap(part=>part.regionIds||[part.id]);
  assert.equal(new Set(assignedRegions).size,18);
  assert.deepEqual([...regions.keys()].sort(),[...assignedRegions].sort(),'France administrative membership changed');
  assert.deepEqual(detail.features.map(f=>f.properties.adcode).sort(),[...assignedRegions].sort());
  for(const feature of detail.features){
    assert.deepEqual(feature.properties,regions.get(feature.properties.adcode),'Detailed geometry and index metadata must agree');
    assert.equal(feature.properties.parentId,'world:FRA');
  }

  const used=[];
  const features=PARTS.map(part=>{
    const isMainland=part.id==='world:FRA',region=isMainland?null:regions.get(part.id);
    if(region)assert.equal(region.name,part.name,'Overseas region identity changed');
    const coordinates=part.indices.map(index=>{
      assert.ok(Number.isInteger(index)&&index>=0&&index<polygons.length);
      assert.ok(!used.includes(index),'Duplicate polygon assignment');used.push(index);
      const polygon=polygons[index];
      assert.ok(polygon.every(ring=>ring.every(point=>inBounds(point,part.bounds))),'Polygon lies outside its verified display region: '+part.name);
      return polygon;
    });
    const worldRegionIds=part.regionIds||[part.id];
    for(const id of worldRegionIds)assert.ok(inBounds(regions.get(id).center,part.bounds),'Administrative center does not match its display region: '+id);
    const properties={...source.properties,adcode:part.id,name:part.name,parentCountryId:'world:FRA',worldRegionIds:[...worldRegionIds]};
    if(region)Object.assign(properties,{province:region.name,center:[...region.center],focusRegionId:region.adcode});
    return {type:'Feature',properties,geometry:{type:'MultiPolygon',coordinates}};
  });
  assert.deepEqual(used.slice().sort((a,b)=>a-b),Array.from({length:21},(_,i)=>i),'Every original polygon must occur exactly once');
  assert.deepEqual(features.flatMap(f=>f.geometry.coordinates).map(JSON.stringify).sort(),polygons.map(JSON.stringify).sort(),'Splitting must preserve every original coordinate and ring');
  assert.equal(new Set(features.map(f=>f.properties.adcode)).size,6);
  return {...world,source:'world.geo.json#world:FRA',sourceGeometrySha256:SOURCE_FRANCE_GEOMETRY_SHA256,displayOnly:true,features};
}

if(require.main===module){
  const args=process.argv.slice(2);
  assert.ok(args.length===0||(args.length===1&&args[0]==='--check'),'Usage: node scripts/build-france-world-parts.cjs [--check]');
  const geo=path.resolve(__dirname,'../assets/geo');
  const read=name=>JSON.parse(fs.readFileSync(path.join(geo,name),'utf8'));
  const result=buildFranceWorldParts(read('world.geo.json'),read('world/FRA.geo.json'),read('world-index.json'));
  const output=path.join(geo,'world-france-parts.geo.json'),text=JSON.stringify(result)+'\n';
  if(args[0]==='--check')assert.equal(fs.readFileSync(output,'utf8'),text,'Generated France display file is stale');
  else fs.writeFileSync(output,text);
  console.log(JSON.stringify({file:output,checkOnly:args[0]==='--check',features:result.features.length,polygons:result.features.reduce((sum,f)=>sum+f.geometry.coordinates.length,0),sourceGeometrySha256:SOURCE_FRANCE_GEOMETRY_SHA256}));
}

module.exports={buildFranceWorldParts,SOURCE_FRANCE_GEOMETRY_SHA256};
