'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createLoader}=require('../map-data-loader.js');
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const response=value=>({ok:true,status:200,json:async()=>value});

test('creating the loader performs no fetch and the browser global works without CommonJS',()=>{
  let calls=0;
  createLoader({fetch:()=>{calls++;}});
  const context={fetch:()=>{calls++;}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../map-data-loader.js'),'utf8'),context);
  assert.equal(typeof context.ShanheMapData.createLoader,'function');
  context.ShanheMapData.createLoader();
  assert.equal(calls,0);
});

test('same-path concurrent and resolved requests share one fetch and one JSON parse',async()=>{
  const gate=deferred(),value={features:[{id:'MUS'}]};let calls=0,parses=0;
  const loader=createLoader({fetch:async()=>{calls++;await gate.promise;return {ok:true,json:async()=>{parses++;return value;}};}});
  const first=loader.json('assets/geo/world.geo.json'),second=loader.json('assets/geo/world.geo.json');
  assert.equal(first,second);
  await Promise.resolve();assert.equal(calls,1);
  gate.resolve();assert.equal(await first,value);
  assert.equal(await loader.json('assets/geo/world.geo.json'),value);
  assert.equal(calls,1);assert.equal(parses,1);
});

test('overview and catalog start independently in parallel using preload-compatible versioned URLs',async()=>{
  const requests=[];
  const loader=createLoader({fetch:(url,options)=>{const gate=deferred();requests.push({url,options,gate});return gate.promise;}});
  const overview=loader.overview(),catalog=loader.catalog();
  const overviewAgain=loader.overview();
  await Promise.resolve();
  assert.equal(requests.length,12,'both groups start without waiting for the other to complete');
  assert.deepEqual(requests.slice(0,2).map(item=>[item.url,item.options.priority]),[
    ['assets/geo/world.geo.json?v=20261029-us-incorporated','high'],
    ['assets/geo/world-france-parts.geo.json?v=20261029-us-incorporated','high']
  ]);
  const names=['china-prefecture-index.json','world-index.json','county-migration-map.json','region-level-reversal-map.json','world-cities.json','world-city-migration-map.json','china-index.json','china-prefecture-migration-map.json','us-cities.json','china-legacy-metadata.json'];
  assert.deepEqual(requests.slice(2).map(item=>[item.url,item.options.priority]),names.map(name=>['assets/geo/'+name+'?v='+(name==='china-legacy-metadata.json'?'20261030-startup':'20261029-us-incorporated'),'low']));
  // Finish the overview first while every catalog request is still pending.
  requests[1].gate.resolve(response({part:'france'}));requests[0].gate.resolve(response({part:'world'}));
  assert.deepEqual(await overview,[{part:'world'},{part:'france'}]);
  assert.deepEqual(await overviewAgain,await overview);
  for(let i=requests.length-1;i>=2;i--)requests[i].gate.resolve(response({file:names[i-2]}));
  assert.deepEqual(await catalog,names.map(file=>({file})),'out-of-order responses retain the catalog tuple order');
  await loader.json('assets/geo/world.geo.json');await loader.catalog();
  assert.equal(requests.length,12,'direct requests and groups reuse resolved assets');
});

test('network errors release a shared pending entry so the next call can retry',async()=>{
  const error=new Error('network unavailable');let attempts=0;
  const loader=createLoader({fetch:()=>{attempts++;if(attempts===1)throw error;return response({retried:true});}});
  const first=loader.json('assets/geo/test.json'),second=loader.json('assets/geo/test.json');
  assert.equal(first,second);
  await assert.rejects(first,error);
  assert.deepEqual(await loader.json('assets/geo/test.json'),{retried:true});
  assert.equal(attempts,2);
});

test('HTTP failures are rejected before parsing and can be retried',async()=>{
  let attempts=0,parses=0;
  const loader=createLoader({fetch:async()=>++attempts===1?{ok:false,status:503,json:()=>{parses++;}}:response({ok:true})});
  await assert.rejects(loader.json('assets/geo/test.json'),/HTTP 503/);
  assert.equal(parses,0);
  assert.deepEqual(await loader.json('assets/geo/test.json'),{ok:true});
  assert.equal(attempts,2);
});

test('invalid JSON releases only the failed asset, preserving successful group assets',async()=>{
  const counts=new Map();
  const loader=createLoader({fetch:async url=>{
    const count=(counts.get(url)||0)+1;counts.set(url,count);
    if(url.includes('world-france-parts')&&count===1)return {ok:true,json:async()=>{throw new SyntaxError('invalid JSON');}};
    return response({url});
  }});
  await assert.rejects(loader.overview(),/invalid JSON/);
  const result=await loader.overview();
  assert.equal(result.length,2);
  assert.equal(counts.get('assets/geo/world.geo.json?v=20261029-us-incorporated'),1);
  assert.equal(counts.get('assets/geo/world-france-parts.geo.json?v=20261029-us-incorporated'),2);
});
