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
    return (country==='all'||countryOf(feature)===country)&&(province==='all'||String(p.provinceCode)===province||p.regionIds?.includes(String(province))===true)&&(!query||text([displayName(feature),p.name,p.country,p.province,p.city,...(p.aliases||[])].join(' ')).includes(text(query)));
  }
  function catalog(chinaIndex,worldIndex,legacy=[],reversal,worldCities,prefectureMigration){
    const countries=new Map(worldIndex.countries.map(p=>[p.countryCode,p]));
    const countriesById=new Map(worldIndex.countries.map(properties=>[String(properties.adcode),{type:'Feature',geometry:null,properties}]));
    const detail=new Set(worldIndex.detailCountries);
    const regionsById=new Map();
    for(const properties of worldIndex.regions){const key=String(properties.adcode);if(regionsById.has(key))throw Error('Duplicate region identifier: '+key);regionsById.set(key,{type:'Feature',geometry:null,properties});}
    const citiesByRegion=new Map(worldIndex.regions.map(p=>[String(p.adcode),[]]));
    const citiesByCountry=new Map();
    const cityFeatures=(worldCities?.cities||[]).map(properties=>{
      const parentKey=String(properties.parentRegionId),parent=regionsById.get(parentKey)||countriesById.get(parentKey);
      if(!parent||properties.level!=='city'||countryOf({properties})!==countryOf(parent))throw Error('Invalid city parent: '+properties.adcode);
      if(parent.properties.level==='country'&&(detail.has(parent.properties.countryCode)||countryOf(parent)==='CHN'))throw Error('Invalid country city parent: '+properties.adcode);
      if(!String(properties.adcode).startsWith('world:'+countryOf(parent)+':city-'))throw Error('Invalid city identifier: '+properties.adcode);
      const p=parent.properties,regionIds=[...new Set([id(parent),...(properties.regionIds||[])].map(String))];
      const parents=regionIds.map(key=>regionsById.get(key)||countriesById.get(key));
      if(parents.some(f=>!f||countryOf(f)!==countryOf(parent)||f.properties.level!==p.level))throw Error('Invalid shared city parent: '+properties.adcode);
      const feature={type:'Feature',geometry:null,properties:{...properties,province:p.name,provinceCode:id(parent),parentRegionId:id(parent),regionIds,aliases:[...new Set([...(properties.aliases||[]),...parents.flatMap(f=>[...(f.properties.aliases||[]),f.properties.name])])].filter(Boolean)}};
      for(const key of regionIds){if(!citiesByRegion.has(key))citiesByRegion.set(key,[]);citiesByRegion.get(key).push(feature);}
      const country=countryOf(feature);if(!citiesByCountry.has(country))citiesByCountry.set(country,[]);citiesByCountry.get(country).push(feature);
      return feature;
    });
    const entries=[...chinaIndex.features,...(worldCities?cityFeatures:regionsById.values()),...worldIndex.countries.filter(p=>countryOf({properties:p})!=='CHN'&&!detail.has(p.countryCode)&&!citiesByCountry.has(p.countryCode)).map(properties=>({type:'Feature',geometry:null,properties}))];
    const byId=new Map();
    for(const feature of entries){if(byId.has(id(feature)))throw Error('Duplicate region identifier: '+id(feature));byId.set(id(feature),feature);}
    const legacyById=new Map(legacy.filter(f=>!byId.has(id(f))).map(f=>[id(f),{...f,properties:{...f.properties,country:'中国',countryCode:'CHN',level:'legacy'}}]));
    if(worldCities)for(const [key,feature] of regionsById){
      legacyById.set(key,{...feature,properties:{...feature.properties,province:feature.properties.name,provinceCode:key,level:'legacy',legacyKind:'world-region',parentRegionId:key,levelNote:'旧版省州足迹，待补充实际到访城市；原记录完整保留'}});
    }
    if(worldCities)for(const country of citiesByCountry.keys()){
      const feature=countriesById.get(String(countries.get(country).adcode)),key=id(feature);
      legacyById.set(key,{...feature,properties:{...feature.properties,province:feature.properties.name,provinceCode:key,center:null,level:'legacy',legacyKind:'world-country',parentRegionId:key,levelNote:'旧版国家足迹，尚未指定实际到访城市；原记录完整保留，可继续编辑和导出'}});
    }
    for(const [kind,items] of [['removed-region',worldIndex.legacyRegions||[]],['removed-city',worldCities?.legacyCities||[]]])for(const p of items){
      const key=String(p.adcode);
      if(byId.has(key))throw Error('Removed map feature is still selectable: '+key);
      legacyById.set(key,{type:'Feature',geometry:null,properties:{...p,...(kind==='removed-region'?{province:p.name,provinceCode:key,parentRegionId:key}:{}),center:null,level:'legacy',legacyKind:kind,mapExcluded:true,levelNote:'此地点已从当前地图中移除；旧足迹仍可查看、编辑和导出'}});
    }
    for(const [source,item] of Object.entries(reversal?.mappings||{})){
      const parent=byId.get(item.targetId);
      if(item.verified!==true||!parent||byId.has(source))continue;
      const p=parent.properties;
      legacyById.set(source,{type:'Feature',geometry:null,properties:{adcode:source,name:item.sourceName||source,country:'中国',countryCode:'CHN',province:p.province,provinceCode:p.provinceCode,city:p.name,level:'legacy',reversalTarget:item.targetId,levelNote:'已恢复'+p.name+'整体标记；这条旧分区记录单独保留，可查看或导出'}});
    }
    for(const [source,item] of Object.entries(prefectureMigration?.mappings||{})){
      const parent=byId.get(String(item.targetId));
      if(item.verified!==true||!parent||byId.has(source))continue;
      const p=parent.properties,old=legacyById.get(source)?.properties||{},sourceName=item.sourceName||old.name||source;
      legacyById.set(source,{type:'Feature',geometry:null,properties:{...old,adcode:source,name:sourceName.startsWith(p.name)?sourceName:p.name+sourceName,country:'中国',countryCode:'CHN',province:p.province,provinceCode:p.provinceCode,city:p.name,center:null,level:'legacy',prefectureTarget:String(item.targetId),mapExcluded:true,levelNote:'原县区记录保留供查看；地图按'+p.name+'整体标记，历史记录不重复计数'}});
    }
    return {features:entries,byId,legacyById,countries,countriesById,regionsById,citiesByRegion,citiesByCountry};
  }
  function prefectureHistory(records,cityId,model){
    return recordsWithFeatures(records,model).filter(f=>f.properties.prefectureTarget===String(cityId)).map(f=>({feature:f,record:records[id(f)]}));
  }
  function regionVisited(feature,visits){const key=id(feature);return visits.some(f=>!f.properties.mapExcluded&&(id(f)===key||f.properties.parentRegionId===key||f.properties.regionIds?.includes(key)));}
  function moveLegacyRegionRecord(records,from,to,model){
    from=String(from);to=String(to);
    const source=model.legacyById.get(from),destination=model.byId.get(to);
    if(!Object.prototype.hasOwnProperty.call(records,from)||records[from]?.visited!==true||source?.properties.legacyKind!=='world-region')throw Error('原省州足迹不存在或不是待补充城市的旧记录');
    if(destination?.properties.level!=='city'||!(destination.properties.parentRegionId===from||destination.properties.regionIds?.includes(from))||countryOf(destination)!==countryOf(source))throw Error('请选择该省州内的城市');
    if(Object.prototype.hasOwnProperty.call(records,to))throw Error('所选城市已有记录，请先保留并处理已有记录');
    const next={...records,[to]:records[from]};delete next[from];return next;
  }
  function recordsWithFeatures(records,model){
    return Object.keys(records).filter(key=>records[key]?.visited===true).map(key=>model.byId.get(key)||model.legacyById.get(key)||{type:'Feature',geometry:null,properties:{adcode:key,name:'待整理地区 '+key,country:'',countryCode:key.startsWith('world:')?key.split(':')[1]:'CHN',province:'旧版足迹',level:'legacy'}});
  }
  function groupMarkers(visits,scope,countryFeatures,provinceFeatures){
    visits=visits.filter(f=>!f.properties.mapExcluded);
    // Retained prefecture records are not county visits; their centers can overlap a county flag.
    if(scope.kind==='province'||scope.kind==='country')return visits.filter(f=>scope.kind==='province'?countryOf(f)==='CHN'&&String(f.properties.provinceCode)===scope.code&&f.properties.level!=='legacy':countryOf(f)===scope.code&&f.properties.legacyKind!=='world-country').map(f=>({...f,count:1,target:f.properties.legacyKind==='world-region'?'legacy-region':'record'}));
    const groups=new Map();
    for(const f of visits){const key=scope.kind==='china'?String(f.properties.provinceCode):countryOf(f);if(scope.kind==='china'&&countryOf(f)!=='CHN')continue;groups.set(key,(groups.get(key)||0)+1);}
    const shapes=scope.kind==='china'?provinceFeatures:countryFeatures.filter(f=>!['TWN','HKG','MAC'].includes(f.properties.countryCode));
    return shapes.filter(f=>groups.has(scope.kind==='china'?id(f):countryOf(f))).map(f=>({...f,count:groups.get(scope.kind==='china'?id(f):countryOf(f)),target:scope.kind==='china'?'province':'country'}));
  }
  const api=Object.freeze({text,id,countryOf,displayName,trail,matches,catalog,regionVisited,moveLegacyRegionRecord,recordsWithFeatures,groupMarkers,prefectureHistory});
  root.ShanheRegions=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
