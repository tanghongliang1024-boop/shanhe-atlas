(function(root){
  'use strict';
  const COLORS=Object.freeze([
    Object.freeze({id:'terracotta',name:'暖红',hex:'#cf795e'}),
    Object.freeze({id:'blue',name:'蓝色',hex:'#377eb8'}),
    Object.freeze({id:'purple',name:'紫色',hex:'#8962a5'}),
    Object.freeze({id:'gold',name:'金色',hex:'#b38325'})
  ]);
  const CHILD_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const copy=value=>structuredClone(value);
  const defaultDocument=()=>({version:1,members:[{id:'self',name:'我',color:'terracotta'}],regions:{},landmarks:{}});
  const messages={CLIENT_UPDATE_REQUIRED:'请刷新网页或安装新版 App 后再保存。当前版本无法安全保存市级地图记录。',AUTH_REQUIRED:'请先登录家长账号，再添加或编辑家庭成员。',AUTH_FAILED:'暂时无法确认家庭账号，请重试。',FORBIDDEN:'账号已变化，请重新打开记录。',READ_FAILED:'暂时无法读取家庭足迹，请重试。',WRITE_FAILED:'家庭足迹保存失败，当前输入仍然保留，请重试。',CONFLICT:'家庭足迹已在其他窗口或设备更新，请读取最新记录后重新编辑。',STALE_CONTEXT:'成员或账号存档已变化，请重新打开记录。',INVALID_RESPONSE:'家庭云端返回的数据无效，请稍后重试。',INVALID_DOCUMENT:'家庭成员或足迹格式不正确。',BUSY:'家庭存档正在同步，请稍候。',NOT_READY:'请先成功读取家庭存档，再编辑。'};
  const error=(code,message)=>Object.assign(new Error(message||messages[code]),{code});
  const failure=(code,message)=>({ok:false,code,message:message||messages[code]});
  function props(value){
    if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw error('INVALID_DOCUMENT');
    const all=Object.getOwnPropertyDescriptors(value);
    if(Reflect.ownKeys(all).some(k=>typeof k!=='string'||!all[k].enumerable||!Object.hasOwn(all[k],'value')))throw error('INVALID_DOCUMENT');
    return all;
  }
  function fields(value,names){const p=props(value);if(Object.keys(p).length!==names.length||names.some(k=>!Object.hasOwn(p,k)))throw error('INVALID_DOCUMENT');return p;}
  function validateDocument(input,validators={}){
    const top=fields(input,['version','members','regions','landmarks']);
    if(top.version.value!==1||!Array.isArray(top.members.value)||top.members.value.length<1||top.members.value.length>4)throw error('INVALID_DOCUMENT','每个家庭账号支持 1 至 4 位成员。');
    const memberProps=Object.getOwnPropertyDescriptors(top.members.value);
    if(Reflect.ownKeys(memberProps).some(key=>key!=='length'&&(typeof key!=='string'||!/^\d+$/.test(key)||+key>=top.members.value.length||!memberProps[key].enumerable||!Object.hasOwn(memberProps[key],'value'))))throw error('INVALID_DOCUMENT');
    const ids=new Set(),names=new Set(),colors=new Set(),members=[];
    for(let i=0;i<top.members.value.length;i++){
      const item=top.members.value[i],p=fields(item,['id','name','color']);
      const id=p.id.value,name=p.name.value,color=p.color.value;
      if(typeof id!=='string'||(i===0?id!=='self':!CHILD_ID.test(id))||ids.has(id))throw error('INVALID_DOCUMENT','家庭成员编号不正确。');
      if(typeof name!=='string'||!name||name!==name.trim()||name.length>12||/[\u0000-\u001f\u007f]/.test(name)||names.has(name.toLowerCase()))throw error('INVALID_DOCUMENT','成员昵称需为 1 至 12 个字符，且不能重复。');
      if(!COLORS.some(c=>c.id===color)||colors.has(color))throw error('INVALID_DOCUMENT','请为每位成员选择不同的旗子颜色。');
      ids.add(id);names.add(name.toLowerCase());colors.add(color);members.push({id,name,color});
    }
    const result={version:1,members,regions:{},landmarks:{}};
    const regionValidator=validators.regions||root.validateShanheRecords;
    const landmarkValidator=validators.landmarks||root.validateShanheLandmarkRecords;
    if(typeof regionValidator!=='function'||typeof landmarkValidator!=='function')throw error('INVALID_DOCUMENT','家庭足迹校验尚未就绪，请刷新页面。');
    for(const kind of ['regions','landmarks']){
      const map=props(top[kind].value),keys=Object.keys(map);
      if(keys.length!==members.length-1||keys.some(id=>id==='self'||!ids.has(id)))throw error('INVALID_DOCUMENT','家庭足迹必须属于已有成员。');
      for(const member of members.slice(1)){
        if(!Object.hasOwn(map,member.id))throw error('INVALID_DOCUMENT');
        result[kind][member.id]=(kind==='regions'?regionValidator:landmarkValidator)(map[member.id].value);
      }
    }
    if(new TextEncoder().encode(JSON.stringify(result)).length>16777216)throw error('INVALID_DOCUMENT','家庭足迹超过存档容量。');
    return result;
  }
  function safeError(cause,fallback){
    if(cause?.message==='CLIENT_UPDATE_REQUIRED')return error('CLIENT_UPDATE_REQUIRED');
    if(cause?.code==='40001'||cause?.message==='REVISION_CONFLICT'||cause?.code==='CONFLICT')return error('CONFLICT');
    if(cause?.code==='42501'||cause?.status===403)return error('FORBIDDEN');
    if(cause?.status===401||['PGRST301','PGRST303','session_not_found'].includes(cause?.code))return error('AUTH_REQUIRED');
    return error(Object.hasOwn(messages,cause?.code)?cause.code:fallback);
  }
  function createFamilyStore(options={}){
    const validate=doc=>validateDocument(doc,options.validators);
    let client,subscription,started=false,startTask=null,sessionKnown=false,epoch=0,authSequence=0,operation=null;
    let state={document:defaultDocument(),revision:0,userId:null,guest:true,ready:false,busy:false,error:null,status:'guest'};
    const getState=()=>({...state,document:copy(state.document),error:state.error?{...state.error}:null});
    const context=()=>Object.freeze({userId:state.userId,revision:state.revision,epoch});
    const matches=ctx=>!!ctx&&ctx.userId===state.userId&&ctx.epoch===epoch&&ctx.revision===state.revision;
    const canEdit=()=>!state.guest&&state.ready&&!state.busy;
    function notify(){try{options.onChange?.(getState());}catch(_){}}
    function setError(cause,fallback,ready=state.ready){const e=safeError(cause,fallback);state={...state,ready,busy:false,error:{code:e.code,message:e.message},status:'error'};notify();return failure(e.code,e.message);}
    function userId(session){
      const user=session?.user;
      // This store also receives raw SDK events. Match the primary archive's
      // confirmed-email gate before adopting an identity or taking its token.
      return typeof user?.id==='string'&&user.id.trim()&&typeof user.email==='string'&&user.email.trim()&&
        typeof user.email_confirmed_at==='string'&&Number.isFinite(Date.parse(user.email_confirmed_at))?user.id:null;
    }
    function adoptIdentity(session){
      const id=userId(session);sessionKnown=true;
      if(id===state.userId)return false;
      epoch++;operation=null;
      state={document:defaultDocument(),revision:0,userId:id,guest:!id,ready:!id,busy:!!id,error:null,status:id?'loading':'guest'};
      try{options.onAccountChange?.(id);}catch(_){}
      notify();return true;
    }
    async function request(query,fallback){try{const response=await query;if(!response||typeof response!=='object')throw error('INVALID_RESPONSE');if(response.error)throw response.error;return response.data;}catch(cause){throw safeError(cause,fallback);}}
    async function tokenFor(id){
      const data=await request(client.auth.getSession(),'AUTH_FAILED');
      if(!userId(data?.session))throw error('AUTH_REQUIRED');
      if(userId(data.session)!==id)throw error('FORBIDDEN');
      if(typeof data.session.access_token!=='string'||!data.session.access_token)throw error('AUTH_REQUIRED');
      return data.session.access_token;
    }
    function snapshot(data,previous){
      if(data===null&&previous===undefined)return {document:defaultDocument(),revision:0};
      if(!data||!Number.isSafeInteger(data.revision)||data.revision<1||(previous!==undefined&&data.revision!==previous+1))throw error('INVALID_RESPONSE');
      try{return {document:validate(data.document),revision:data.revision};}catch(_){throw error('INVALID_RESPONSE');}
    }
    async function readArchive(){
      if(!state.userId){state={...state,ready:sessionKnown,busy:false};notify();return {ok:true,guest:true};}
      if(operation)return failure('BUSY');
      const id=state.userId,requestEpoch=epoch,op={};operation=op;
      state={...state,busy:true,error:null,status:'loading'};notify();
      try{
        const token=await tokenFor(id);
        if(requestEpoch!==epoch||operation!==op)return failure('STALE_CONTEXT');
        const data=await request(client.from('shanhe_family_archives').select('document,revision').eq('user_id',id).maybeSingle().setHeader('Authorization','Bearer '+token),'READ_FAILED');
        if(requestEpoch!==epoch||operation!==op)return failure('STALE_CONTEXT');
        const latest=snapshot(data);
        state={...state,...latest,ready:true,busy:false,error:null,status:'ready'};operation=null;notify();return {ok:true};
      }catch(cause){if(requestEpoch!==epoch||operation!==op)return failure('STALE_CONTEXT');operation=null;return setError(cause,'READ_FAILED',false);}
    }
    async function applySession(session,sequence){
      if(sequence!==authSequence)return;
      adoptIdentity(session);
      if(!state.userId){state={...state,ready:true,busy:false,error:null,status:'guest'};notify();return;}
      // Token refresh and duplicate initial events must not replace an open form
      // or race a pending write. Explicit refresh remains available after errors.
      if(operation||state.ready)return;
      await readArchive();
    }
    function start(sharedClient){
      if(startTask)return startTask;
      if(started)return Promise.resolve();
      client=sharedClient;started=true;state={...state,busy:true,status:'loading'};notify();
      startTask=(async()=>{
        try{
          if(!client?.auth?.getSession||!client.auth.onAuthStateChange)throw error('AUTH_FAILED');
          subscription=client.auth.onAuthStateChange((_event,session)=>{
            const sequence=++authSequence;
            // Clear the previous account synchronously. Never call the SDK while
            // Supabase still holds its auth event lock.
            adoptIdentity(session);
            setTimeout(()=>{applySession(session,sequence).catch(cause=>{if(sequence===authSequence)setError(cause,'READ_FAILED',false);});},0);
          });
          const sequence=authSequence,data=await request(client.auth.getSession(),'AUTH_FAILED');
          if(sequence===authSequence)await applySession(data?.session,sequence);
        }catch(cause){if(!sessionKnown)setError(cause,'AUTH_FAILED',false);}
        finally{startTask=null;}
      })();
      return startTask;
    }
    async function refresh(){
      if(operation)return failure('BUSY');
      if(!client)return failure('AUTH_REQUIRED');
      if(!sessionKnown){
        const sequence=authSequence;
        try{const data=await request(client.auth.getSession(),'AUTH_FAILED');if(sequence!==authSequence)return failure('STALE_CONTEXT');adoptIdentity(data?.session);}catch(cause){return setError(cause,'AUTH_FAILED',false);}
      }
      return readArchive();
    }
    async function saveDocument(document,ctx){
      if(state.guest)return failure('AUTH_REQUIRED');
      if(!matches(ctx))return failure('STALE_CONTEXT');
      if(ctx.revision>=Number.MAX_SAFE_INTEGER)return failure('NOT_READY','家庭存档版本已达到上限，请联系管理员。');
      if(!state.ready)return failure('NOT_READY');
      if(state.busy||operation)return failure('BUSY');
      let clean;
      try{clean=validate(document);if(state.document.members.some(m=>!clean.members.some(n=>n.id===m.id)))throw error('INVALID_DOCUMENT','已有成员需要保留，不能移除其足迹。');}
      catch(cause){return failure('INVALID_DOCUMENT',cause.message||messages.INVALID_DOCUMENT);}
      const id=state.userId,requestEpoch=epoch,op={};operation=op;
      state={...state,busy:true,error:null,status:'saving'};notify();
      try{
        const token=await tokenFor(id);
        if(requestEpoch!==epoch||operation!==op)return failure('STALE_CONTEXT');
        const data=await request(client.rpc('shanhe_save_family_archive_v2',{p_document:clean,p_expected_revision:ctx.revision}).setHeader('Authorization','Bearer '+token),'WRITE_FAILED');
        if(requestEpoch!==epoch||operation!==op)return failure('STALE_CONTEXT');
        const saved=snapshot(data,ctx.revision);
        state={...state,...saved,ready:true,busy:false,error:null,status:'saved'};operation=null;notify();return {ok:true,guest:false};
      }catch(cause){if(requestEpoch!==epoch||operation!==op)return failure('STALE_CONTEXT');operation=null;return setError(cause,'WRITE_FAILED');}
    }
    function saveRecords(kind,memberId,next,ctx){
      if(!['regions','landmarks'].includes(kind)||memberId==='self'||!Object.hasOwn(state.document[kind]||{},memberId))return Promise.resolve(failure('INVALID_DOCUMENT','请选择已创建的家庭成员。'));
      const doc=copy(state.document);doc[kind][memberId]=next;return saveDocument(doc,ctx);
    }
    function addMember(name,color,ctx){
      if(state.guest)return Promise.resolve(failure('AUTH_REQUIRED'));
      const doc=copy(state.document);
      if(doc.members.length>=4)return Promise.resolve(failure('INVALID_DOCUMENT','当前账号已达到 4 位成员上限。'));
      let id;try{id=(options.uuid||(()=>root.crypto.randomUUID()))();}catch(_){return Promise.resolve(failure('INVALID_DOCUMENT','暂时无法生成成员编号，请刷新页面。'));}
      doc.members.push({id,name:String(name||'').trim(),color});doc.regions[id]={};doc.landmarks[id]={};
      return saveDocument(doc,ctx).then(result=>result.ok?{...result,memberId:id}:result);
    }
    function updateMember(id,changes,ctx){
      const doc=copy(state.document),member=doc.members.find(m=>m.id===id);
      if(!member)return Promise.resolve(failure('INVALID_DOCUMENT','找不到这位家庭成员。'));
      if(!changes||Object.keys(changes).some(key=>!['name','color'].includes(key)))return Promise.resolve(failure('INVALID_DOCUMENT'));
      if(Object.hasOwn(changes,'name'))member.name=String(changes.name||'').trim();
      if(Object.hasOwn(changes,'color'))member.color=changes.color;
      return saveDocument(doc,ctx);
    }
    return Object.freeze({start,refresh,getState,context,canEdit,saveDocument,saveRecords,addMember,updateMember});
  }
  root.ShanheFamily=Object.freeze({COLORS,defaultDocument,validateDocument,clone:copy});
  root.createFamilyStore=createFamilyStore;
  if(typeof module==='object'&&module.exports)module.exports={COLORS,defaultDocument,validateDocument,createFamilyStore};
})(typeof globalThis==='object'?globalThis:this);
