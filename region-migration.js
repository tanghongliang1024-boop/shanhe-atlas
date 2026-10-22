(function (root) {
  'use strict';
  const validate = root.validateShanheRecords || (typeof require === 'function' ? require('./cloud-store.js').validateRecords : null);
  const REGION_ID = /^(?:\d{6}|tw-(?:\d{5}|\d{8})|world:[A-Z]{3}(?::[A-Za-z0-9][A-Za-z0-9._-]{0,63})?)$/;
  const LEGACY_ID = /^(?:\d{4}00|tw-\d{5})$/;
  function invalid() { const e = new Error('地区迁移映射无效，原足迹未改动。'); e.code = 'INVALID_MIGRATION'; throw e; }
  function migrateRecords(input, manifest, occupiedInput = {}) {
    const records = validate(input), changes = [], conflicts = [], unmapped = [];
    const occupied = validate(occupiedInput);
    if (!manifest) return { records, changes, conflicts, unmapped, changed: false };
    if (manifest.version !== 1 || !manifest.mappings || typeof manifest.mappings !== 'object' || Array.isArray(manifest.mappings)) invalid();
    // A mapping is accepted only when its source was reviewed. Refuse malformed
    // approved mappings, and never derive a government seat from map centroids.
    const approved = new Map();
    for (const [from, item] of Object.entries(manifest.mappings)) {
      if (item?.verified !== true) continue;
      if (!REGION_ID.test(from) || !REGION_ID.test(item.targetId) || typeof item.source !== 'string' || !/^https:\/\/[^\s]+$/.test(item.source)) invalid();
      approved.set(from, item.targetId);
    }
    // Mapping chains/cycles make repeated loads non-idempotent. Data publishers
    // must give the final destination directly; self-maps are already current.
    for (const [from, to] of approved) if (to !== from && approved.has(to) && approved.get(to) !== to) invalid();
    // Stable ordering also covers many-to-one level restorations: move at most
    // one complete record into an empty parent; retain every other source key.
    // Dates, notes and timestamps never get combined, deduplicated or replaced.
    for (const from of Object.keys(records).sort()) {
      const to = approved.get(from);
      if (!to) { if (LEGACY_ID.test(from)) unmapped.push(from); continue; }
      if (to === from) continue;
      if (Object.hasOwn(records, to) || Object.hasOwn(occupied, to)) {
        // Even equal-looking entries may represent separate trips. Keep both
        // complete records and ask the UI to offer a deliberate resolution.
        conflicts.push({ from, to });
        continue;
      }
      records[to] = { ...records[from] };
      delete records[from];
      changes.push({ from, to });
    }
    return { records: validate(records), changes, conflicts, unmapped, changed: changes.length > 0 };
  }
  root.ShanheRegionMigration = Object.freeze({ migrateRecords });
  if (typeof module === 'object' && module.exports) module.exports = root.ShanheRegionMigration;
})(typeof globalThis === 'object' ? globalThis : this);
