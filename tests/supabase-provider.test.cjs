'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { createSupabaseArchiveProvider } = require('../supabase-provider.js');

const session = id => ({
  user: { id, email: `${id}@example.test`, email_confirmed_at: '2026-10-22T06:00:00Z', user_metadata: { secret: 'metadata' } },
  access_token: `private-access-token-${id}`, refresh_token: 'private-refresh-token'
});
const records = { '110000': { visited: true, date: '2026-10-21', note: '旅行记忆' } };

function mockClient() {
  const calls = [];
  let authCallback;
  const mock = {
    calls,
    session: session('alice'),
    readResponse: { data: null, error: null },
    writeResponse: { data: { records, revision: 1 }, error: null },
    authResponse: { data: { session: session('alice') }, error: null },
    auth: {
      async getSession() { calls.push(['getSession']); return { data: { session: mock.session }, error: null }; },
      onAuthStateChange(callback) {
        calls.push(['onAuthStateChange']);
        authCallback = callback;
        return { data: { subscription: { unsubscribe() { calls.push(['unsubscribe']); } } } };
      },
      async signInWithPassword(...args) { calls.push(['signInWithPassword', ...args]); return mock.authResponse; },
      async signUp(...args) { calls.push(['signUp', ...args]); return mock.authResponse; },
      async resend(...args) { calls.push(['resend', ...args]); return mock.authResponse; },
      async verifyOtp(...args) { calls.push(['verifyOtp', ...args]); return mock.authResponse; },
      async resetPasswordForEmail(...args) { calls.push(['resetPasswordForEmail', ...args]); return mock.authResponse; },
      async updateUser(...args) { calls.push(['updateUser', ...args]); return mock.authResponse; },
      async signOut(...args) { calls.push(['signOut', ...args]); return { error: null }; }
    },
    from(table) {
      calls.push(['from', table]);
      return {
        select(columns) { calls.push(['select', columns]); return this; },
        eq(column, value) { calls.push(['eq', column, value]); return this; },
        maybeSingle() { calls.push(['maybeSingle']); return this; },
        setHeader(name, value) { calls.push(['setHeader', name, value]); return this; },
        then(resolve, reject) { return Promise.resolve(mock.readResponse).then(resolve, reject); }
      };
    },
    rpc(...args) {
      calls.push(['rpc', ...args]);
      return {
        setHeader(name, value) { calls.push(['setHeader', name, value]); return this; },
        then(resolve, reject) { return Promise.resolve(mock.writeResponse).then(resolve, reject); }
      };
    },
    emit(event, nextSession) { return authCallback(event, nextSession); }
  };
  return mock;
}

test('exports the same factory for browser scripts', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../supabase-provider.js'), 'utf8'), context);
  assert.equal(typeof context.createSupabaseArchiveProvider, 'function');
});

test('session wrapper returns only user id and email and supports signed out state', async () => {
  const client = mockClient();
  const provider = createSupabaseArchiveProvider(client);
  assert.deepEqual(await provider.getSession(), { user: { id: 'alice', email: 'alice@example.test' } });
  client.session = null;
  assert.deepEqual(await provider.getSession(), { user: null });
});

test('anonymous and mismatched sessions cannot read or write another account', async () => {
  for (const nextSession of [null, session('bob')]) {
    const client = mockClient();
    client.session = nextSession;
    const provider = createSupabaseArchiveProvider(client);
    const code = nextSession ? 'FORBIDDEN' : 'AUTH_REQUIRED';
    await assert.rejects(provider.transport.read('alice'), { code });
    await assert.rejects(provider.transport.write('alice', { records, expectedRevision: 0 }), { code });
    assert.deepEqual(client.calls, [['getSession'], ['getSession']]);
  }
});

