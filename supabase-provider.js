(function (root) {
  'use strict';

  const MESSAGES = {
    AUTH_REQUIRED: '请先登录，再使用云端存档。',
    UNAUTHORIZED: '登录状态已失效，请重新登录。',
    FORBIDDEN: '当前账号没有访问这份存档的权限。',
    CONFLICT: '云端足迹已在其他位置更新，请刷新云端存档后重新编辑。',
    INVALID_RESPONSE: '云端返回的数据无效，请稍后重试。',
    INVALID_REVISION: '存档版本无效，请刷新云端存档后重试。',
    INVALID_CREDENTIALS: '邮箱或密码不正确，请检查后重试。',
    EMAIL_NOT_CONFIRMED: '请先点击邮箱中的确认链接，再登录。',
    EMAIL_ADDRESS_NOT_AUTHORIZED: '邮件服务暂未配置完成，请联系网站管理员。',
    EMAIL_PROVIDER_DISABLED: '邮件服务暂未配置完成，请联系网站管理员。',
    RATE_LIMITED: '操作过于频繁，请稍后重试。',
    WEAK_PASSWORD: '密码不符合要求，请设置更长、更复杂的密码。',
    AUTH_FAILED: '暂时无法完成账号操作，请检查网络后重试。',
    READ_FAILED: '暂时无法读取云端足迹，请检查网络后重试。',
    WRITE_FAILED: '云端保存失败，当前输入仍然保留，请重试。',
    CLIENT_UPDATE_REQUIRED: '请更新山河足迹后再保存，当前版本无法安全保存新版地图记录。'
  };

  function problem(code) {
    const error = new Error(MESSAGES[code]);
    error.code = code;
    return error;
  }

  // SDK and server errors can contain request details. Only expose our own
  // fixed codes and messages, never a token, password, record, or raw cause.
  function safeError(error, fallback) {
    const code = error?.code;
    if (code === '40001' || code === 'REVISION_CONFLICT' || error?.message === 'REVISION_CONFLICT') return problem('CONFLICT');
    if (error?.message === 'CLIENT_UPDATE_REQUIRED') return problem('CLIENT_UPDATE_REQUIRED');
    if (Object.hasOwn(MESSAGES, code)) return problem(code);
    if (code === 'invalid_credentials' || code === 'invalid_login_credentials') return problem('INVALID_CREDENTIALS');
    if (code === 'email_not_confirmed') return problem('EMAIL_NOT_CONFIRMED');
    if (code === 'email_address_not_authorized') return problem('EMAIL_ADDRESS_NOT_AUTHORIZED');
    if (code === 'email_provider_disabled') return problem('EMAIL_PROVIDER_DISABLED');
    if (code === 'weak_password') return problem('WEAK_PASSWORD');
    if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || error?.status === 429) return problem('RATE_LIMITED');
    if (code === 'PGRST301' || code === 'PGRST303' || code === 'session_not_found' || error?.status === 401) return problem('UNAUTHORIZED');
    if (code === '42501' || error?.status === 403) return problem('FORBIDDEN');
    return problem(fallback);
  }

  function publicSession(session) {
    const user = session?.user;
    return {
      user: user && typeof user.id === 'string' && user.id
        ? { id: user.id, email: typeof user.email === 'string' ? user.email : '' }
        : null
    };
  }

  function snapshot(data, expectedRevision) {
    if (!data || typeof data !== 'object' || Array.isArray(data) ||
        !data.records || typeof data.records !== 'object' || Array.isArray(data.records) ||
        !Number.isSafeInteger(data.revision) || data.revision < 0 ||
        (expectedRevision !== undefined && data.revision <= expectedRevision)) {
      throw problem('INVALID_RESPONSE');
    }
    // The cloud store validates each record before publishing it to the UI.
    return { records: data.records, revision: data.revision };
  }

  function createSupabaseArchiveProvider(client, options = {}) {
    if (!client?.auth || typeof client.auth.getSession !== 'function' ||
        typeof client.from !== 'function' || typeof client.rpc !== 'function') {
      throw new TypeError('A Supabase JavaScript client is required.');
    }
    const authBase = typeof options.url === 'string' && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(options.url)
      ? options.url.replace(/\/$/, '') : null;
    const publishableKey = typeof options.publishableKey === 'string' && options.publishableKey.startsWith('sb_publishable_')
      ? options.publishableKey : null;
    const fetchRequest = options.fetch || (typeof root.fetch === 'function' ? root.fetch.bind(root) : null);

    async function request(operation, fallback = 'AUTH_FAILED') {
      try {
        const response = await operation();
        if (!response || typeof response !== 'object') throw problem('INVALID_RESPONSE');
        if (response.error) throw response.error;
        return response.data;
      } catch (error) {
        throw safeError(error, fallback);
      }
    }

    async function getSession() {
      const data = await request(() => client.auth.getSession());
      return publicSession(data?.session);
    }

    async function requireUser(userId) {
      if (typeof userId !== 'string' || !userId) throw problem('AUTH_REQUIRED');
      const data = await request(() => client.auth.getSession());
      const { user } = publicSession(data?.session);
      if (!user) throw problem('AUTH_REQUIRED');
      if (user.id !== userId) throw problem('FORBIDDEN');
      const token = data?.session?.access_token;
      if (typeof token !== 'string' || !token) throw problem('UNAUTHORIZED');
      // Keep this SDK-managed token only for this operation. A shared client's
      // current session can change before it actually sends the request.
      // RLS and the RPC still perform final authorization with auth.uid().
      return token;
    }

    const transport = {
      async read(userId) {
        const token = await requireUser(userId);
        const data = await request(() => client.from('shanhe_archives')
          .select('records,revision').eq('user_id', userId).maybeSingle()
          .setHeader('Authorization', 'Bearer ' + token), 'READ_FAILED');
        return data === null ? { records: {}, revision: 0 } : snapshot(data);
      },
      async write(userId, payload) {
        const token = await requireUser(userId);
        if (!Number.isSafeInteger(payload?.expectedRevision) || payload.expectedRevision < 0) throw problem('INVALID_REVISION');
        const data = await request(() => client.rpc('shanhe_save_archive_v3', {
          p_records: payload.records,
          p_expected_revision: payload.expectedRevision
        }).setHeader('Authorization', 'Bearer ' + token), 'WRITE_FAILED');
        return snapshot(data, payload.expectedRevision);
      }
    };

    function onAuthStateChange(callback) {
      if (typeof callback !== 'function') throw new TypeError('An auth state observer is required.');
      let active = true;
      const { data } = client.auth.onAuthStateChange((event, session) => {
        if (!active) return;
        // Do not await or invoke another SDK auth method while its auth lock is
        // held. Observers that need SDK work must schedule it after this call.
        try { callback(event, publicSession(session)); } catch (_) { /* An observer must not interrupt the SDK. */ }
      });
      return () => {
        if (!active) return;
        active = false;
        data.subscription.unsubscribe();
      };
    }

    return {
      transport,
      getSession,
      onAuthStateChange,
      async signIn(email, password) {
        const data = await request(() => client.auth.signInWithPassword({ email, password }));
        return publicSession(data?.session);
      },
      async signUp(email, password, redirectTo) {
        const data = await request(() => client.auth.signUp({
          email, password, options: { emailRedirectTo: redirectTo }
        }));
        // A successful signup can return a user without a session while email
        // confirmation is pending. That user is not signed in yet.
        return publicSession(data?.session);
      },
      async sendPasswordReset(email, redirectTo) {
        await request(() => client.auth.resetPasswordForEmail(email, { redirectTo }));
      },
      async updatePassword(password, expectedUserId) {
        const token = await requireUser(expectedUserId);
        if (!authBase || !publishableKey || typeof fetchRequest !== 'function') throw problem('AUTH_FAILED');
        // updateUser() uses the shared SDK's current session, which can change
        // after a recovery form opens. This one Auth API request must stay bound
        // to the checked account; token refresh remains entirely with the SDK.
        await request(async () => {
          const response = await fetchRequest(authBase + '/auth/v1/user', {
            method: 'PUT', credentials: 'omit', cache: 'no-store',
            headers: { 'Content-Type': 'application/json', apikey: publishableKey, Authorization: 'Bearer ' + token },
            body: JSON.stringify({ password })
          });
          const data = await response.json();
          if (!response.ok) return { data: null, error: { code: data?.error_code || data?.code, status: response.status } };
          if (data?.id !== expectedUserId) throw problem('INVALID_RESPONSE');
          return { data: {}, error: null };
        });
      },
      async signOut() {
        await request(() => client.auth.signOut({ scope: 'local' }));
      }
    };
  }

  if (typeof module === 'object' && module.exports) module.exports = { createSupabaseArchiveProvider };
  else root.createSupabaseArchiveProvider = createSupabaseArchiveProvider;
})(typeof globalThis === 'object' ? globalThis : this);
