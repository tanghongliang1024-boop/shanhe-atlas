'use strict';

// Exercise the shipped SDK against an in-memory transport. No browser,
// real account, email delivery, credentials or network connection is used.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const { createSupabaseArchiveProvider } = require('../supabase-provider.js');

const sdkSource = fs.readFileSync(require.resolve('../assets/supabase-2.118.0.js'), 'utf8');
const FAKE_ORIGIN = 'https://verification.example.test';
const FAKE_EMAIL = 'traveler@example.test';
const FAKE_CODE = '12345678';
const FAKE_STORAGE_KEY = 'offline-email-verification';

function fakeSession(confirmed = true) {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const base64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  // This token is deliberately not signed and cannot authenticate anywhere.
  const fakeAccessToken = `${base64({ alg: 'HS256', typ: 'JWT' })}.${base64({ sub: 'offline-user', aud: 'authenticated', exp: expiresAt })}.not-a-real-signature`;
  return {
    access_token: fakeAccessToken, refresh_token: 'offline-fake-refresh-token',
    expires_in: 3600, expires_at: expiresAt, token_type: 'bearer',
    user: {
      id: 'offline-user', email: FAKE_EMAIL, aud: 'authenticated',
      email_confirmed_at: confirmed ? '2026-10-30T00:00:00Z' : null,
      created_at: '2026-10-30T00:00:00Z', app_metadata: {}, user_metadata: {}
    }
  };
}

async function harness(t, responseBody, status = 200) {
  const values = new Map(), requests = [], events = [];
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: key => { values.delete(key); }
  };
  const fakeFetch = async (input, init = {}) => {
    const url = String(input);
    assert.equal(url, `${FAKE_ORIGIN}/auth/v1/verify`, 'unexpected SDK endpoint; the fake transport never forwards requests');
    assert.equal(init.method, 'POST');
    requests.push({ url, method: init.method, body: JSON.parse(init.body) });
    return new Response(JSON.stringify(responseBody), {
      status, headers: { 'Content-Type': 'application/json', 'X-Supabase-Api-Version': '2024-01-01' }
    });
  };
  const context = vm.createContext({
    URL, Headers, Request, Response, AbortController, TextEncoder, TextDecoder,
    setTimeout, clearTimeout, setInterval, clearInterval, crypto: webcrypto,
    WebSocket: class OfflineOnlyWebSocket { constructor() { throw new Error('WebSocket connections are forbidden in this offline test'); } },
    fetch: fakeFetch, console
  });
  vm.runInContext(sdkSource, context, { filename: 'supabase-2.118.0.js' });
  const client = context.supabase.createClient(FAKE_ORIGIN, 'offline-fake-publishable-key', {
    global: { fetch: fakeFetch },
    auth: { storage, storageKey: FAKE_STORAGE_KEY, persistSession: true, autoRefreshToken: false, detectSessionInUrl: false, flowType: 'pkce' }
  });
  await client.auth.initialize();
  const { data: listener } = client.auth.onAuthStateChange((event, session) => {
    events.push({ event, userId: session?.user?.id ?? null, confirmed: Boolean(session?.user?.email_confirmed_at) });
  });
  // Let the subscription deliver INITIAL_SESSION before testing verification.
  await new Promise(resolve => setTimeout(resolve, 0));
  events.length = 0;
  t.after(async () => { listener.subscription.unsubscribe(); await client.auth.stopAutoRefresh(); });
  return { client, values, requests, events, provider: createSupabaseArchiveProvider(client) };
}

test('shipped SDK verifies an eight-digit email code without an original browser PKCE verifier', async t => {
  const h = await harness(t, fakeSession());
  assert.equal(h.values.size, 0, 'the email was not requested in this simulated browser');
  const result = await h.provider.verifyEmailCode(FAKE_EMAIL, FAKE_CODE);
  assert.deepEqual(result, { user: { id: 'offline-user', email: FAKE_EMAIL } });
  assert.equal(h.requests.length, 1);
  assert.deepEqual(h.requests[0].body, { email: FAKE_EMAIL, token: FAKE_CODE, type: 'email', gotrue_meta_security: {} });
  assert.deepEqual(h.events, [{ event: 'SIGNED_IN', userId: 'offline-user', confirmed: true }]);
  const restored = await h.client.auth.getSession();
  assert.equal(restored.data.session.user.email_confirmed_at, '2026-10-30T00:00:00Z');
  assert.equal(h.values.has(`${FAKE_STORAGE_KEY}-code-verifier`), false);
});

test('shipped SDK leaves the browser signed out after incorrect or expired email code responses', async t => {
  for (const message of ['Token is invalid', 'Token has expired']) {
    const h = await harness(t, { code: 'otp_expired', msg: message }, 403);
    await assert.rejects(h.provider.verifyEmailCode(FAKE_EMAIL, FAKE_CODE), { code: 'VERIFICATION_CODE_INVALID' });
    assert.deepEqual(h.events, [], 'failed verification must not emit SIGNED_IN');
    assert.equal((await h.client.auth.getSession()).data.session, null);
    assert.equal(h.values.size, 0);
    assert.equal(h.requests.length, 1);
  }
});

test('provider does not accept a session missing email confirmation even if the SDK emits SIGNED_IN first', async t => {
  const h = await harness(t, fakeSession(false));
  const publicEvents = [];
  const stop = h.provider.onAuthStateChange((event, session) => publicEvents.push({ event, user: session.user }));
  t.after(stop);
  await new Promise(resolve => setTimeout(resolve, 0));
  publicEvents.length = 0;
  await assert.rejects(h.provider.verifyEmailCode(FAKE_EMAIL, FAKE_CODE), { code: 'VERIFICATION_INCOMPLETE' });
  // The SDK persists and broadcasts any structurally valid session before
  // verifyOtp resolves. UI verification success must rely on provider result,
  // not this event, and must keep its operation/account-generation guards.
  assert.deepEqual(h.events, [{ event: 'SIGNED_IN', userId: 'offline-user', confirmed: false }]);
  assert.deepEqual(publicEvents, [{ event: 'SIGNED_IN', user: null }]);
  assert.deepEqual(await h.provider.getSession(), { user: null }, 'a persisted SDK session must not bypass confirmation after reload');
  await assert.rejects(h.provider.transport.read('offline-user'), { code: 'AUTH_REQUIRED' });
  await assert.rejects(h.provider.transport.write('offline-user', { records: {}, expectedRevision: 0 }), { code: 'AUTH_REQUIRED' });
  assert.equal(h.requests.length, 1, 'the provider must not sign out a possibly newer session as cleanup');
});
