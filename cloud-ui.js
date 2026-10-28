(function(root){
  'use strict';
  root.createShanheCloud=function({getLocalRecords,onRecords,onAccountChange,notify,hasOpenEditor,regionMigration,cityMigration,prefectureMigration,companion}){
    const $=s=>document.querySelector(s),config=root.SHANHE_CLOUD_CONFIG||{};
    const dialog=$('#cloud-dialog'),message=$('#cloud-message'),form=$('#cloud-auth-form');
    const INTENT_KEY='shanhe-cloud-transfer-v2',LEGACY_INTENT_KEY='shanhe-cloud-transfer-v1';
    let storage;try{storage=root.localStorage;}catch(_){}
    const prefectureTargets=new Set(Object.values(prefectureMigration?.mappings||{}).filter(item=>item.verified===true).map(item=>item.targetId));
    const legacyRegionMigration=regionMigration&&prefectureMigration?{...regionMigration,mappings:Object.fromEntries(Object.entries(regionMigration.mappings).filter(([from])=>!prefectureTargets.has(from)))}:regionMigration;
    const migrate=(records,occupied={})=>legacyRegionMigration?root.ShanheRegionMigration.migrateRecords(records,legacyRegionMigration,occupied):{records};
    const migratePrefecture=(records,occupied={})=>prefectureMigration?root.ShanhePrefectureMigration.migrateRecords(records,prefectureMigration,occupied):{records};
    const migrateLegacy=(records,occupied={})=>{const base=migrate(records,occupied);return cityMigration?root.ShanheRegionMigration.migrateRecords(base.records,cityMigration,occupied):base;};
    const migrateImport=(records,occupied={})=>migratePrefecture(migrateLegacy(records,occupied).records,occupied);
    // Current cloud archives and v5 drafts never run another level conversion.
    const guest=root.createGuestArchiveStore({storage,migrateLegacyRecords:migrateLegacy,migratePrefectureRecords:migratePrefecture});
    let provider,store,user=null,mode='login',authBusy=false,sessionKnown=false,signupSubmitted=false;
    let authSerial=0,sessionGeneration=0,dialogGeneration=0,recoveryUserId=null,sessionLoad=Promise.resolve();
    let transferTask=null,transferAttempt=null,transferMessage='',transferError=false;
    const readyConfig=typeof config.url==='string'&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.url)&&typeof config.publishableKey==='string'&&config.publishableKey.startsWith('sb_publishable_');
    const state=()=>user&&store?store.getState():guest.getState();
    const say=(text,error=false)=>{message.textContent=text;message.dataset.error=String(error);};
    const normalizeEmail=email=>String(email||'').trim().toLowerCase();
    const count=records=>Object.values(records).filter(r=>r?.visited===true).length;
    const localCount=()=>count(getLocalRecords());
    const sameSession=(generation,id)=>generation===sessionGeneration&&id===(user?.id||null);
    const stale=()=>({ok:false,code:'STALE_REQUEST',message:'当前存档已变化，请重新打开地区详情。'});
    function publish(){onRecords(state().records);paint();}
    function readIntent(){
      try{
        let raw=storage?.getItem(INTENT_KEY),legacy=false;
        if(raw==null){raw=storage?.getItem(LEGACY_INTENT_KEY);legacy=true;}
        if(!raw)return null;
        const value=JSON.parse(raw);
        if(value?.version!==(legacy?1:2)||typeof value.id!=='string'||typeof value.email!=='string'||!value.email||!Number.isSafeInteger(value.snapshot?.revision)||value.snapshot.revision<0)return null;
        const records=prepareLocalArchiveImport(value.snapshot.records,{}).records;
        return {...value,version:2,legacy,email:normalizeEmail(value.email),snapshot:{revision:value.snapshot.revision,records:legacy?migratePrefecture(records).records:records}};
      }catch(_){return null;}
    }
    const intentLock=action=>root.navigator?.locks?.request?root.navigator.locks.request('shanhe-cloud-transfer-intent-v1',action):Promise.resolve().then(action);
    async function rememberIntent(email,isCurrent=()=>true){
      return intentLock(async()=>{
        if(!isCurrent())throw {code:'STALE_REQUEST'};
        await guest.refresh();
        if(!isCurrent())throw {code:'STALE_REQUEST'};
        const snapshot=guest.getState();
        if(!snapshot.ready)throw {code:'LOCAL_INTENT_FAILED'};
        if(!count(snapshot.records))return readIntent();
        const intent={version:2,id:root.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,email:normalizeEmail(email),snapshot:{records:snapshot.records,revision:snapshot.revision}};
        try{const raw=JSON.stringify(intent);storage.setItem(INTENT_KEY,raw);if(storage.getItem(INTENT_KEY)!==raw)throw new Error();}
        catch(_){throw {code:'LOCAL_INTENT_FAILED'};}
        transferAttempt=null;transferMessage='';transferError=false;return intent;
      });
    }
    function paint(){
      const s=state(),signed=!!user,temporary=guest.getState(),intent=readIntent();
      const pending=count(temporary.records),matches=intent&&intent.email===normalizeEmail(user?.email);
      const labels={loading:'正在读取云端足迹',ready:'云端存档已读取',saving:'正在保存到云端…',saved:'已保存到云端',conflict:'云端有更新，暂未保存',error:signed?'云端连接需要重试':'本机临时存档需要重试'};
      $('#cloud-banner').dataset.status=s.status;
      $('#cloud-heading').textContent=signed?(labels[s.status]||'云端存档'):signupSubmitted?'注册提交成功，请验证邮箱':'先去插旗，慢慢收藏山河';
      $('#cloud-description').textContent=s.error?.message||(signed?(transferError?transferMessage:'同一邮箱登录，即可在手机和电脑继续记录。'):signupSubmitted?'请到邮箱打开验证链接，再登录。临时足迹仍保留在此浏览器；若已注册，可直接登录。':'足迹临时保存在此浏览器。想换设备继续时，再保存到云端。');
      $('#cloud-account-btn').textContent=signed?'我的存档':'保存到云端';
      $('#cloud-banner-action').textContent=signed?'管理存档':'保存到云端';
      $('#cloud-signed-in').hidden=!signed||mode==='recover';
      $('#cloud-auth-area').hidden=signed&&mode!=='recover';
      $('#cloud-account-email').textContent=user?.email||'已登录';
      $('#cloud-import-count').textContent=localCount()?`本机有 ${localCount()} 条旧版本足迹。大陆县区记录会归到所属地市；同城其他日期和笔记继续保留。`:'本机没有待导入的旧版本足迹。';
      $('#cloud-import').disabled=!signed||s.busy||!!transferTask||!s.ready||!localCount();
      $('#cloud-refresh').disabled=s.busy||!!transferTask;
      $('#cloud-logout').disabled=s.busy||authBusy||!!transferTask;
      $('#cloud-submit').disabled=authBusy||!provider;
      $('#cloud-status-inline').textContent=signed?(s.error?.message||labels[s.status]||'云端存档'):'';
      $('#cloud-transfer-area').hidden=!signed||(!pending&&!matches&&!transferMessage);
      $('#cloud-transfer-status').textContent=transferMessage||(pending?`此浏览器还有 ${pending} 条临时足迹。${intent&&!matches?'它们尚未转存到当前账号。':'可以一起保存到云端。'}`:'临时足迹已转存。');
      $('#cloud-transfer-status').dataset.error=String(transferError);
      $('#cloud-transfer-retry').textContent=transferTask?'正在转存临时足迹…':matches?'重试转存临时足迹':'将临时足迹存入当前账号';
      $('#cloud-transfer-retry').hidden=!pending&&!matches;
      $('#cloud-transfer-retry').disabled=!!transferTask||s.busy||authBusy||!signed;
      const note=$('#archive-storage-note');if(note)note.textContent=signed?'足迹按账号保存在云端':'临时足迹保存在此浏览器';
    }
    function clearPasswords(){
      $('#cloud-password').value='';$('#cloud-password-confirm').value='';
      $('#cloud-password-confirm').setCustomValidity('');$('#cloud-password-confirm').removeAttribute('aria-invalid');
    }
    function setMode(next){
      mode=next;
      $('#cloud-login-tab').setAttribute('aria-pressed',String(next==='login'));
      $('#cloud-signup-tab').setAttribute('aria-pressed',String(next==='signup'));
      $('#cloud-tabs').hidden=next==='recover';
      $('#cloud-email-field').hidden=next==='recover';$('#cloud-email').required=next!=='recover';$('#cloud-email').disabled=next==='recover';
      $('#cloud-password-field').hidden=next==='reset';$('#cloud-password').required=next!=='reset';$('#cloud-password').disabled=next==='reset';
      $('#cloud-password').minLength=next==='login'?1:8;
      $('#cloud-password').autocomplete=next==='login'?'current-password':'new-password';
      const confirm=next==='signup'||next==='recover';
      $('#cloud-confirm-field').hidden=!confirm;$('#cloud-password-confirm').required=confirm;$('#cloud-password-confirm').disabled=!confirm;
      $('#cloud-title').textContent=next==='signup'?'把这一路，保存到云端':next==='reset'?'找回你的云端存档':next==='recover'?'设置新密码':'继续收藏你的山河';
      $('#cloud-submit').textContent=next==='signup'?'注册并保存到云端':next==='reset'?'发送密码重置邮件':next==='recover'?'保存新密码':'登录并保存到云端';
      $('#cloud-forgot').hidden=next!=='login';$('#cloud-back-login').hidden=!['reset','recover'].includes(next);
      clearPasswords();say('');paint();
    }
    function open(){if(!user&&mode!=='recover')setMode('login');paint();if(!provider)say('云端服务暂时无法连接。你仍可在地图记录，足迹会临时保存在此浏览器。',true);if(!dialog.open){dialogGeneration++;dialog.showModal();}}
    $('#cloud-account-btn').onclick=open;$('#cloud-banner-action').onclick=open;
    $('#cloud-close').onclick=()=>dialog.close();
    dialog.addEventListener('close',()=>{dialogGeneration++;clearPasswords();if(mode!=='recover')setMode('login');});
    $('#cloud-login-tab').onclick=()=>{if(!authBusy)setMode('login');};
    $('#cloud-signup-tab').onclick=()=>{if(!authBusy)setMode('signup');};
    $('#cloud-forgot').onclick=()=>{if(!authBusy)setMode('reset');};
    $('#cloud-back-login').onclick=()=>{if(!authBusy)setMode('login');};
    for(const id of ['#cloud-password','#cloud-password-confirm'])$(id).addEventListener('input',()=>{$('#cloud-password-confirm').setCustomValidity('');$('#cloud-password-confirm').removeAttribute('aria-invalid');});
    function authError(error){
      const code=String(error?.code||'').toLowerCase();
      if(code==='local_intent_failed')return '无法保留临时足迹的转存请求，请检查浏览器存储权限后重试。原足迹仍保留。';
      if(['invalid_credentials','email_not_confirmed'].includes(code))return code==='email_not_confirmed'?'请先打开注册邮箱中的验证链接，再登录。临时足迹仍保留在此浏览器。':'邮箱或密码不正确，请检查后重试。';
      if(/rate|over_email/.test(code))return '请求过于频繁，请稍后再试。';
      if(/weak_password/.test(code))return '请使用至少 8 位的更强密码。';
      if(/email_address_not_authorized|email_provider_disabled/.test(code))return '邮件服务暂未配置完成，请联系网站管理员。';
      return '暂时无法完成，请检查网络后重试。如果验证邮件未到达，请查看垃圾邮件箱。';
    }
    async function finishIntent(intent,generation,id){
      return intentLock(async()=>{
        const current=()=>sameSession(generation,id)&&readIntent()?.id===intent.id;
        if(!current())return stale();
        const cleared=await guest.clearIfUnchanged(intent.snapshot,{shouldClear:current});
        if(!current())return stale();
        if(cleared.ok||cleared.code==='CONFLICT'){
          // The tombstone prevents the untouched v1 backup from reactivating.
          try{storage.setItem(INTENT_KEY,'null');if(storage.getItem(INTENT_KEY)!=='null')throw Error();}catch(_){return {ok:false,message:'云端已保存，但本机转存状态未能清理。临时足迹仍保留，可重试。'};}
        }
        await guest.refresh();return cleared;
      });
    }
    async function transferPending(){
      const intent=readIntent(),s=state(),generation=sessionGeneration,id=user?.id;
      if(!id||!intent||intent.email!==normalizeEmail(user.email)||mode==='recover')return;
      if(intent.legacy){
        try{
          const upgraded=await intentLock(()=>{
            if(!sameSession(generation,id)||readIntent()?.id!==intent.id)return false;
            const raw=JSON.stringify({...intent,legacy:undefined});storage.setItem(INTENT_KEY,raw);
            if(storage.getItem(INTENT_KEY)!==raw)throw Error();return true;
          });
          if(!upgraded||!sameSession(generation,id))return;
        }catch(_){transferMessage='无法保留新版转存请求，旧草稿仍完整保留，请检查浏览器存储权限后重试。';transferError=true;paint();return;}
      }
      const attempt=`${generation}:${intent.id}`;
      if(transferTask?.attempt===attempt)return transferTask.promise;
      if(!s.ready||s.busy)return;
      if(transferAttempt===attempt)return;
      transferAttempt=attempt;
      const task={attempt,promise:null};transferTask=task;
      task.promise=(async()=>{
        transferMessage='正在把临时足迹保存到云端…';transferError=false;paint();
        try{
          const merged=prepareLocalArchiveImport(intent.snapshot.records,s.records);
          const result=merged.added?await store.save(merged.records,{expectedRevision:s.revision}):{ok:true};
          if(!sameSession(generation,id)||readIntent()?.id!==intent.id)return;
          if(!result.ok){transferMessage=`${result.message||'转存未成功。'} 临时足迹仍保留，请重试。`;transferError=true;return;}
          if(merged.conflicts?.length){transferMessage=`可合并的足迹已存入云端。${merged.conflicts.length} 条同地区记录与云端内容不同，临时草稿仍完整保留，请整理后再转存。`;transferError=true;return;}
          const cleanup=await finishIntent(intent,generation,id);
          if(!sameSession(generation,id))return;
          if(cleanup.code==='STALE_REQUEST')return;
          transferMessage=cleanup.ok?'临时足迹已存入云端。':
            cleanup.code==='CONFLICT'?'临时足迹已存入云端；本机还有新的编辑，已为你保留，可继续转存。':cleanup.message||'云端已保存，本机草稿仍保留。请重试清理。';
          transferError=!cleanup.ok&&cleanup.code!=='CONFLICT';
          if(cleanup.ok)notify?.('临时足迹已保存到云端');
        }catch(_){if(sameSession(generation,id)){transferMessage='转存未完成，临时足迹仍保留。请检查网络后重试。';transferError=true;}}
        finally{if(transferTask===task){transferTask=null;paint();}}
      })();
      return task.promise;
    }
    async function applySession(next,event){
      const changed=(next?.id||null)!==(user?.id||null);
      sessionKnown=true;user=next||null;
      if(changed){
        signupSubmitted=false;
        sessionGeneration++;recoveryUserId=null;transferTask=null;transferAttempt=null;transferMessage='';transferError=false;
        say('');
        if(mode==='recover'){authSerial++;authBusy=false;setMode('login');}
        onAccountChange();
        sessionLoad=Promise.resolve(store.setUser(user?.id||null));
        if(!user)await guest.refresh();
      }
      const generation=sessionGeneration,id=user?.id||null;
      await sessionLoad;
      if(!sameSession(generation,id))return;
      publish();
      if(event==='PASSWORD_RECOVERY'&&user){recoveryUserId=user.id;setMode('recover');if(!dialog.open){dialogGeneration++;dialog.showModal();}return;}
      await transferPending();
    }
    form.onsubmit=async event=>{
      event.preventDefault();if(authBusy||!provider)return;
      const action=mode,email=normalizeEmail($('#cloud-email').value),password=$('#cloud-password').value;
      if(action==='signup'||action==='recover'){
        const confirmation=$('#cloud-password-confirm');
        if(!confirmation.value||confirmation.value!==password){confirmation.setCustomValidity('请再次输入相同的密码。');confirmation.setAttribute('aria-invalid','true');say('两次密码需要一致，请重新确认。',true);confirmation.reportValidity();return;}
        confirmation.setCustomValidity('');confirmation.removeAttribute('aria-invalid');
      }
      if(!form.reportValidity())return;
      if(action==='signup')signupSubmitted=false;
      authBusy=true;const serial=++authSerial,recoveryGeneration=sessionGeneration,recoveringAccount=recoveryUserId,submittedDialogGeneration=dialogGeneration;
      const closeSignup=notice=>{if(dialog.open&&submittedDialogGeneration===dialogGeneration){dialog.close();notify?.(notice);}};
      say('正在处理…');paint();const redirect=new URL('./',location.href).href;
      try{
        if(action==='reset'){
          await provider.sendPasswordReset(email,redirect);if(serial===authSerial)say('如果这个邮箱已注册，你会收到密码重置邮件。请在此浏览器打开邮件链接。');
        }else if(action==='recover'){
          const recoverySession=await provider.getSession();
          if(serial!==authSerial||recoveryGeneration!==sessionGeneration)return;
          if(!recoveringAccount||recoverySession.user?.id!==recoveringAccount||user?.id!==recoveringAccount){setMode('login');say('登录账号已变化，请重新打开密码重置邮件。',true);return;}
          await provider.updatePassword(password,recoveringAccount);
          if(serial!==authSerial||recoveryGeneration!==sessionGeneration)return;
          recoveryUserId=null;setMode('login');say('密码已更新，可以继续使用云端存档。');
        }else{
          await companion?.rememberIntent(email);
          if(serial!==authSerial||sessionGeneration!==recoveryGeneration)return;
          await rememberIntent(email,()=>serial===authSerial&&sessionGeneration===recoveryGeneration);
          if(serial!==authSerial||sessionGeneration!==recoveryGeneration)return;
          const result=await(action==='signup'?provider.signUp(email,password,redirect):provider.signIn(email,password));
          if(serial!==authSerial)return;
          if(result.user){
            if(sessionGeneration!==recoveryGeneration&&user?.id!==result.user.id)return;
            await applySession(result.user,'SIGNED_IN');
            if(serial===authSerial&&user?.id===result.user.id){
              if(action!=='signup'||submittedDialogGeneration===dialogGeneration)say(transferMessage||(state().ready?'已登录，可以继续记录云端足迹。':'已登录，读取云端存档后可重试转存。'),transferError);
              if(action==='signup'){
                closeSignup('注册成功，已登录。'+(transferError?'临时足迹仍保留，请在“我的存档”中重试转存。':!state().ready?'云端存档尚未读取，请稍后重试。':''));
              }
            }
          }else if(sessionGeneration===recoveryGeneration){
            if(action==='signup'){
              signupSubmitted=true;
              closeSignup('注册提交成功，请到邮箱完成验证。临时足迹仍保留。');
            }else say('请到邮箱完成验证，并在此浏览器打开验证链接。临时足迹会保留，验证后转存到这个邮箱的账号；已有账号可切换到登录。');
          }
        }
      }catch(error){if(serial===authSerial&&recoveryGeneration===sessionGeneration&&(action!=='signup'||submittedDialogGeneration===dialogGeneration))say(authError(error),true);}
      finally{if(serial===authSerial){authBusy=false;clearPasswords();paint();}}
    };
    $('#cloud-transfer-retry').onclick=async()=>{
      if(!user||authBusy||state().busy||transferTask)return;
      const generation=sessionGeneration,id=user.id;
      try{
        const intent=readIntent();if(!intent||intent.email!==normalizeEmail(user.email))await rememberIntent(user.email,()=>sameSession(generation,id));
        if(!sameSession(generation,id))return;
        const result=await store.refresh();if(!sameSession(generation,id))return;
        if(!result.ok){say(result.message,true);return;}
        transferAttempt=null;await transferPending();
      }catch(error){if(sameSession(generation,id))say(authError(error),true);}
      finally{paint();}
    };
    $('#cloud-refresh').onclick=async()=>{
      if(!user||!store||transferTask)return;const generation=sessionGeneration,id=user.id;
      say('正在读取最新存档…');const result=await store.refresh();if(!sameSession(generation,id))return;
      say(result.ok?'已读取最新云端足迹。':result.message,!result.ok);
    };
    $('#cloud-import').onclick=async()=>{
      const s=state(),generation=sessionGeneration,id=user?.id;if(!id||!s.ready||s.busy||transferTask)return;
      try{
        const merged=prepareLocalArchiveImport(migrateImport(getLocalRecords(),s.records).records,s.records);
        if(!merged.added){say('这些地区已经在云端，无需重复导入。原本机备份仍保留。');return;}
        const result=await store.save(merged.records,{expectedRevision:s.revision});if(!sameSession(generation,id))return;
        say(result.ok?`已存入云端 ${merged.added} 条足迹，保留 ${merged.skipped} 条已有云端记录。本机备份未改动。`:result.message,!result.ok);
      }catch(_){if(sameSession(generation,id))say('本机旧足迹格式有误，请先导出备份。',true);}
    };
    $('#cloud-logout').onclick=async()=>{
      if(!provider||state().busy||transferTask||authBusy)return;
      authBusy=true;paint();
      try{await provider.signOut();await applySession(null,'SIGNED_OUT');setMode('login');say('已退出，云端足迹仍安全保存。现在新增的足迹会临时保存在此浏览器。');}
      catch(_){say('退出未成功，请检查网络后重试。',true);}
      finally{authBusy=false;paint();}
    };
    function changed(){publish();}
    async function start(){
      setMode('login');publish();
      if(!readyConfig||!root.supabase?.createClient)return;
      try{
        const client=root.supabase.createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce',storageKey:'shanhe-cloud-auth-v1'}});
        provider=createSupabaseArchiveProvider(client,{url:config.url,publishableKey:config.publishableKey});
        if(companion)Promise.resolve(companion.start(client)).catch(()=>notify?.('景点云端暂时未能连接，请在名胜打卡中重试。'));
        store=createCloudArchiveStore({transport:provider.transport,onChange:changed});
        provider.onAuthStateChange((event,session)=>{setTimeout(()=>{applySession(session.user,event).catch(()=>{say('读取云端存档失败，请重试。',true);paint();});},0);});
        const initial=await provider.getSession();if(!sessionKnown)await applySession(initial.user,'INITIAL_SESSION');paint();
      }catch(_){say('云端连接失败。仍可先记录临时足迹，稍后再试。',true);paint();}
    }
    root.addEventListener('focus',async()=>{
      if(hasOpenEditor()||dialog.open)return;
      if(user&&store&&state().ready&&!state().busy&&!transferTask)await store.refresh();
      else if(!user){await guest.refresh();if(!user)publish();}
    });
    root.addEventListener('storage',async event=>{
      if(event.key===root.SHANHE_GUEST_STORAGE_KEY||event.key===root.SHANHE_PREVIOUS_GUEST_STORAGE_KEY||event.key===root.SHANHE_LEGACY_GUEST_STORAGE_KEY||event.key===root.SHANHE_OLDER_GUEST_STORAGE_KEY||event.key===root.SHANHE_OLDEST_GUEST_STORAGE_KEY||event.key===null){await guest.refresh();if(!user)publish();else paint();}
      if(event.key===INTENT_KEY||event.key===LEGACY_INTENT_KEY){transferAttempt=null;paint();if(user&&!hasOpenEditor())await transferPending();}
      if(event.key==='shanhe-atlas-v1')paint();
    });
    return {
      start,open,getState:state,canEdit:()=>state().ready&&!state().busy&&!transferTask,
      context:()=>({userId:state().userId,revision:state().revision,kind:user?'cloud':'guest',sessionGeneration}),
      async save(next,context){
        const generation=sessionGeneration,id=user?.id||null,kind=user?'cloud':'guest';
        if(!context||context.userId!==id||context.kind!==kind||context.sessionGeneration!==generation)return stale();
        const result=await(user?store:guest).save(next,{expectedRevision:context.revision});
        if(!sameSession(generation,id))return stale();
        if(!user)publish();return user?result:{...result,guest:true};
      },
      async refresh(){const generation=sessionGeneration,id=user?.id||null;const result=await(user?store:guest).refresh();if(!sameSession(generation,id))return stale();publish();return result;}
    };
  };
})(window);
