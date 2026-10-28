(function(root){
  'use strict';
  function createFamilyArchiveAdapter({kind,primary,family,getMemberId,getSelectionVersion}){
    const stale=()=>({ok:false,code:'STALE_CONTEXT',message:'记录成员或账号已变化，请重新打开详情。'});
    function getState(){
      const id=getMemberId(),s=family.getState(),member=s.document.members.find(m=>m.id===id);
      if(id==='self')return {...primary.getState(),memberName:member?.name||'我'};
      return {records:structuredClone(s.document[kind][id]||{}),memberName:member?.name||'旅行成员',guest:false,userId:s.userId,revision:s.revision,ready:s.ready&&!!member&&!s.guest,busy:s.busy,error:s.error,guestCount:0,transferMessage:''};
    }
    function context(){const memberId=getMemberId();return {memberId,selectionVersion:getSelectionVersion(),source:memberId==='self'?primary.context():family.context()};}
    function matches(ctx){return ctx&&ctx.memberId===getMemberId()&&ctx.selectionVersion===getSelectionVersion();}
    return {
      getState,context,canEdit:()=>{const s=getState();return s.ready&&!s.busy&&(getMemberId()!=='self'||primary.canEdit());},
      async save(records,ctx){
        if(!matches(ctx))return stale();
        const result=await(ctx.memberId==='self'?primary.save(records,ctx.source):family.saveRecords(kind,ctx.memberId,records,ctx.source));
        return matches(ctx)?result:stale();
      },
      async refresh(){const ctx=context(),result=await(ctx.memberId==='self'?primary.refresh():family.refresh());return matches(ctx)?result:stale();},
    async transferGuest(){const ctx=context();if(ctx.memberId!=='self')return stale();const result=await primary.transferGuest?.();return matches(ctx)?result:stale();}
    };
  }
  root.createFamilyArchiveAdapter=createFamilyArchiveAdapter;
  if(typeof module==='object'&&module.exports)module.exports={createFamilyArchiveAdapter};
})(typeof globalThis==='object'?globalThis:this);
