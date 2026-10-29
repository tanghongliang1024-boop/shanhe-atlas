'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('../city-catalog.js'),R=require('../region-model.js');
const city=(id,name,center=[500,370],extra={})=>({type:'Feature',geometry:null,properties:{adcode:id,name,nameEn:name,countryCode:'USA',country:'美国',province:'测试州',provinceCode:'world:USA:US-CA',parentRegionId:'world:USA:US-CA',regionIds:['world:USA:US-CA'],level:'city',center,aliases:[],...extra}});
const ids=features=>features.map(R.id);

test('cached search preserves region matching, source order, aliases and country/province intersections',()=>{
  const features=[
    city('world:USA:city-a','Springfield',[1,2],{aliases:['春田','ＳＰＲＩＮＧＦＩＥＬＤ']}),
    city('world:USA:city-b','Springfield',[3,4],{province:'另一州',provinceCode:'world:USA:US-IL',regionIds:['world:USA:US-IL']}),
    city('world:CAN:city-c','臺北村',[5,6],{countryCode:'CAN',country:'加拿大',provinceCode:'world:CAN:CA-ON',regionIds:['world:CAN:CA-ON','world:CAN:CA-QC']})
  ];
  const before=structuredClone(features),search=C.createSearch(features,R);
  for(const query of ['springfield','ＳＰＲＩＮＧＦＩＥＬＤ','春田','台北','美国','测试州','']){
    for(const country of ['all','USA','CAN'])for(const province of ['all','world:USA:US-CA','world:CAN:CA-QC']){
      assert.deepEqual(search.query({query,country,province}),features.filter(feature=>R.matches(feature,query,country,province)));
    }
  }
  assert.deepEqual(ids(search.query({query:'Springfield'})),['world:USA:city-a','world:USA:city-b'],'same-name places remain independent');
  assert.deepEqual(features,before);
});

test('visited status is read dynamically for each member and cancellation without rebuilding the search',()=>{
  const features=[city('world:USA:city-a','A'),city('world:USA:city-b','B')],search=C.createSearch(features,R);
  let records={'world:USA:city-a':{visited:true,date:'2024-01-02',note:'首位成员'}};
  const before=structuredClone(records),visited=feature=>records[R.id(feature)]?.visited===true;
  assert.deepEqual(ids(search.query({status:'visited',visited})),['world:USA:city-a']);
  assert.deepEqual(ids(search.query({status:'unvisited',visited})),['world:USA:city-b']);
  assert.deepEqual(records,before);
  records={'world:USA:city-b':{visited:true}};
  assert.deepEqual(ids(search.query({status:'visited',visited})),['world:USA:city-b']);
  delete records['world:USA:city-b'];
  assert.deepEqual(search.query({status:'visited',visited}),[]);
  assert.equal(search.query({status:'unvisited',visited}).length,2);
  assert.deepEqual(ids(search.query({status:'visited',visited:new Set(['world:USA:city-a'])})),['world:USA:city-a']);
  assert.deepEqual(ids(search.query({status:'visited',visited:{'world:USA:city-b':{visited:true}}})),['world:USA:city-b']);
  assert.deepEqual(search.query({status:'unsupported'}),[]);
});

test('30,000-entry search retains accurate totals and can find entries beyond any displayed page',()=>{
  let normalized=0;
  const features=Array.from({length:30000},(_,i)=>city('world:USA:city-'+String(i).padStart(5,'0'),'City '+i,[i%1000,Math.floor(i/1000)],{aliases:['Catalog '+i],provinceCode:i%2?'world:USA:US-TX':'world:USA:US-CA',regionIds:[]}));
  const search=C.createSearch(features,{...R,text:value=>{normalized++;return R.text(value);}});
  assert.equal(normalized,30000);
  assert.equal(search.query({country:'USA'}).length,30000);
  assert.equal(search.query({country:'USA',province:'world:USA:US-TX'}).length,15000);
  assert.deepEqual(ids(search.query({query:'Catalog 29999'})),['world:USA:city-29999']);
  assert.equal(normalized,30003,'catalog text is normalized once; only each new query is normalized afterwards');
  const last=C.page(search.query({country:'USA'}),499,60);
  assert.equal(last.total,30000);assert.equal(last.items.length,60);assert.equal(last.hasMore,false);
  assert.equal(R.id(last.items.at(-1)),'world:USA:city-29999');
});

