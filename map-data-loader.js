(function(root){
  'use strict';
  const GEO='assets/geo/';
  const OVERVIEW=['world.geo.json','world-france-parts.geo.json'];
  const CATALOG=['china-prefecture-index.json','world-index.json','county-migration-map.json','region-level-reversal-map.json','world-cities.json','world-city-migration-map.json','china-index.json','china-prefecture-migration-map.json','us-cities.json','china-legacy-metadata.json'];
  function createLoader(options={}){
    const request=options.fetch||root.fetch?.bind(root);
    if(typeof request!=='function')throw new TypeError('Map data loader requires fetch');
    const cache=new Map();
    function load(path,priority){
      if(cache.has(path))return cache.get(path);
      // Retain the existing asset URLs so previously cached maps remain useful.
      const version=path.split('?')[0]===GEO+'china-legacy-metadata.json'?'20261030-startup':'20261029-us-incorporated';
      const url=path+(path.includes('?')?'&':'?')+'v='+version;
      const pending=Promise.resolve().then(()=>request(url,{priority})).then(response=>{
        if(!response.ok)throw new Error('无法读取地图资源（HTTP '+response.status+'）：'+path);
        return response.json();
      }).catch(error=>{
        if(cache.get(path)===pending)cache.delete(path);
        throw error;
      });
      cache.set(path,pending);
      return pending;
    }
    return Object.freeze({
      json:path=>load(path,'auto'),
      overview:()=>Promise.all(OVERVIEW.map(name=>load(GEO+name,'high'))),
      catalog:()=>Promise.all(CATALOG.map(name=>load(GEO+name,'low')))
    });
  }
  const api=Object.freeze({createLoader});
  root.ShanheMapData=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
