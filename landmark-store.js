(function (root) {
  'use strict';
  const KEY = 'shanhe-landmark-guest-v1';
  const INTENT_KEY = 'shanhe-landmark-transfer-v1';
  const LOCK = 'shanhe-landmark-guest-v1';
  const ID = /^poi:[A-Z]{3}:[a-z0-9][a-z0-9-]{0,63}$/;
  const FIELDS = ['status', 'date', 'note', 'updatedAt'];
  function problem(code, message) { return Object.assign(new Error(message), { code }); }
  function fail(code, message, guest = false) { return { ok: false, guest, code, message }; }
  function validRevision(value) { return Number.isSafeInteger(value) && value >= 0 && value < Number.MAX_SAFE_INTEGER; }
  function properties(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw problem('INVALID_RECORDS', '景点记录格式不正确。');
    const props = Object.getOwnPropertyDescriptors(value);
    if (Reflect.ownKeys(props).some(key => typeof key !== 'string' || !props[key].enumerable || !Object.hasOwn(props[key], 'value'))) throw problem('INVALID_RECORDS', '景点记录包含不支持的字段。');
    return props;
  }
  function validDate(value) {
    if (typeof value !== 'string') return false;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return false;
    const [year, month, day] = match.slice(1).map(Number);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  }
  function validTimestamp(value) {
    if (typeof value !== 'string') return false;
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
    if (!match || !validDate(match[1]) || +match[2] > 23 || +match[3] > 59 || +match[4] > 59) return false;
    if (match[5] !== 'Z') {
      const hours = +match[5].slice(1, 3), minutes = +match[5].slice(4);
      if (hours > 14 || minutes > 59 || (hours === 14 && minutes !== 0)) return false;
    }
    return Number.isFinite(Date.parse(value));
  }
  function validateRecords(input) {
    const descriptors = properties(input), result = {}, keys = Object.keys(descriptors);
    if (keys.length > 10000) throw problem('INVALID_RECORDS', '景点记录不能超过 10000 条。');
    for (const id of keys) {
      if (!ID.test(id)) throw problem('INVALID_RECORDS', '景点编号不正确。');
      const p = properties(descriptors[id].value);
      if (Object.keys(p).length !== 4 || FIELDS.some(field => !Object.hasOwn(p, field)) || Object.keys(p).some(field => !FIELDS.includes(field))) throw problem('INVALID_RECORDS', '景点记录字段不完整。');
      const status = p.status.value, date = p.date.value, note = p.note.value, updatedAt = p.updatedAt.value;
      if (!['visited', 'wish'].includes(status) || (date !== '' && !validDate(date)) || typeof note !== 'string' || note.length > 600 || !validTimestamp(updatedAt)) throw problem('INVALID_RECORDS', '请检查景点状态、日期和不超过 600 字的旅行记忆。');
      result[id] = { status, date, note, updatedAt };
    }
    if (new TextEncoder().encode(JSON.stringify(result)).length > 16777216) throw problem('INVALID_RECORDS', '景点记录超过存档容量。');
    return result;
  }
  const copy = records => Object.fromEntries(Object.entries(records).map(([id, record]) => [id, { ...record }]));
  const same = (a, b) => !!a && !!b && FIELDS.every(field => a[field] === b[field]);
  const normalizedEmail = email => typeof email === 'string' ? email.trim().toLowerCase() : '';

  function createLandmarkStore(options = {}) {
    const storage = options.storage || root.localStorage;
    const locks = options.locks === undefined ? root.navigator?.locks : options.locks;
    const providerFactory = options.providerFactory || root.createSupabaseArchiveProvider;
    const cloudFactory = options.cloudFactory || root.createCloudArchiveStore;
    let provider, cloud, user = null, epoch = 0, authSequence = 0, started = false, loadingAccount = false, transferOperation = null;
    let transferMessage = '', guestError = null, guestData = { records: {}, revision: 0 };

    function readGuest() {
      const raw = storage.getItem(KEY);
      if (raw === null) return { records: {}, revision: 0 };
      const data = JSON.parse(raw);
      if (data?.version !== 1 || !validRevision(data.revision)) throw problem('LOCAL_STORAGE_FAILED', '临时景点记录无法读取，原始数据已保留。');
      return { records: validateRecords(data.records), revision: data.revision };
    }
    function loadGuest() {
      try { guestData = readGuest(); guestError = null; }
      catch (_) { guestError = { code: 'LOCAL_STORAGE_FAILED', message: '临时景点记录无法读取，原始数据已保留。' }; }
    }
    function getState() {
      const signed = user ? cloud?.getState() : null;
      return {
        records: copy(signed?.records || guestData.records), guest: !user, userId: user?.id || null,
        revision: signed ? signed.revision : guestData.revision,
        ready: !loadingAccount && (signed ? signed.ready : !guestError),
        busy: loadingAccount || !!transferOperation || !!signed?.busy,
        error: signed ? signed.error : (guestError ? { ...guestError } : null),
        transferMessage, guestCount: Object.keys(guestData.records).length
      };
    }
    function notify() { try { options.onChange?.(getState()); } catch (_) { /* Observers cannot interrupt persistence. */ } }
    function context() { const s = getState(); return Object.freeze({ guest: s.guest, userId: s.userId, revision: s.revision, epoch }); }
    function matches(ctx, checkRevision = true) {
      const now = context();
      return !!ctx && ctx.epoch === now.epoch && ctx.guest === now.guest && ctx.userId === now.userId && (!checkRevision || ctx.revision === now.revision);
    }
    function canEdit() { const s = getState(); return s.ready && !s.busy; }
    const locked = fn => locks?.request ? locks.request(LOCK, { mode: 'exclusive' }, fn) : Promise.resolve().then(fn);
    function writeGuest(records, revision) {
      if (!validRevision(revision + 1)) throw problem('LOCAL_STORAGE_FAILED', '临时存档版本已达到上限。');
      const next = JSON.stringify({ version: 1, records: validateRecords(records), revision: revision + 1 });
      storage.setItem(KEY, next);
      if (storage.getItem(KEY) !== next) throw problem('CONFLICT', '临时景点记录已在其他窗口更新，请重新打开编辑。');
      guestData = { records: copy(records), revision: revision + 1 }; guestError = null;
    }
    async function save(records, ctx) {
      const guest = !user;
      if (!matches(ctx)) return fail('STALE_CONTEXT', '账号或景点存档已变化，请保留输入并重新打开编辑。', guest);
      if (!canEdit()) return fail('NOT_READY', '景点存档尚未就绪，请稍后重试。', guest);
      let clean;
      try { clean = validateRecords(records); } catch (error) { return fail('INVALID_RECORDS', error.message, guest); }
      if (user) {
        const result = await cloud.save(clean, { expectedRevision: ctx.revision });
        if (!matches(ctx, false)) return fail('STALE_CONTEXT', '账号已切换，本次保存结果已忽略。');
        return { ...result, guest: false };
      }
      try {
        return await locked(() => {
          if (!matches(ctx)) return fail('STALE_CONTEXT', '账号或景点存档已变化，请重新打开编辑。', true);
          const latest = readGuest();
          if (latest.revision !== ctx.revision) { guestData = latest; notify(); return fail('CONFLICT', '临时景点记录已在其他窗口更新，请重新打开编辑。', true); }
          writeGuest(clean, latest.revision); notify();
          return { ok: true, guest: true };
        });
      } catch (error) { return fail(error.code || 'LOCAL_STORAGE_FAILED', '无法保存临时景点记录，当前输入仍然保留。', true); }
    }
    function rememberIntent(email) {
      const normalized = normalizedEmail(email);
      if (!normalized || !normalized.includes('@')) throw problem('INVALID_EMAIL', '请填写正确的邮箱。');
      const snapshot = readGuest();
      guestData = snapshot;
      if (!Object.keys(snapshot.records).length) storage.removeItem(INTENT_KEY);
      else storage.setItem(INTENT_KEY, JSON.stringify({ version: 1, email: normalized, snapshot, id: Date.now() + '-' + Math.random().toString(36).slice(2) }));
      notify();
    }
    function readIntent() {
      const raw = storage.getItem(INTENT_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data?.version !== 1 || typeof data.email !== 'string' || !data.snapshot || !validRevision(data.snapshot.revision)) throw problem('INVALID_INTENT', '待上传的景点记录无法读取，临时记录已保留。');
      return { raw, email: data.email, snapshot: { revision: data.snapshot.revision, records: validateRecords(data.snapshot.records) } };
    }
    async function transfer(snapshot, intentRaw) {
      const ctx = context();
      if (!user || !canEdit()) return fail('NOT_READY', '请先登录并读取景点云端存档。');
      const operation = {}; transferOperation = operation; transferMessage = ''; notify();
      let settled = false;
      try {
        // Always obtain a current revision before merging. Conflicting IDs keep
        // the cloud value; their local draft remains available for review.
        const refreshed = await cloud.refresh();
        if (!matches(ctx, false)) return fail('STALE_CONTEXT', '账号已切换，临时景点记录仍然保留。');
        if (!refreshed.ok) return refreshed;
        const state = cloud.getState(), merged = copy(state.records), clearable = new Set();
        let added = 0, conflicts = 0;
        for (const [id, record] of Object.entries(snapshot.records)) {
          if (!Object.hasOwn(merged, id)) { merged[id] = { ...record }; added++; clearable.add(id); }
          else if (same(merged[id], record)) clearable.add(id);
          else conflicts++;
        }
        if (added) {
          const result = await cloud.save(merged, { expectedRevision: state.revision });
          if (!result.ok) return result;
        }
        if (!matches(ctx, false)) return fail('STALE_CONTEXT', '账号已切换，临时景点记录仍然保留。');
        await locked(() => {
          if (!matches(ctx, false)) return;
          const latest = readGuest(), remaining = copy(latest.records);
          // A record changed after the login intent must never be discarded.
          // Compare individual records so unrelated new drafts are preserved too.
          for (const id of clearable) if (same(latest.records[id], snapshot.records[id])) delete remaining[id];
          if (Object.keys(remaining).length !== Object.keys(latest.records).length) writeGuest(remaining, latest.revision);
          else guestData = latest;
          if (intentRaw && storage.getItem(INTENT_KEY) === intentRaw) storage.removeItem(INTENT_KEY);
        });
        settled = true;
        transferMessage = conflicts ? `景点已同步；${conflicts} 条与云端不同的临时记录已保留，未覆盖云端。` : (Object.keys(snapshot.records).length ? '临时景点记录已保存到当前账号。' : '没有待保存的临时景点记录。');
        return { ok: true, guest: false, conflicts };
      } catch (_) { return fail('TRANSFER_FAILED', '景点上传未完成，临时记录仍然保留，请重试。'); }
      finally {
        if (transferOperation === operation) transferOperation = null;
        if (matches(ctx, false)) { if (!settled) transferMessage = '景点上传未完成，临时记录仍然保留，请刷新后重试。'; notify(); }
      }
    }
    async function transferGuest() {
      if (!user || !canEdit()) return fail('NOT_READY', '请先登录并读取景点云端存档。');
      try {
        const snapshot = readGuest();
        // Persist this explicit consent so a failed upload can be retried safely.
        rememberIntent(user.email);
        const intent = readIntent();
        return transfer(snapshot, intent?.raw);
      } catch (_) { return fail('TRANSFER_FAILED', '无法读取临时景点记录，原始数据已保留。'); }
    }
    async function transferPending() {
      if (!user || !canEdit() || options.hasOpenEditor?.()) return;
      try {
        const intent = readIntent();
        if (intent && intent.email === normalizedEmail(user.email)) await transfer(intent.snapshot, intent.raw);
      } catch (_) { transferMessage = '待上传的景点记录无法读取，临时记录已保留。'; notify(); }
    }
    async function applySession(session, sequence) {
      if (sequence !== authSequence) return;
      const next = session?.user || null;
      loadingAccount = false;
      if ((next?.id || null) === (user?.id || null)) { user = next; notify(); await transferPending(); return; }
      epoch++; user = next; transferMessage = ''; transferOperation = null;
      try { options.onAccountChange?.(user?.id || null); } catch (_) { /* Storage does not depend on the editor. */ }
      loadGuest();
      const appliedEpoch = epoch;
      await cloud.setUser(user?.id || null);
      if (appliedEpoch !== epoch) return;
      notify(); await transferPending();
    }
    async function start(client) {
      if (started) return;
      started = true; loadingAccount = true; notify();
      try {
        provider = providerFactory(client, { archive: 'landmarks' });
        cloud = cloudFactory({ transport: provider.transport, validateRecords, onChange: notify });
        provider.onAuthStateChange((_event, session) => {
          const sequence = ++authSequence;
          // Supabase holds its auth lock in this callback. Invalidate editors
          // immediately, but defer all SDK reads until after the callback returns.
          if ((session?.user?.id || null) !== (user?.id || null)) { epoch++; loadingAccount = true; notify(); }
          setTimeout(() => { applySession(session, sequence).catch(() => { loadingAccount = false; notify(); }); }, 0);
        });
        const sequence = authSequence;
        const session = await provider.getSession();
        if (sequence === authSequence) await applySession(session, sequence);
      } catch (_) { loadingAccount = false; started = false; transferMessage = '景点云端连接暂时不可用，可继续保留临时记录。'; notify(); }
    }
    async function refresh() {
      if (getState().busy) return fail('BUSY', '正在处理景点存档，请稍候。', !user);
      loadGuest(); notify();
      if (!user) return guestError ? fail(guestError.code, guestError.message, true) : { ok: true, guest: true };
      const result = await cloud.refresh();
      if (result.ok) await transferPending();
      return { ...result, guest: false };
    }
    loadGuest();
    const listen = options.addEventListener || root.addEventListener?.bind(root);
    listen?.('storage', event => {
      if (event.key === KEY || event.key === null) { loadGuest(); notify(); }
    });
    return Object.freeze({ start, getState, context, save, refresh, rememberIntent, transferGuest, canEdit });
  }
  root.createLandmarkStore = createLandmarkStore;
  root.validateShanheLandmarkRecords = validateRecords;
  if (typeof module === 'object' && module.exports) module.exports = { createLandmarkStore, validateRecords, KEY, INTENT_KEY };
})(typeof globalThis === 'object' ? globalThis : this);