test('paging reports exact totals, boundaries and empty results without changing source items',()=>{
  const items=Array.from({length:125},(_,i)=>({i})),before=structuredClone(items);
  assert.deepEqual(C.page(items,2),{items:items.slice(120),total:125,pageIndex:2,pageSize:60,pageCount:3,hasMore:false});
  assert.equal(C.page(items,0).hasMore,true);
  assert.deepEqual(C.page(items,3).items,[]);
  assert.deepEqual(C.page([],0),{items:[],total:0,pageIndex:0,pageSize:60,pageCount:0,hasMore:false});
  assert.equal(C.page(items,-2).pageIndex,0);
  assert.deepEqual(items,before);
});

const many=Array.from({length:30000},(_,i)=>city('world:USA:city-'+String(i).padStart(5,'0'),'City '+i,[(i%200)*5,Math.floor(i/200)*4]));

test('30,000-city spatial selection caches projection and bounds mobile/desktop SVG output',()=>{
  let projectionCalls=0;
  const spatial=C.createSpatial(many,point=>{projectionCalls++;return [...point];});
  assert.equal(projectionCalls,30000);assert.equal(spatial.size,30000);
  for(const width of [390,1000]){
    const height=740*width/1000,selected=spatial.select({width,height,mapHeight:740});
    assert.ok(selected.length>0);
    assert.ok(selected.length<=(width===390?100:250));
    assert.equal(new Set(ids(selected)).size,selected.length);
    assert.deepEqual(ids(spatial.select({width,height,mapHeight:740})),ids(selected),'unchanged views have stable selections');
    const points=selected.map(feature=>feature.properties.center.map(value=>value*width/1000));
    for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)assert.ok(Math.hypot(points[i][0]-points[j][0],points[i][1]-points[j][1])>=36-1e-9,'selected dots do not collide at cell edges');
  }
  spatial.select({width:390,mapHeight:1000,transform:{k:8,x:-1200,y:-1800}});
  assert.equal(projectionCalls,30000,'pan and zoom never re-project the full city catalogue');
});

test('viewport filtering and zoom expose local cities while focus overrides priority and collisions',()=>{
  const focus=city('world:USA:city-focus','Focus',[500,370]);
  const base=city('world:USA:city-base','Base',[500,370]);
  const offscreen=city('world:USA:city-outside','Outside',[2000,1500]);
  const spatial=C.createSpatial([...many,base,focus,offscreen],point=>point);
  const normal=spatial.select({width:1000,height:740,priorityIds:new Set([R.id(base)])});
  assert.ok(ids(normal).includes(R.id(base)));
  assert.equal(ids(normal).includes(R.id(focus)),false);
  assert.equal(ids(normal).includes(R.id(offscreen)),false);
  const chosen=spatial.select({width:1000,height:740,priorityIds:[R.id(base)],focusId:R.id(focus),limit:1});
  assert.deepEqual(ids(chosen),[R.id(focus)]);
  assert.deepEqual(ids(spatial.select({width:390,focusId:R.id(offscreen),limit:1})),[R.id(offscreen)],'focused result survives a pending pan transition');
  const zoom={k:60,x:500-505*60,y:370-372*60};
  const selected=spatial.select({width:1000,height:740,transform:zoom});
  assert.ok(selected.length>0);
  for(const feature of selected){const [x,y]=feature.properties.center;assert.ok(x*zoom.k+zoom.x>=0&&x*zoom.k+zoom.x<=1000);assert.ok(y*zoom.k+zoom.y>=0&&y*zoom.k+zoom.y<=740);}
  const target=many.find(feature=>feature.properties.center[0]===505&&feature.properties.center[1]===372);
  assert.ok(ids(selected).includes(R.id(target)),'zooming into a town reveals it without requiring focus');
});

test('small-country layers keep all original cities and invalid coordinates never reach rendering',()=>{
  const small=many.slice(0,150),before=structuredClone(small);
  const spatial=C.createSpatial(small,point=>point);
  assert.deepEqual(spatial.select({width:390,transform:{k:20,x:5000,y:5000}}),small,'small countries retain existing complete-layer behavior');
  assert.deepEqual(small,before);
  const invalid=[city('world:USA:city-bad','Bad',[NaN,1]),city('world:USA:city-excluded','Removed',[1,2],{mapExcluded:true})];
  assert.equal(C.createSpatial(invalid,point=>point).size,0);
  assert.deepEqual(spatial.select({width:0}),[]);
  assert.deepEqual(spatial.select({width:390,transform:{k:0,x:0,y:0}}),[]);
});

test('browser distribution exposes the same pure helper API without DOM or libraries',()=>{
  const sandbox={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../city-catalog.js'),'utf8'),sandbox);
  assert.deepEqual(Object.keys(sandbox.ShanheCityCatalog).sort(),['createSearch','createSpatial','page']);
  assert.equal(sandbox.ShanheCityCatalog.page([1,2,3],0,2).total,3);
});