test('unconfirmed persisted sessions cannot become an application account or access archives through any event', async () => {
  for (const confirmation of [undefined, null, '', true, 'not-a-date']) {
    const client = mockClient();
    client.session.user.email_confirmed_at = confirmation;
    client.session.user.confirmed_at = '2026-10-22T06:00:00Z';
    client.session.user.phone_confirmed_at = '2026-10-22T06:00:00Z';
    client.session.user.user_metadata.email_verified = true;
    client.authResponse = { data: { session: client.session }, error: null };
    const provider = createSupabaseArchiveProvider(client), observed = [];
    assert.deepEqual(await provider.getSession(), { user: null });
    assert.deepEqual(await provider.signIn('alice@example.test', 'example-password'), { user: null });
    const stop = provider.onAuthStateChange((...event) => observed.push(event));
    for (const event of ['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED', 'PASSWORD_RECOVERY']) client.emit(event, client.session);
    assert.deepEqual(observed, ['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED', 'PASSWORD_RECOVERY'].map(event => [event, { user: null }]));
    await assert.rejects(provider.transport.read('alice'), { code: 'AUTH_REQUIRED' });
    await assert.rejects(provider.transport.write('alice', { records, expectedRevision: 0 }), { code: 'AUTH_REQUIRED' });
    assert.equal(client.calls.some(call => ['from', 'rpc'].includes(call[0])), false);
    stop();
  }
});

test('missing archive becomes an empty version zero and successful read targets only this user', async () => {
  const client = mockClient();
  const provider = createSupabaseArchiveProvider(client);
  assert.deepEqual(await provider.transport.read('alice'), { records: {}, revision: 0 });
  assert.deepEqual(client.calls, [
    ['getSession'], ['from', 'shanhe_archives'], ['select', 'records,revision'], ['eq', 'user_id', 'alice'], ['maybeSingle'],
    ['setHeader', 'Authorization', 'Bearer private-access-token-alice']
  ]);
  client.readResponse = { data: { records, revision: 4, user_id: 'alice' }, error: null };
  assert.deepEqual(await provider.transport.read('alice'), { records, revision: 4 });
});

test('save uses authenticated RPC with revision and only returns server confirmed data', async () => {
  const client = mockClient();
  const provider = createSupabaseArchiveProvider(client);
  assert.deepEqual(await provider.transport.write('alice', { records, expectedRevision: 0 }), { records, revision: 1 });
  assert.deepEqual(client.calls, [
    ['getSession'], ['rpc', 'shanhe_save_archive_v4', { p_records: records, p_expected_revision: 0 }],
    ['setHeader', 'Authorization', 'Bearer private-access-token-alice']
  ]);
});

test('landmarks mode shares authentication but targets only its independent table and RPC', async () => {
  const client = mockClient();
  const landmarkRecords = { 'poi:CHN:taishan': { status: 'visited', date: '', note: '', updatedAt: '2026-10-28T00:00:00Z' } };
  client.writeResponse = { data: { records: landmarkRecords, revision: 1 }, error: null };
  const provider = createSupabaseArchiveProvider(client, { archive: 'landmarks' });
  assert.deepEqual(await provider.transport.read('alice'), { records: {}, revision: 0 });
  assert.deepEqual(await provider.transport.write('alice', { records: landmarkRecords, expectedRevision: 0 }), { records: landmarkRecords, revision: 1 });
  assert.deepEqual(client.calls.filter(call => call[0] === 'from' || call[0] === 'rpc'), [
    ['from', 'shanhe_landmark_archives'],
    ['rpc', 'shanhe_save_landmark_archive', { p_records: landmarkRecords, p_expected_revision: 0 }]
  ]);
});

test('RPC conflict forms become a safe CONFLICT error', async () => {
  for (const error of [
    { code: '40001', message: 'private-access-token' },
    { code: 'REVISION_CONFLICT', details: records },
    { code: 'P0001', message: 'REVISION_CONFLICT' }
  ]) {
    const client = mockClient();
    client.writeResponse = { data: null, error };
    const provider = createSupabaseArchiveProvider(client);
    await assert.rejects(provider.transport.write('alice', { records, expectedRevision: 0 }), err => {
      assert.equal(err.code, 'CONFLICT');
      assert.equal(Object.hasOwn(err, 'cause'), false);
      assert.doesNotMatch(err.message, /private|110000|旅行记忆/);
      return true;
    });
  }
});

test('returned and thrown network failures never expose request or archive details', async () => {
  const client = mockClient();
  const provider = createSupabaseArchiveProvider(client);
  client.readResponse = { data: null, error: { message: 'private-access-token', details: records } };
  await assert.rejects(provider.transport.read('alice'), { code: 'READ_FAILED' });
  client.rpc = () => { throw new Error('private-refresh-token and 旅行记忆'); };
  await assert.rejects(provider.transport.write('alice', { records, expectedRevision: 0 }), error => {
    assert.equal(error.code, 'WRITE_FAILED');
    assert.doesNotMatch(error.message, /private|旅行记忆/);
    assert.deepEqual(Object.keys(error), ['code']);
    return true;
  });
  client.auth.getSession = async () => { throw new Error('private-access-token'); };
  await assert.rejects(provider.getSession(), { code: 'AUTH_FAILED' });
});

