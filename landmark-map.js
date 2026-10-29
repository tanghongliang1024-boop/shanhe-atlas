(function(root){
  'use strict';
  root.createLandmarkMap=function({catalog,store,open,getMembers}){
    const toggle=document.querySelector('#landmark-map-toggle'),theme=document.querySelector('#landmark-map-theme'),filter=document.querySelector('#landmark-map-status');
    const L=root.ShanheLandmarks;
    let group,points,names,last,focusedId=null;
    const scopeKey=scope=>String(scope?.kind||'')+':'+String(scope?.code||'');
    for(const item of catalog.themes){const option=document.createElement('option');option.value=item.id;option.textContent=item.name;theme.append(option);}
    function render(context){
      if(context){if(last&&scopeKey(context.scope)!==scopeKey(last.scope))focusedId=null;last=context;}if(!group||!last)return;
      const {scope}=last,records=store.getState().records;
      const family=!!getMembers;
      const list=!toggle.checked?[]:family?root.ShanheFamilyMap.landmarkMarkers(getMembers(),catalog,scope,{theme:theme.value,status:filter.value},L).map(item=>({...item.place,member:item.member,markerStatus:item.status,flagOffset:item.flagOffset})):L.markerPlaces(catalog,scope,{theme:theme.value,status:filter.value,records});
      const status=p=>family?p.markerStatus:L.status(records,p.id);
      // Keep every member's order within a place, but paint the focused place
      // last so nearby transparent touch targets cannot intercept its center.
      const pointOrder=focusedId?[...list.filter(p=>p.id!==focusedId),...list.filter(p=>p.id===focusedId)]:list;
      const uniquePlaces=[...new Map(list.map(p=>[p.id,p])).values()];
      // The chosen label claims space first; other labels then avoid it.
      const labelOrder=focusedId?[...uniquePlaces.filter(p=>p.id===focusedId),...uniquePlaces.filter(p=>p.id!==focusedId)]:uniquePlaces;
      group.selectAll('*').remove();
      points=group.append('g').selectAll('g').data(pointOrder).join('g').attr('class',p=>'landmark-marker '+status(p)).attr('role','button').attr('tabindex',0).attr('aria-label',p=>(p.member?p.member.name+'，':'')+p.name+'，名胜，'+({visited:'已经去过',wish:'想去',unvisited:'尚未到访'}[status(p)])).on('click',(e,p)=>{e.stopPropagation();open(p.id,p.member?.id);}).on('keydown',(e,p)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();open(p.id,p.member?.id);}});
      points.append('circle').attr('class','landmark-hit').attr('r',22);
      points.filter(p=>p.id===focusedId).append('circle').attr('class','landmark-focus-ring').attr('r',14).attr('fill','none').attr('stroke','#b58a43').attr('stroke-width',2).attr('pointer-events','none');
      points.append('circle').attr('class','landmark-dot').attr('r',10).style('stroke',p=>p.member?.hex||null);
      points.append('path').attr('class','landmark-mountain').attr('d','M-6,4 -1,-5 2,0 4,-2 7,4Z');
      const flags=points.filter(p=>status(p)==='visited').append('g').attr('class','landmark-flag');
      flags.append('path').attr('d','M9,0V-24').attr('stroke','#806449').attr('stroke-width',1.7);
      flags.append('path').attr('d','M10,-24C16,-28 20,-20 27,-24V-13C20,-9 16,-17 10,-13Z').attr('fill',p=>p.member?.hex||'#c16e51').attr('stroke','#fff9ed').attr('stroke-width',1);
      names=group.append('g').attr('pointer-events','none').selectAll('text').data(labelOrder).join('text').attr('class','landmark-map-label').text(p=>p.name);
      document.querySelector('#landmark-map-count').textContent=toggle.checked?'当前地图 '+new Set(list.map(p=>p.id)).size+' 处名胜':'名胜已隐藏';
      update(last);
    }
    function update(context){
      if(context)last={...last,...context};if(!points||!last?.projection||!last?.transform||!last.width)return;
      const {projection,transform,width,mapHeight}=last,k=transform.k,unit=1000/width,occupied=[],projected=new Map();
      if(!Number.isFinite(k)||k<=0||!Number.isFinite(unit))return;
      const point=p=>{if(!projected.has(p.id)){const xy=projection(p.coordinates);projected.set(p.id,Array.isArray(xy)&&xy.length===2&&xy.every(Number.isFinite)?xy:null);}return projected.get(p.id);};
      points.style('display',p=>point(p)?null:'none').attr('transform',p=>point(p)?'translate('+point(p)+') scale('+unit/k+')'+(p.flagOffset?' translate('+p.flagOffset+',0)':''):null);
      names.attr('x',p=>point(p)?.[0]??null).attr('y',p=>point(p)?.[1]??null).attr('dx',14*unit/k).attr('dy',5*unit/k).style('font-size',12*unit/k+'px').style('stroke-width',3*unit/k+'px').each(function(p){
        const xy=point(p);if(!xy){d3.select(this).style('display','none');return;}
        const x=xy[0]*k+transform.x,y=xy[1]*k+transform.y,box=[x+12*unit,y-13*unit,x+(p.name.length*12+16)*unit,y+8*unit];
        const hidden=x<0||x>1000||y<20||y>mapHeight-25||occupied.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]);
        d3.select(this).style('display',hidden?'none':null);if(!hidden)occupied.push(box);
      });
    }
    [toggle,theme,filter].forEach(el=>el.addEventListener('change',()=>{focusedId=null;render();}));
    return {mount(layer){focusedId=null;group=layer.append('g').attr('class','landmark-map-layer');},render,update,focus(id){focusedId=catalog.byId.has(id)?id:null;render();},show(){focusedId=null;toggle.checked=true;theme.value='all';filter.value='all';render();}};
  };
})(window);
