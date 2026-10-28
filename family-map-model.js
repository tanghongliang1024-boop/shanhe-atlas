(function(root){
  'use strict';
  const layout=list=>{
    const groups=new Map();for(const item of list){const key=item.markerKey;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
    return [...groups.values()].flatMap(items=>items.map((item,index)=>({...item,flagOffset:(index-(items.length-1)/2)*44,flagTotal:items.length})));
  };
  function regionMarkers(entries,scope,world,provinces,model,regions){
    return layout(entries.flatMap(entry=>regions.groupMarkers(regions.recordsWithFeatures(entry.records,model),scope,world,provinces).filter(f=>Array.isArray(f.properties.center)).map(f=>({...f,member:entry.member,markerKey:regions.id(f)+'|'+f.target}))));
  }
  function landmarkMarkers(entries,catalog,scope,filters,landmarks){
    const places=landmarks.markerPlaces(catalog,scope,{theme:filters.theme||'all'}),result=[];
    for(const place of places){
      const states=entries.map(entry=>({member:entry.member,status:landmarks.status(entry.records,place.id)}));
      const matched=states.filter(entry=>filters.status==='all'||!filters.status||entry.status===filters.status);
      const marked=matched.filter(entry=>entry.status==='visited'||entry.status==='wish');
      if(marked.length)for(const entry of marked)result.push({place,...entry,markerKey:place.id});
      else if(matched.length)result.push({place,member:null,status:'unvisited',markerKey:place.id});
    }
    return layout(result);
  }
  root.ShanheFamilyMap={layout,regionMarkers,landmarkMarkers};
  if(typeof module==='object'&&module.exports)module.exports=root.ShanheFamilyMap;
})(typeof globalThis==='object'?globalThis:this);