test('invalid versions and malformed server snapshots cannot be used', async () => {
  const client = mockClient();
  const provider = createSupabaseArchiveProvider(client);
  await assert.rejects(provider.transport.write('alice', { records, expectedRevision: -1 }), { code: 'INVALID_REVISION' });
  assert.equal(client.calls.some(call => call[0] === 'rpc'), false);
  for (const data of [undefined, [], { records: [], revision: 1 }, { records: {}, revision: '1' }, { records: {}, revision: -1 }]) {
    client.readResponse = { data, error: null };
    await assert.rejects(provider.transport.read('alice'), { code: 'INVALID_RESPONSE' });
  }
  client.writeResponse = { data: { records: {}, revision: 0 }, error: null };
  await assert.rejects(provider.transport.write('alice', { records, expectedRevision: 0 }), { code: 'INVALID_RESPONSE' });
});

test('email sign in exposes no raw session and signup without confirmation is signed out', async () => {
  const client = mockClient();
  const provider = createSupabaseArchiveProvider(client);
  assert.deepEqual(await provider.signIn('alice@example.test', 'example-password'), { user: { id: 'alice', email: 'alice@example.test' } });
  client.authResponse = { data: { user: session('alice').user, session: null }, error: null };
  assert.deepEqual(await provider.signUp('alice@example.test', 'example-password', 'https://example.test/app/'), { user: null });
  assert.deepEqual(client.calls, [
    ['signInWithPassword', { email: 'alice@example.test', password: 'example-password' }],
    ['signUp', { email: 'alice@example.test', password: 'example-password', options: { emailRedirectTo: 'https://example.test/app/' } }]
  ]);
});

test('reset and current-session signout use SDK contracts', async () => {
  const client = mockClient();
  const provider = createSupabaseArchiveProvider(client);
  await provider.sendPasswordReset('alice@example.test', 'https://example.test/app/');
  await provider.signOut();
  assert.deepEqual(client.calls, [
    ['resetPasswordForEmail', 'alice@example.test', { redirectTo: 'https://example.test/app/' }],
    ['signOut', { scope: 'local' }]
  ]);
});

test('confirmation resend works while signed out and never signs up, resets a password or exposes response data', async () => {
  const client = mockClient();
  client.session = null;
  client.authResponse = { data: { user: session('alice').user, access_token: 'private-resend-response' }, error: null };
  const provider = createSupabaseArchiveProvider(client);
  const result = await provider.resendConfirmation('alice@example.test', 'https://example.test/app/');
  assert.equal(result, undefined, 'the UI only needs to know that the resend request succeeded');
  assert.equal(client.session, null, 'requesting confirmation does not establish a session');
  assert.deepEqual(client.calls, [['resend', {
    type: 'signup', email: 'alice@example.test', options: { emailRedirectTo: 'https://example.test/app/' }
  }]], 'resend is the only SDK or archive operation; it must not substitute signup or password recovery');
});

test('confirmation resend rate limits use the fixed public message without retaining raw error details', async () => {
  for (const raw of [
    { code: 'over_email_send_rate_limit' },
    { code: 'over_request_rate_limit' },
    { status: 429, code: 'unrecognized_rate_code' }
  ]) {
    const client = mockClient();
    client.authResponse = { data: null, error: { ...raw, message: 'private-password private-token', email: 'private@example.test', details: { secret: 'private-detail' } } };
    const provider = createSupabaseArchiveProvider(client);
    await assert.rejects(provider.resendConfirmation('alice@example.test', 'https://example.test/app/'), error => {
      assert.equal(error.code, 'RATE_LIMITED');
      assert.equal(error.message, '操作过于频繁，请稍后重试。');
      assert.equal(error.cause, undefined);
      assert.deepEqual(Object.keys(error), ['code']);
      assert.doesNotMatch(String(error) + JSON.stringify(error), /private/);
      return true;
    });
    assert.deepEqual(client.calls.map(call => call[0]), ['resend']);
  }
});

