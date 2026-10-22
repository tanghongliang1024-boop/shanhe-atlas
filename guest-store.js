(function (root) {
  'use strict';

  const KEY = 'shanhe-atlas-guest-v4';
  const PREVIOUS_KEY = 'shanhe-atlas-guest-v3';
  const LEGACY_KEY = 'shanhe-atlas-guest-v2';
  const OLDER_KEY = 'shanhe-atlas-guest-v1';
  const LOCK = 'shanhe-guest-archive-v1';
  const merge = root.prepareLocalArchiveImport || (typeof require === 'function' ? require('./cloud-store.js').prepareLocalArchiveImport : null);
  const copy = records => merge({}, records).records;
  const fail = (code, message) => ({ ok: false, code, message });
  const revisionValid = value => Number.isSafeInteger(value) && value >= 0;
  const sameRecords = (left, right) => {
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every(id => {
      const a = left[id], b = right[id];
      return b && a.visited === b.visited && a.date === b.date && a.note === b.note && a.updatedAt === b.updatedAt;
    });
  };

  function createGuestArchiveStore(options = {}) {
    let storage, storageError = false;
    try { storage = options.storage === undefined ? root.localStorage : options.storage; }
    catch (_) { storageError = true; }
    const locks = options.locks === undefined ? root.navigator?.locks : options.locks;
    let state = { userId: null, guest: true, records: {}, revision: 0, ready: true, busy: false, status: 'guest', error: null };

    function getState() { return { ...state, records: copy(state.records), error: state.error ? { ...state.error } : null }; }
    function notify() {
      try { options.onChange?.(getState()); } catch (_) { /* A view cannot cancel a successful storage write. */ }
    }
    function error(result, disable = false) {
      state = { ...state, ready: disable ? false : state.ready, status: 'error', error: { code: result.code, message: result.message } };
      notify();
      return result;
    }
    function read() {
      if (storageError || !storage || typeof storage.getItem !== 'function') throw new Error('Storage unavailable');
      let raw = storage.getItem(KEY), version = 4;
      if (raw === null) { raw = storage.getItem(PREVIOUS_KEY); version = 3; }
      if (raw === null) { raw = storage.getItem(LEGACY_KEY); version = 2; }
      if (raw === null) { raw = storage.getItem(OLDER_KEY); version = 1; }
      if (raw === null) return { records: {}, revision: 0 };
      const value = JSON.parse(raw);
      if (!value || value.version !== version || !revisionValid(value.revision)) throw new Error('Invalid guest archive');
      const records = copy(value.records);
      // Capital conversion belongs only to the first read of a pre-city archive.
      // Current archives retain unresolved old regions even after a city is removed.
      const migrate = version === 4 ? options.migrateRecords : (options.migrateLegacyRecords || options.migrateRecords);
      return { records: migrate ? copy(migrate(records).records) : records, revision: value.revision };
    }
    function load() {
      try {
        const snapshot = read();
        state = { ...state, ...snapshot, ready: true, status: 'guest', error: null };
        notify();
        return { ok: true, guest: true };
      } catch (_) {
        return error(fail('READ_FAILED', '暂时无法读取本机临时足迹，请检查浏览器存储权限后重试。原数据未被覆盖。'), true);
      }
    }
    async function locked(action) {
      try {
        // Every tab uses this lock for both save and post-upload cleanup. Older
        // browsers without Web Locks still perform a synchronous revision check.
        return locks?.request ? await locks.request(LOCK, action) : action();
      } catch (_) {
        return error(fail('WRITE_FAILED', '临时保存失败，当前输入仍保留。请检查浏览器存储空间和权限后重试。'));
      }
    }
    function write(records, revision) {
      if (!revisionValid(revision) || revision === Number.MAX_SAFE_INTEGER) throw new Error('Revision exhausted');
      // Original v1/v2/v3 keys remain byte-for-byte backups. Cached pages and
      // older Android versions cannot overwrite this city-record archive.
      const next = { version: 4, revision: revision + 1, records };
      const serialized = JSON.stringify(next);
      storage.setItem(KEY, serialized);
      if (storage.getItem(KEY) !== serialized) throw new Error('Storage did not retain the archive');
      state = { ...state, records: copy(records), revision: next.revision, ready: true, status: 'guest-saved', error: null };
      notify();
      return { ok: true, guest: true };
    }
    async function save(next, context) {
      if (!context || !revisionValid(context.expectedRevision)) return error(fail('INVALID_REVISION', '请重新打开地区详情后保存。'));
      const expectedRevision = context.expectedRevision;
      let records;
      try { records = copy(next); }
      catch (_) { return error(fail('INVALID_RECORDS', '请检查地区足迹、首次到访日期和不超过 600 字的旅行记忆。')); }
      return locked(() => {
        let latest;
        try { latest = read(); }
        catch (_) { return error(fail('READ_FAILED', '无法读取本机临时足迹，本次输入尚未保存，请检查存储权限。'), true); }
        if (latest.revision !== expectedRevision) return error(fail('CONFLICT', '临时足迹已在其他页面更新。请保留输入，读取最新记录后重新编辑。'));
        return write(records, latest.revision);
      });
    }
    async function clearIfUnchanged(snapshot, options = {}) {
      if (!snapshot || !revisionValid(snapshot.revision)) return fail('INVALID_REVISION', '临时足迹版本无效，原草稿仍保留。');
      const expectedRevision = snapshot.revision;
      const shouldClear = options.shouldClear;
      let uploaded;
      try { uploaded = copy(snapshot.records); }
      catch (_) { return fail('INVALID_RECORDS', '临时足迹格式无效，原草稿仍保留。'); }
      return locked(() => {
        if (shouldClear && !shouldClear()) return fail('STALE_REQUEST', '账号或转存请求已变化，临时草稿仍保留。');
        const latest = read();
        if (latest.revision !== expectedRevision || !sameRecords(latest.records, uploaded)) {
          return fail('CONFLICT', '临时足迹在转存期间有新变化，当前草稿仍保留，可再次保存到云端。');
        }
        // Keep a monotonically increasing revision to invalidate old open forms.
        const result = write({}, latest.revision);
        return { ...result, cleared: true };
      });
    }
    load();
    return Object.freeze({ getState, save, refresh: async () => load(), clearIfUnchanged });
  }

  root.SHANHE_GUEST_STORAGE_KEY = KEY;
  root.SHANHE_PREVIOUS_GUEST_STORAGE_KEY = PREVIOUS_KEY;
  root.SHANHE_LEGACY_GUEST_STORAGE_KEY = LEGACY_KEY;
  root.SHANHE_OLDER_GUEST_STORAGE_KEY = OLDER_KEY;
  root.createGuestArchiveStore = createGuestArchiveStore;
  if (typeof module !== 'undefined' && module.exports) module.exports = { createGuestArchiveStore, SHANHE_GUEST_STORAGE_KEY: KEY, SHANHE_PREVIOUS_GUEST_STORAGE_KEY: PREVIOUS_KEY, SHANHE_LEGACY_GUEST_STORAGE_KEY: LEGACY_KEY, SHANHE_OLDER_GUEST_STORAGE_KEY: OLDER_KEY };
})(typeof globalThis !== 'undefined' ? globalThis : this);
