(function(root){
  'use strict';
  const text=value=>String(value??'').toLowerCase().replaceAll('臺','台').normalize('NFKC');
  const id=feature=>String(feature.properties.adcode);
  function countryOf(feature){return feature.properties.navigationCountry||feature.properties.countryCode||'CHN';}
  function displayName(feature){
    const p=feature.properties,name=String(p.name||''),city=String(p.city||'');
    const mainland=countryOf(feature)==='CHN'&&/^\d{6}$/.test(String(p.provinceCode))&&Number(p.provinceCode)<710000;
    return mainland&&p.level==='county'&&city&&city!==name&&!name.startsWith(city)?city+name:name;
  }
  function trail(feature){const p=feature.properties;return [...new Set([p.country,p.province,p.city].filter(Boolean))].join(' · ');}
  function matches(feature,query,country='all',province='all'){
    const p=feature.properties;
    return (country==='all'||countryOf(feature)===country)&&(province==='all'||String(p.provinceCode)===province)&&(!query||text([displayName(feature),p.name,p.country,p.province,p.city,...(p.aliases||[])].join(' ')).includes(text(query)));
  }
  function catalog(chinaIndex,worldIndex,legacy=[],reversal){
    const countries=new Map(worldIndex.countries.map(p=>[p.countryCode,p]));
    const detail=new Set(worldIndex.detailCountries);
    const entries=[...chinaIndex.features,...worldIndex.regions.map(properties=>({type:'Feature',geometry:null,properties})),...worldIndex.countries.filter(p=>countryOf({properties:p})!=='CHN'&&!detail.has(p.countryCode)).map(properties=>({type:'Feature',geometry:null,properties}))];
    const byId=new Map();
    for(const feature of entries){if(byId.has(id(feature)))throw Error('Duplicate region identifier: '+id(feature));byId.set(id(feature),feature);}
    const legacyById=new Map(legacy.filter(f=>!byId.has(id(f))).map(f=>[id(f),{...f,properties:{...f.properties,country:'中国',countryCode:'CHN',level:'legacy'}}]));
    for(const [source,item] of Object.entries(reversal?.mappings||{})){
      const parent=byId.get(item.targetId);
      if(item.verified!==true||!parent||byId.has(source))continue;
      const p=parent.properties;
      legacyById.set(source,{type:'Feature',geometry:null,properties:{adcode:source,name:item.sourceName||source,country:'中国',countryCode:'CHN',province:p.province,provinceCode:p.provinceCode,city:p.name,level:'legacy',reversalTarget:item.targetId,levelNote:'已恢复'+p.name+'整体标记；这条旧分区记录单独保留，可查看或导出'}});
    }
    return {features:entries,byId,legacyById,countries};
  }
  function recordsWithFeatures(records,model){
    return Object.keys(records).filter(key=>records[key]?.visited===true).map(key=>model.byId.get(key)||model.legacyById.get(key)||{type:'Feature',geometry:null,properties:{adcode:key,name:'待整理地区 '+key,country:'',countryCode:key.startsWith('world:')?key.split(':')[1]:'CHN',province:'旧版足迹',level:'legacy'}});
  }
  function groupMarkers(visits,scope,countryFeatures,provinceFeatures){
    if(scope.kind==='province'||scope.kind==='country')return visits.filter(f=>scope.kind==='province'?countryOf(f)==='CHN'&&String(f.properties.provinceCode)===scope.code:countryOf(f)===scope.code).map(f=>({...f,count:1,target:'record'}));
    const groups=new Map();
    for(const f of visits){const key=scope.kind==='china'?String(f.properties.provinceCode):countryOf(f);if(scope.kind==='china'&&countryOf(f)!=='CHN')continue;groups.set(key,(groups.get(key)||0)+1);}
    const shapes=scope.kind==='china'?provinceFeatures:countryFeatures.filter(f=>!['TWN','HKG','MAC'].includes(f.properties.countryCode));
    return shapes.filter(f=>groups.has(scope.kind==='china'?id(f):countryOf(f))).map(f=>({...f,count:groups.get(scope.kind==='china'?id(f):countryOf(f)),target:scope.kind==='china'?'province':'country'}));
  }
  const api=Object.freeze({text,id,countryOf,displayName,trail,matches,catalog,recordsWithFeatures,groupMarkers});
  root.ShanheRegions=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