test('confirmation resend sanitizes SDK errors, thrown failures and malformed responses without fallback mail actions', async () => {
  for (const [mode,expected] of [['response-error','AUTH_FAILED'],['throw','AUTH_FAILED'],['invalid-response','INVALID_RESPONSE']]) {
    const client = mockClient();
    const failure = { code: 'unexpected_auth_error', status: 500, message: 'private-link private-password', email: 'private@example.test' };
    client.auth.resend = async payload => {
      client.calls.push(['resend', payload]);
      if (mode === 'throw') throw failure;
      return mode === 'response-error' ? { data: null, error: failure } : null;
    };
    const before = structuredClone(client.session), provider = createSupabaseArchiveProvider(client);
    await assert.rejects(provider.resendConfirmation('alice@example.test', 'https://example.test/app/'), error => {
      assert.equal(error.code, expected);
      assert.equal(error.cause, undefined);
      assert.deepEqual(Object.keys(error), ['code']);
      assert.doesNotMatch(String(error) + JSON.stringify(error), /private/);
      return true;
    });
    assert.deepEqual(client.session, before, 'failed resend must not replace or clear another signed-in session');
    assert.deepEqual(client.calls.map(call => call[0]), ['resend'], 'no signup, password reset, signout, archive read or write fallback');
  }
});

test('email code verification uses the email OTP contract and returns only the confirmed matching identity', async () => {
  const client = mockClient();
  const confirmed = session('alice');
  confirmed.user.email = 'ALICE@example.test';
  confirmed.user.email_confirmed_at = '2026-10-30T01:00:00Z';
  client.authResponse = { data: { session: confirmed, user: confirmed.user }, error: null };
  const provider = createSupabaseArchiveProvider(client);
  assert.deepEqual(await provider.verifyEmailCode('  Alice@example.test  ', '12345678'), {
    user: { id: 'alice', email: 'alice@example.test' }
  });
  assert.deepEqual(client.calls, [['verifyOtp', {
    email: 'alice@example.test', token: '12345678', type: 'email'
  }]], 'verification must not send another email, set a password, or access archives');
});

test('incorrect and expired email codes have a fixed safe message even when the SDK returns 403', async () => {
  for (const detail of ['wrong private-code', 'expired private-code']) {
    const client = mockClient();
    client.authResponse = { data: null, error: { code: 'otp_expired', status: 403, message: detail, token: 'private-code' } };
    await assert.rejects(createSupabaseArchiveProvider(client).verifyEmailCode('alice@example.test', '12345678'), error => {
      assert.equal(error.code, 'VERIFICATION_CODE_INVALID');
      assert.equal(error.message, '验证码不正确或已过期，请检查最新邮件中的验证码。');
      assert.deepEqual(Object.keys(error), ['code']);
      assert.equal(error.cause, undefined);
      assert.doesNotMatch(String(error) + JSON.stringify(error), /private|12345678/);
      return true;
    });
    assert.deepEqual(client.calls.map(call => call[0]), ['verifyOtp']);
  }
});

test('email verification rejects missing sessions, tokens and email confirmation instead of trusting a user flag', async () => {
  const confirmed = session('alice');
  confirmed.user.email_confirmed_at = '2026-10-30T01:00:00Z';
  const candidates = [
    null,
    { user: confirmed.user, session: null },
    { user: confirmed.user, email_confirmed: true },
    { session: { user: confirmed.user } },
    { session: { ...confirmed, access_token: '' } },
    { session: { ...confirmed, access_token: '   ' } },
    { session: { ...confirmed, user: { ...confirmed.user, email_confirmed_at: undefined } } },
    { session: { ...confirmed, user: { ...confirmed.user, email_confirmed_at: null, confirmed_at: '2026-10-30T01:00:00Z' } } },
    { session: { ...confirmed, user: { ...confirmed.user, email_confirmed_at: true } } },
    { session: { ...confirmed, user: { ...confirmed.user, email_confirmed_at: 'not-a-date' } } },
    { session: { ...confirmed, user: { ...confirmed.user, id: '' } } },
    { session: { ...confirmed, user: { id: 'alice', email: 'alice@example.test', user_metadata: { email_verified: true }, phone_confirmed_at: '2026-10-30T01:00:00Z' } } }
  ];
  for (const data of candidates) {
    const client = mockClient();
    client.authResponse = { data, error: null };
    await assert.rejects(createSupabaseArchiveProvider(client).verifyEmailCode('alice@example.test', '12345678'), {
      code: 'VERIFICATION_INCOMPLETE', message: '邮箱验证尚未完成，请重新获取验证码后重试。'
    });
    assert.deepEqual(client.calls.map(call => call[0]), ['verifyOtp'], 'an old current session cannot fill missing verification evidence');
  }
});

