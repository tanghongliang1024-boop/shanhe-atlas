(function(root){
  'use strict';
  root.createLandmarkMap=function({catalog,store,open}){
    const toggle=document.querySelector('#landmark-map-toggle'),theme=document.querySelector('#landmark-map-theme'),filter=document.querySelector('#landmark-map-status');
    const L=root.ShanheLandmarks;
    let group,points,names,last;
    for(const item of catalog.themes){const option=document.createElement('option');option.value=item.id;option.textContent=item.name;theme.append(option);}
    function render(context){
      if(context)last=context;if(!group||!last)return;
      const {scope}=last,records=store.getState().records;
      const list=toggle.checked?L.markerPlaces(catalog,scope,{theme:theme.value,status:filter.value,records}):[];
      group.selectAll('*').remove();
      points=group.append('g').selectAll('g').data(list).join('g').attr('class',p=>'landmark-marker '+L.status(records,p.id)).attr('role','button').attr('tabindex',0).attr('aria-label',p=>p.name+'，名胜，'+({visited:'已经去过',wish:'想去',unvisited:'尚未到访'}[L.status(records,p.id)])).on('click',(e,p)=>{e.stopPropagation();open(p.id);}).on('keydown',(e,p)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();open(p.id);}});
      points.append('circle').attr('class','landmark-hit').attr('r',22);
      points.append('circle').attr('class','landmark-dot').attr('r',10);
      points.append('path').attr('class','landmark-mountain').attr('d','M-6,4 -1,-5 2,0 4,-2 7,4Z');
      const flags=points.filter(p=>L.status(records,p.id)==='visited').append('g').attr('class','landmark-flag');
      flags.append('path').attr('d','M9,0V-24').attr('stroke','#806449').attr('stroke-width',1.7);
      flags.append('path').attr('d','M10,-24C16,-28 20,-20 27,-24V-13C20,-9 16,-17 10,-13Z').attr('fill','#c16e51').attr('stroke','#fff9ed').attr('stroke-width',1);
      names=group.append('g').attr('pointer-events','none').selectAll('text').data(list).join('text').attr('class','landmark-map-label').text(p=>p.name);
      document.querySelector('#landmark-map-count').textContent=toggle.checked?'当前地图 '+list.length+' 处名胜':'名胜已隐藏';
      update(last);
    }
    function update(context){
      if(context)last={...last,...context};if(!points||!last?.projection||!last?.transform||!last.width)return;
      const {projection,transform,width,mapHeight}=last,k=transform.k,unit=1000/width,occupied=[],projected=new Map();
      if(!Number.isFinite(k)||k<=0||!Number.isFinite(unit))return;
      const point=p=>{if(!projected.has(p.id)){const xy=projection(p.coordinates);projected.set(p.id,Array.isArray(xy)&&xy.length===2&&xy.every(Number.isFinite)?xy:null);}return projected.get(p.id);};
      points.style('display',p=>point(p)?null:'none').attr('transform',p=>point(p)?'translate('+point(p)+') scale('+unit/k+')':null);
      names.attr('x',p=>point(p)?.[0]??null).attr('y',p=>point(p)?.[1]??null).attr('dx',14*unit/k).attr('dy',5*unit/k).style('font-size',12*unit/k+'px').style('stroke-width',3*unit/k+'px').each(function(p){
        const xy=point(p);if(!xy){d3.select(this).style('display','none');return;}
        const x=xy[0]*k+transform.x,y=xy[1]*k+transform.y,box=[x+12*unit,y-13*unit,x+(p.name.length*12+16)*unit,y+8*unit];
        const hidden=x<0||x>1000||y<20||y>mapHeight-25||occupied.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]);
        d3.select(this).style('display',hidden?'none':null);if(!hidden)occupied.push(box);
      });
    }
    [toggle,theme,filter].forEach(el=>el.addEventListener('change',()=>render()));
    return {mount(layer){group=layer.append('g').attr('class','landmark-map-layer');},render,update,show(){toggle.checked=true;theme.value='all';filter.value='all';render();}};
  };
})(window);
