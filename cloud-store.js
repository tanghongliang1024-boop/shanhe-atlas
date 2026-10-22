(function (root) {
  'use strict';

  const CITY_ID = /^(?:\d{6}|tw-(?:\d{5}|\d{8})|world:[A-Z]{3}(?::[A-Za-z0-9][A-Za-z0-9._-]{0,63})?)$/;
  const RECORD_FIELDS = new Set(['visited', 'date', 'note', 'updatedAt']);
  const MAX_RECORDS = 10000;
  const MAX_BYTES = 16777216;

  function failure(code, message) {
    return { ok: false, code, message };
  }

  function problem(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  function plainObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  // Read data properties only, so accessors and symbol keys cannot smuggle values
  // into a later serialization or mutate the archive during validation.
  function dataProperties(value) {
    if (!plainObject(value)) throw problem('INVALID_RECORDS', '足迹数据格式不正确。');
    const descriptors = Object.getOwnPropertyDescriptors(value);
    for (const key of Reflect.ownKeys(descriptors)) {
      const descriptor = descriptors[key];
      if (typeof key !== 'string' || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) {
        throw problem('INVALID_RECORDS', '足迹数据包含不支持的字段。');
      }
    }
    return descriptors;
  }

  function validDate(value) {
    if (typeof value !== 'string') return false;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return false;
    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1];
  }

  function validTimestamp(value) {
    if (typeof value !== 'string') return false;
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
    if (!match || !validDate(match[1]) || Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4]) > 59) return false;
    if (match[5] !== 'Z') {
      const hours = Number(match[5].slice(1, 3)), minutes = Number(match[5].slice(4));
      if (hours > 14 || minutes > 59 || (hours === 14 && minutes !== 0)) return false;
    }
    return Number.isFinite(Date.parse(value));
  }

  function validateRecords(input) {
    const descriptors = dataProperties(input);
    const keys = Object.keys(descriptors);
    if (keys.length > MAX_RECORDS) throw problem('INVALID_RECORDS', '足迹记录不能超过 10000 条。');
    const result = {};
    for (const id of keys) {
      if (!CITY_ID.test(id)) throw problem('INVALID_RECORDS', '足迹中包含无效的地区编号。');
      const properties = dataProperties(descriptors[id].value);
      if (Object.keys(properties).some(key => !RECORD_FIELDS.has(key))) {
        throw problem('INVALID_RECORDS', '地区足迹中包含不支持的字段。');
      }
      const visited = properties.visited?.value;
      const date = properties.date?.value;
      const note = properties.note?.value;
      if (visited !== true || (date !== '' && !validDate(date)) || typeof note !== 'string' || note.length > 600) {
        throw problem('INVALID_RECORDS', '请检查足迹状态、首次到访日期和不超过 600 字的旅行记忆。');
      }
      const record = { visited: true, date, note };
      if (Object.hasOwn(properties, 'updatedAt')) {
        const timestamp = properties.updatedAt.value;
        if (!validTimestamp(timestamp)) throw problem('INVALID_RECORDS', '足迹更新时间格式不正确。');
        record.updatedAt = timestamp;
      }
      result[id] = record;
    }
    if (new TextEncoder().encode(JSON.stringify(result)).length > MAX_BYTES) {
      throw problem('INVALID_RECORDS', '这份足迹超过存档容量，请先导出备份。');
    }
    return result;
  }

  function validRevision(value) {
    return Number.isSafeInteger(value) && value >= 0;
  }

  function validateSnapshot(snapshot, previousRevision) {
    if (!plainObject(snapshot) || !validRevision(snapshot.revision) ||
        (previousRevision !== undefined && snapshot.revision <= previousRevision)) {
      throw problem('INVALID_RESPONSE', '云端返回的存档版本无效，请刷新后重试。');
    }
    try {
      return { records: validateRecords(snapshot.records), revision: snapshot.revision };
    } catch (error) {
      throw problem('INVALID_RESPONSE', '云端返回的足迹格式无效，当前记录未被替换。');
    }
  }

  function copyRecords(records) {
    const copy = {};
    for (const [id, record] of Object.entries(records)) copy[id] = { ...record };
    return copy;
  }

  function prepareLocalArchiveImport(localRecords, cloudRecords) {
    const local = validateRecords(localRecords);
    const cloud = validateRecords(cloudRecords);
    const merged = copyRecords(cloud);
    let added = 0, skipped = 0;
    const conflicts = [];
    for (const [id, record] of Object.entries(local)) {
      if (Object.hasOwn(cloud, id)) {
        skipped++;
        if (['visited', 'date', 'note', 'updatedAt'].some(field => record[field] !== cloud[id][field])) conflicts.push(id);
      }
      else { merged[id] = { ...record }; added++; }
    }
    // The combined archive must also fit the same server-facing constraints.
    return { records: validateRecords(merged), added, skipped, conflicts };
  }

  function transportFailure(error, fallbackCode) {
    if (error?.code === 'CONFLICT' || error?.code === 'REVISION_CONFLICT' || error?.status === 409 || error?.statusCode === 409) {
      return failure('CONFLICT', '云端足迹已在其他位置更新。请保留当前输入，刷新云端存档后重新编辑。');
    }
    const code = ['AUTH_REQUIRED', 'UNAUTHORIZED', 'FORBIDDEN', 'INVALID_RESPONSE', 'CLIENT_UPDATE_REQUIRED'].includes(error?.code)
      ? error.code : fallbackCode;
    const defaults = {
      AUTH_REQUIRED: '请先登录，再保存云端足迹。',
      UNAUTHORIZED: '登录状态已失效，请重新登录。',
      FORBIDDEN: '当前账号没有访问这份存档的权限。',
      INVALID_RESPONSE: '云端返回的数据无效，当前记录未被替换。',
      CLIENT_UPDATE_REQUIRED: '请更新山河足迹后再保存，当前版本无法安全保存新版地图记录。',
      READ_FAILED: '暂时无法读取云端足迹，请检查网络后重试。',
      WRITE_FAILED: '云端保存失败，当前输入仍然保留，请重试。'
    };
    return failure(code, defaults[code]);
  }

  function createCloudArchiveStore({ transport, onChange, onStatus, migrateRecords } = {}) {
    if (!transport || typeof transport.read !== 'function' || typeof transport.write !== 'function') {
      throw new TypeError('A cloud archive transport with read and write methods is required.');
    }
    let epoch = 0;
    let operation = null;
    let state = {
      userId: null, records: {}, revision: null, ready: false,
      busy: false, status: 'signed-out', error: null
    };

    function getState() {
      return { ...state, records: copyRecords(state.records), error: state.error ? { ...state.error } : null };
    }

    function notify() {
      // Observers receive independent copies and cannot interfere with persistence.
      for (const callback of [onChange, onStatus]) {
        if (typeof callback !== 'function') continue;
        try { callback(getState()); } catch (_) { /* A UI observer must not break storage. */ }
      }
    }

    function publishError(result) {
      state = { ...state, status: result.code === 'CONFLICT' ? 'conflict' : 'error', error: { code: result.code, message: result.message } };
      notify();
      return result;
    }

    function stale() {
      return failure('STALE_REQUEST', '账号已切换，本次请求结果已忽略。');
    }

    async function readArchive() {
      if (!state.userId) return failure('AUTH_REQUIRED', '请先登录，再读取云端足迹。');
      if (state.busy) return failure('BUSY', '正在处理云端存档，请稍后重试。');
      const requestEpoch = epoch, userId = state.userId;
      operation = 'read';
      state = { ...state, busy: true, status: 'loading', error: null };
      notify();
      try {
        const response = await transport.read(userId);
        if (epoch !== requestEpoch || state.userId !== userId) return stale();
        const snapshot = validateSnapshot(response);
        if (typeof migrateRecords === 'function') snapshot.records = validateRecords(migrateRecords(snapshot.records).records);
        state = { ...state, ...snapshot, ready: true, busy: false, status: 'ready', error: null };
        operation = null;
        notify();
        return { ok: true };
      } catch (error) {
        if (epoch !== requestEpoch || state.userId !== userId) return stale();
        operation = null;
        state = { ...state, busy: false };
        return publishError(transportFailure(error, 'READ_FAILED'));
      }
    }

    async function setUser(userId) {
      if (userId !== null && (typeof userId !== 'string' || !userId.trim())) {
        return failure('INVALID_USER', '登录账号信息无效。');
      }
      epoch += 1;
      operation = null;
      state = {
        userId, records: {}, revision: null, ready: false,
        busy: false, status: userId ? 'loading' : 'signed-out', error: null
      };
      notify();
      return userId ? readArchive() : { ok: true };
    }

    async function save(next, options) {
      if (!state.userId) return failure('AUTH_REQUIRED', '请先登录，再保存云端足迹。');
      if (state.busy) return failure('BUSY', operation === 'write' ? '正在保存这份足迹，请稍候。' : '正在读取云端足迹，请稍候。');
      if (!state.ready) return failure('NOT_READY', '请先成功读取云端存档，再保存足迹。');
      if (!options || !Object.hasOwn(options, 'expectedRevision') || !validRevision(options.expectedRevision)) {
        return publishError(failure('INVALID_REVISION', '保存时必须提供打开表单时的存档版本。'));
      }
      const expectedRevision = options.expectedRevision;
      if (expectedRevision !== state.revision) {
        return publishError(failure('CONFLICT', '当前表单对应的存档版本已变化，请保留输入并重新打开编辑。'));
      }
      let validated;
      try { validated = validateRecords(next); }
      catch (error) { return publishError(failure('INVALID_RECORDS', error.message)); }
      const requestEpoch = epoch, userId = state.userId;
      operation = 'write';
      state = { ...state, busy: true, status: 'saving', error: null };
      notify();
      try {
        const response = await transport.write(userId, { records: validated, expectedRevision });
        if (epoch !== requestEpoch || state.userId !== userId) return stale();
        const snapshot = validateSnapshot(response, expectedRevision);
        state = { ...state, ...snapshot, ready: true, busy: false, status: 'saved', error: null };
        operation = null;
        notify();
        return { ok: true };
      } catch (error) {
        if (epoch !== requestEpoch || state.userId !== userId) return stale();
        operation = null;
        state = { ...state, busy: false };
        return publishError(transportFailure(error, 'WRITE_FAILED'));
      }
    }

    return Object.freeze({ setUser, getState, save, refresh: readArchive });
  }

  root.createCloudArchiveStore = createCloudArchiveStore;
  root.prepareLocalArchiveImport = prepareLocalArchiveImport;
  root.validateShanheRecords = validateRecords;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createCloudArchiveStore, prepareLocalArchiveImport, validateRecords, REGION_ID: CITY_ID, MAX_RECORDS, MAX_BYTES };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