test('email verification rejects a stale response for another address or inconsistent SDK user identity', async () => {
  const confirmed = session('alice');
  confirmed.user.email_confirmed_at = '2026-10-30T01:00:00Z';
  for (const data of [
    { session: { ...confirmed, user: { ...confirmed.user, email: 'bob@example.test' } } },
    { session: confirmed, user: { ...confirmed.user, email: 'bob@example.test' } },
    { session: confirmed, user: { ...confirmed.user, id: 'bob' } }
  ]) {
    const client = mockClient();
    let finish;
    client.auth.verifyOtp = async payload => {
      client.calls.push(['verifyOtp', payload]);
      return new Promise(resolve => { finish = resolve; });
    };
    const verification = createSupabaseArchiveProvider(client).verifyEmailCode('alice@example.test', '12345678');
    client.session = session('bob');
    finish({ data, error: null });
    await assert.rejects(verification, { code: 'VERIFICATION_INCOMPLETE' });
    assert.equal(client.session.user.id, 'bob', 'verification failure must not sign out or mutate another account');
    assert.deepEqual(client.calls.map(call => call[0]), ['verifyOtp']);
  }
});

test('email verification sanitizes unexpected SDK and network errors and preserves rate limit handling', async () => {
  for (const [mode, expected] of [['error', 'AUTH_FAILED'], ['throw', 'AUTH_FAILED'], ['rate', 'RATE_LIMITED'], ['malformed', 'INVALID_RESPONSE']]) {
    const client = mockClient();
    client.auth.verifyOtp = async payload => {
      client.calls.push(['verifyOtp', payload]);
      const error = { code: mode === 'rate' ? 'over_request_rate_limit' : 'unexpected_failure', message: 'private-token private-password', details: 'private-email' };
      if (mode === 'throw') throw error;
      return mode === 'malformed' ? null : { data: null, error };
    };
    await assert.rejects(createSupabaseArchiveProvider(client).verifyEmailCode('alice@example.test', '12345678'), error => {
      assert.equal(error.code, expected);
      assert.deepEqual(Object.keys(error), ['code']);
      assert.equal(error.cause, undefined);
      assert.doesNotMatch(String(error) + JSON.stringify(error), /private|12345678/);
      return true;
    });
    assert.deepEqual(client.calls.map(call => call[0]), ['verifyOtp']);
  }
});

test('auth errors use fixed public messages', async () => {
  const client = mockClient();
  const provider = createSupabaseArchiveProvider(client);
  for (const [code, expected] of [
    ['invalid_credentials', 'INVALID_CREDENTIALS'], ['email_not_confirmed', 'EMAIL_NOT_CONFIRMED'],
    ['email_address_not_authorized', 'EMAIL_ADDRESS_NOT_AUTHORIZED'], ['email_provider_disabled', 'EMAIL_PROVIDER_DISABLED'],
    ['over_email_send_rate_limit', 'RATE_LIMITED'], ['weak_password', 'WEAK_PASSWORD']
  ]) {
    client.authResponse = { data: null, error: { code, message: 'private-password' } };
    await assert.rejects(provider.signIn('alice@example.test', 'example-password'), error => {
      assert.equal(error.code, expected);
      assert.doesNotMatch(error.message, /private-password/);
      return true;
    });
  }
});

test('auth observer gets safe session synchronously without reentering SDK auth; unsubscribe is idempotent', () => {
  const client = mockClient();
  const provider = createSupabaseArchiveProvider(client);
  const observed = [];
  const unsubscribe = provider.onAuthStateChange((...args) => observed.push(args));
  assert.equal(client.emit('SIGNED_IN', session('alice')), undefined);
  client.emit('SIGNED_OUT', null);
  assert.deepEqual(observed, [
    ['SIGNED_IN', { user: { id: 'alice', email: 'alice@example.test' } }], ['SIGNED_OUT', { user: null }]
  ]);
  unsubscribe();
  unsubscribe();
  client.emit('SIGNED_IN', session('bob'));
  assert.equal(observed.length, 2);
  assert.deepEqual(client.calls, [['onAuthStateChange'], ['unsubscribe']]);
});

