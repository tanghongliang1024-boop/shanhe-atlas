(function(root){
  'use strict';
  const validate=root.validateShanheRecords||(typeof require==='function'?require('./cloud-store.js').validateRecords:null);
  function invalid(){const error=new Error('地市归档映射无效，原足迹未改动。');error.code='INVALID_MIGRATION';throw error;}
  function migrateRecords(input,manifest,occupiedInput={}){
    const records=validate(input),occupied=validate(occupiedInput),changes=[],conflicts=[];
    if(!manifest)return {records,changes,conflicts,changed:false};
    if(manifest.version!==1||!manifest.mappings||typeof manifest.mappings!=='object'||Array.isArray(manifest.mappings))invalid();
    const approved=new Map();
    for(const [from,item] of Object.entries(manifest.mappings)){
      if(item?.verified!==true)continue;
      if(!/^\d{6}$/.test(from)||!/^\d{6}$/.test(item.targetId)||typeof item.source!=='string'||!/^https:\/\/[^\s]+$/.test(item.source))invalid();
      approved.set(from,item.targetId);
    }
    for(const [from,to] of approved)if(from!==to&&approved.has(to)&&approved.get(to)!==to)invalid();
    const sources=Object.keys(records).filter(from=>approved.has(from)&&approved.get(from)!==from).sort((a,b)=>{
      const left=records[a].date||'9999-99-99',right=records[b].date||'9999-99-99';
      return left<right?-1:left>right?1:a<b?-1:a>b?1:0;
    });
    // Move one complete earliest-dated record, never concatenate or truncate notes.
    // All collisions remain under their source keys as accessible historical details.
    for(const from of sources){
      const to=approved.get(from);
      if(Object.hasOwn(records,to)||Object.hasOwn(occupied,to)){conflicts.push({from,to});continue;}
      records[to]={...records[from]};delete records[from];changes.push({from,to});
    }
    return {records:validate(records),changes,conflicts,changed:changes.length>0};
  }
  root.ShanhePrefectureMigration=Object.freeze({migrateRecords});
  if(typeof module==='object'&&module.exports)module.exports=root.ShanhePrefectureMigration;
})(typeof globalThis==='object'?globalThis:this);
