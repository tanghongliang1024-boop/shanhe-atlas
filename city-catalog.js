(function(root){
  'use strict';
  const idOf=feature=>String(feature?.properties?.adcode??'');
  const normalize=value=>String(value??'').toLowerCase().replaceAll('臺','台').normalize('NFKC');
  const integer=(value,fallback)=>Number.isFinite(Number(value))?Math.floor(Number(value)):fallback;
  const stringSet=value=>new Set(value&&typeof value[Symbol.iterator]==='function'?[...value].map(String):[]);

  // Build once when a catalogue changes. Record status is deliberately read on
  // every query, so changing member, saving or cancelling never needs a rebuild.
  function createSearch(features,regions){
    if(!Array.isArray(features))throw new TypeError('City features must be an array');
    const text=typeof regions?.text==='function'?regions.text:normalize;
    const countryOf=typeof regions?.countryOf==='function'?regions.countryOf:f=>f.properties.countryCode||'CHN';
    const displayName=typeof regions?.displayName==='function'?regions.displayName:f=>f.properties.name||'';
    const countries=new Map(),provinces=new Map();
    const append=(map,key,item)=>{if(!map.has(key))map.set(key,[]);map.get(key).push(item);};
    const entries=features.map(feature=>{
      const p=feature?.properties;if(!p)throw new TypeError('City properties are required');
      const item={feature,id:idOf(feature),country:countryOf(feature),
        provinces:new Set([String(p.provinceCode??''),...(p.regionIds||[]).map(String)]),
        text:text([displayName(feature),p.name,p.country,p.province,p.city,...(p.aliases||[])].join(' '))};
      append(countries,item.country,item);
      for(const province of item.provinces)if(province)append(provinces,province,item);
      return item;
    });
    function query(options={}){
      const needle=text(options.query||''),country=String(options.country??'all'),province=String(options.province??'all');
      const status=options.status||'all',visited=options.visited;
      if(!['all','visited','unvisited'].includes(status))return [];
      let candidates=entries;
      if(country!=='all')candidates=countries.get(country)||[];
      if(province!=='all'){
        const regional=provinces.get(province)||[];
        if(regional.length<candidates.length)candidates=regional;
      }
      const isVisited=item=>typeof visited==='function'?visited(item.feature)===true:
        visited instanceof Set?visited.has(item.id):visited instanceof Map?visited.get(item.id)?.visited===true:
        visited?.[item.id]?.visited===true;
      const result=[];
      for(const item of candidates){
        if(country!=='all'&&item.country!==country)continue;
        if(province!=='all'&&!item.provinces.has(province))continue;
        if(needle&&!item.text.includes(needle))continue;
        if(status!=='all'&&(status==='visited')!==isVisited(item))continue;
        result.push(item.feature);
      }
      return result;
    }
    return Object.freeze({query,size:entries.length});
  }

  // Zero-based pages. Asking beyond the last page returns an empty page instead
  // of silently jumping backwards; the caller can display an accurate count.
  function page(items,pageIndex=0,pageSize=60){
    if(!Array.isArray(items))throw new TypeError('Page items must be an array');
    pageIndex=Math.max(0,integer(pageIndex,0));
    pageSize=Math.max(1,Math.min(1000,integer(pageSize,60)));
    const offset=pageIndex*pageSize,total=items.length;
    return {items:items.slice(offset,offset+pageSize),total,pageIndex,pageSize,
      pageCount:Math.ceil(total/pageSize),hasMore:offset+pageSize<total};
  }

  // Projection is evaluated once per country drawing. Select accepts D3's
  // transform in the existing 1000-wide SVG viewBox and CSS viewport dimensions.
  // Small catalogues (<=150 valid points) retain their original complete layer.
  function createSpatial(features,projection){
    if(!Array.isArray(features)||typeof projection!=='function')throw new TypeError('City features and a projection are required');
    const points=[],byId=new Map();
    for(const feature of features){
      const p=feature?.properties,center=p?.center;
      if(p?.mapExcluded||!Array.isArray(center)||center.length!==2||!center.every(Number.isFinite))continue;
      const projected=projection(center);
      if(!Array.isArray(projected)||projected.length!==2||!projected.every(Number.isFinite))continue;
      const point={feature,id:idOf(feature),x:projected[0],y:projected[1]};
      if(byId.has(point.id))continue;
      points.push(point);byId.set(point.id,point);
    }
    // Assign lexical ID order once. Zoom events then compare small integers
    // instead of repeatedly hashing long IDs and comparing their strings.
    const idOrder=points.slice().sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
    idOrder.forEach((point,rank)=>point.rank=rank);
    const sorted=points.slice().sort((a,b)=>a.x-b.x||a.rank-b.rank);
    function lowerBound(x){
      let lo=0,hi=sorted.length;
      while(lo<hi){const mid=(lo+hi)>>>1;if(sorted[mid].x<x)lo=mid+1;else hi=mid;}
      return lo;
    }
    function select(options={}){
      const width=Number(options.width),mapHeight=Number(options.mapHeight??740);
      const height=Number(options.height??mapHeight*width/1000),scale=width/1000;
      const transform=options.transform||{},k=Number(transform.k??1),tx=Number(transform.x??0),ty=Number(transform.y??0);
      if(![width,height,mapHeight,k,tx,ty].every(Number.isFinite)||width<=0||height<=0||mapHeight<=0||k<=0)return [];
      if(points.length<=150)return points.map(point=>point.feature);
      const limit=Math.max(1,Math.min(250,integer(options.limit,width<=600?100:250)));
      const priority=stringSet(options.priorityIds),focus=byId.get(String(options.focusId??''));
      const left=-tx/k,right=(width/scale-tx)/k,top=-ty/k,bottom=(height/scale-ty)/k;
      const candidates=[];
      for(let i=lowerBound(left);i<sorted.length&&sorted[i].x<=right;i++){
        const point=sorted[i];if(point.y>=top&&point.y<=bottom){point.priority=priority.has(point.id)?0:1;candidates.push(point);}
      }
      candidates.sort((a,b)=>a.priority-b.priority||a.rank-b.rank);
      const columns=Math.max(1,Math.min(Math.floor(width/36)||1,Math.floor(Math.sqrt(limit*width/height))||1));
      const rows=Math.max(1,Math.min(Math.floor(height/36)||1,Math.floor(limit/columns)||1));
      const cellWidth=width/columns,cellHeight=height/rows,cells=new Map(),selected=[],selectedIds=new Set();
      const screen=point=>({x:(point.x*k+tx)*scale,y:(point.y*k+ty)*scale});
      function add(point,force=false){
        if(selectedIds.has(point.id)||selected.length>=limit)return;
        const p=screen(point),col=Math.min(columns-1,Math.max(0,Math.floor(p.x/cellWidth))),row=Math.min(rows-1,Math.max(0,Math.floor(p.y/cellHeight)));
        const key=col+':'+row,onScreen=p.x>=0&&p.x<=width&&p.y>=0&&p.y<=height;
        if(!force){
          if(cells.has(key))return;
          for(let x=col-1;x<=col+1;x++)for(let y=row-1;y<=row+1;y++){
            const other=cells.get(x+':'+y);
            if(other&&Math.hypot(other.x-p.x,other.y-p.y)<36)return;
          }
        }
        selected.push(point.feature);selectedIds.add(point.id);
        if(onScreen)cells.set(key,p);
      }
      // A focused result is retained even during the pan/zoom transition before
      // it enters the viewport, and wins any grid collision with priority dots.
      if(focus)add(focus,true);
      for(const point of candidates){add(point);if(selected.length>=limit)break;}
      return selected;
    }
    return Object.freeze({select,size:points.length});
  }

  const api=Object.freeze({createSearch,createSpatial,page});
  root.ShanheCityCatalog=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