test('requests keep the checked account token even if the shared SDK session switches before sending', async () => {
  for (const operation of ['read', 'write']) {
    const client = mockClient();
    const provider = createSupabaseArchiveProvider(client);
    // The SDK returns account A, then another tab signs into B before the
    // PostgREST builder is executed. Its default token would now belong to B.
    client.auth.getSession = async () => {
      const checked = client.session;
      client.session = session('bob');
      return { data: { session: checked }, error: null };
    };
    await (operation === 'read' ? provider.transport.read('alice') : provider.transport.write('alice', { records, expectedRevision: 0 }));
    assert.equal(client.session.user.id, 'bob');
    assert.deepEqual(client.calls.filter(call => call[0] === 'setHeader'), [
      ['setHeader', 'Authorization', 'Bearer private-access-token-alice']
    ]);
  }
});

test('a session without its SDK access token cannot make a database request', async () => {
  const client = mockClient();
  delete client.session.access_token;
  const provider = createSupabaseArchiveProvider(client);
  await assert.rejects(provider.transport.read('alice'), { code: 'UNAUTHORIZED' });
  await assert.rejects(provider.transport.write('alice', { records, expectedRevision: 0 }), { code: 'UNAUTHORIZED' });
  assert.deepEqual(client.calls, [['getSession'], ['getSession']]);
});

test('password recovery binds the checked identity even if the SDK switches users before fetch', async () => {
  const client = mockClient();
  const requests = [];
  const provider = createSupabaseArchiveProvider(client, {
    url: 'https://example-project.supabase.co/', publishableKey: 'sb_publishable_test',
    async fetch(url, init) {
      requests.push({ url, init });
      assert.equal(client.session.user.id, 'bob');
      return { ok: true, status: 200, json: async () => ({ id: 'alice', email: 'alice@example.test' }) };
    }
  });
  client.auth.getSession = async () => {
    const checked = client.session;
    client.session = session('bob');
    return { data: { session: checked }, error: null };
  };
  await provider.updatePassword('replacement-password', 'alice');
  assert.deepEqual(requests, [{
    url: 'https://example-project.supabase.co/auth/v1/user',
    init: {
      method: 'PUT', credentials: 'omit', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', apikey: 'sb_publishable_test', Authorization: 'Bearer private-access-token-alice' },
      body: JSON.stringify({ password: 'replacement-password' })
    }
  }]);
  assert.equal(client.calls.some(call => call[0] === 'updateUser'), false);
});

test('password recovery refuses an already changed account without issuing any auth update', async () => {
  const client = mockClient();
  client.session = session('bob');
  let requests = 0;
  const provider = createSupabaseArchiveProvider(client, {
    url: 'https://example-project.supabase.co', publishableKey: 'sb_publishable_test',
    fetch() { requests++; throw new Error('Must not fetch'); }
  });
  await assert.rejects(provider.updatePassword('replacement-password', 'alice'), { code: 'FORBIDDEN' });
  await assert.rejects(provider.updatePassword('replacement-password'), { code: 'AUTH_REQUIRED' });
  assert.equal(requests, 0);
});

test('password update safely handles API errors, network errors, and mismatched response identity', async () => {
  for (const [response, expectedCode] of [
    [{ ok: false, status: 400, json: async () => ({ error_code: 'weak_password', msg: 'private-password' }) }, 'WEAK_PASSWORD'],
    [{ ok: false, status: 401, json: async () => ({ message: 'private-access-token' }) }, 'UNAUTHORIZED'],
    [{ ok: true, status: 200, json: async () => ({ id: 'bob' }) }, 'INVALID_RESPONSE'],
    [null, 'AUTH_FAILED']
  ]) {
    const provider = createSupabaseArchiveProvider(mockClient(), {
      url: 'https://example-project.supabase.co', publishableKey: 'sb_publishable_test',
      async fetch() { if (!response) throw new Error('private-password'); return response; }
    });
    await assert.rejects(provider.updatePassword('replacement-password', 'alice'), error => {
      assert.equal(error.code, expectedCode);
      assert.doesNotMatch(error.message, /private-password|private-access-token/);
      return true;
    });
  }
});
