# 山河足迹 · Supabase 云端存档部署

网页继续托管在 GitHub Pages；Supabase 负责邮箱密码登录和每位用户的独立存档。访客不需要 GitHub 账号。本目录提供可审查的数据库迁移；**保存这些文件不会自动修改任何 Supabase 项目**。

当前项目为 `gxaeatehlgepgeuhhmll`，本轮已应用迁移 `20261022040802_shanhe_private_archives`，实际 RLS/CAS 验证通过，远端 Security/Performance Advisor 均为 0 项。Email provider、注册、邮箱验证及精确的 Site URL/Redirect URL 配置均已确认，匿名登录关闭。Gmail SMTP 配置已保存并经控制台重新加载确认。云端版已通过 GitHub Pages 发布，静态文件与手机注册界面检查通过；目前等待用户自行完成真实注册、邮件验证和登录，实际邮件送达、跨设备保存及完整 Auth 流程仍待验收。详见 [部署状态](DEPLOYMENT-STATUS.md)。下列步骤用于检查和后续维护，不要求在已迁移的项目重复执行 SQL。

## 1. 先准备邮箱注册与验证

在网站所有者选定的 Supabase 项目中启用 Email provider 和新用户注册，保持 **Confirm email 开启**，不启用匿名登录。用户注册后先验证邮箱，再使用邮箱和密码登录。[Supabase 邮箱密码登录说明](https://supabase.com/docs/guides/auth/passwords)

对普通访客开放注册之前，必须配置可用的**自定义 SMTP**，并完成邮件服务商要求的发信域名/发件人验证。Supabase 默认发信服务只面向项目团队预授权地址，不能据此认为公众能收到注册验证和重置密码邮件。SMTP 密码只填在 Supabase 的 Auth 配置中，不放到代码仓库或网页中；不要通过关闭邮箱验证来绕过发信配置。[Supabase 自定义 SMTP 说明](https://supabase.com/docs/guides/auth/auth-smtp)

在 Authentication → URL Configuration 配置：

- Site URL：`https://tanghongliang1024-boop.github.io/shanhe-atlas/`
- Redirect URLs：加入相同的完整地址，供邮箱确认和重置密码返回网页。
- 本地开发仅另外加入实际使用的本地地址；正式环境使用准确地址，不放宽为任意域名。

网页发送邮件时的 `emailRedirectTo` / `redirectTo` 应与上述允许地址一致。[Supabase 返回地址说明](https://supabase.com/docs/guides/auth/redirect-urls)

## 2. 审查并执行数据库迁移

连接并确认目标项目后，在该项目 SQL Editor 执行一次：

[`migrations/20261022040802_shanhe_private_archives.sql`](migrations/20261022040802_shanhe_private_archives.sql)

也可通过团队已有的 Supabase CLI migration 流程执行。脚本包含事务，仅创建本应用的 `public.shanhe_archives`、读取策略、`public.shanhe_save_archive` 包装函数，以及 `shanhe_private` 私有 schema 和内部保存函数，不修改其他业务表。它不是重复执行的配置脚本：如果同名表或 schema 已经存在，先检查迁移记录和现有结构，再决定后续增量迁移，勿删除已有存档来重跑。

存档表包含 `user_id`、`records`、`revision`、`updated_at`。每个账号只有一行，删除对应 Auth 用户时才级联删除该行。普通登录用户只能读取自己的行，不能直接 INSERT、UPDATE 或 DELETE；匿名角色无读取和保存权限。

公开的 `public.shanhe_save_archive` 是 **SECURITY INVOKER** 包装，只调用 `shanhe_private.shanhe_save_archive`。后者才是执行校验与原子保存的 **SECURITY DEFINER** 实现，位于不对 Data API 暴露的私有 schema。两个函数都固定空 `search_path`；内部函数仍以 `auth.uid()` 确定所属用户，不接受用户 ID 参数。[Supabase 函数权限说明](https://supabase.com/docs/guides/database/functions)

`authenticated` 仅获得私有 schema 的 USAGE 和内部函数的 EXECUTE，供 invoker 包装调用；它没有该 schema 的 CREATE 权限，也没有表的直接写权限。`PUBLIC`、`anon` 的 schema/函数访问权限均被撤销。这些 SQL 权限不等于向 Data API 暴露 schema；即使通过 SQL 直接调用内部函数，身份与版本校验也完全相同。

应用迁移前后，在 Supabase Data API 设置中确认 **Exposed schemas 包含 `public`，不包含 `shanhe_private`**。不要为了修复 RPC 访问错误把私有 schema 加入暴露列表，也不要额外授予匿名角色权限。真实项目完成迁移后运行 Security Advisor，并检查公开 RPC 可用、私有 schema 的 API 请求不可用；本地 PGlite 只能验证 SQL 权限，不能验证项目的 PostgREST 配置。[Supabase 自定义 schema 与 API 暴露说明](https://supabase.com/docs/guides/api/using-custom-schemas)

## 3. 配置网页的公开连接信息

前端只需要此项目的 Project URL 和 **publishable key**（或旧版公开 `anon` key）。它们配合用户登录会话和数据库权限访问数据。`service_role`、secret key、数据库连接密码和 SMTP 密码都不能进入静态网页或公开 GitHub 仓库。

配置完成后再发布云端版网页。不要在数据库迁移、邮件验证或连接信息缺失时，把界面上的“云端已保存”当作部署完成。

## 4. 前端存储协议

读取已登录用户本人：

```js
const { data, error } = await supabase
  .from('shanhe_archives')
  .select('records,revision')
  .eq('user_id', user.id)
  .maybeSingle();

if (error) throw error;
// 只有查询成功且无行时，才解释为首次使用。
const archive = data ?? { records: {}, revision: 0 };
```

必须先处理查询 `error`，不能把网络错误或权限错误当成空存档。查询中的用户 ID 仅用于缩小查询范围，实际读取隔离仍由 RLS 执行。

保存整档：

```js
const { data, error } = await supabase.rpc('shanhe_save_archive', {
  p_records: nextRecords,
  p_expected_revision: revisionWhenTheFormOpened
});
```

成功返回 `{ records, revision }`；首次保存从预期版本 `0` 创建版本 `1`，后续每次成功递增 `1`。两个页面从同一版本编辑时，只允许其中一个提交成功。函数用 `INSERT ... ON CONFLICT ... DO UPDATE ... WHERE revision = expected` 执行比较与更新；无匹配版本或首次写入却传了非零版本时，整个调用回滚。[PostgreSQL ON CONFLICT 说明](https://www.postgresql.org/docs/current/sql-insert.html)

错误映射：

| SQLSTATE / message | 前端处理 |
| --- | --- |
| `40001` / `REVISION_CONFLICT` | 映射为 `CONFLICT`；保留表单，提示刷新后重新编辑，不自动覆盖 |
| `22023` / `INVALID_RECORDS` | 数据校验失败，保留输入 |
| `22023` / `INVALID_REVISION` | 缺失或非法版本，重新读取后编辑 |
| `42501` / `AUTH_REQUIRED` | 登录身份缺失，重新登录 |
| 网络或其他错误 | 不显示保存成功，保留输入供重试 |

整档最多 450 条、序列化后最多 2 MiB。城市编号只允许六位数字或 `tw-` 加五位数字；每条记录只允许 `visited: true`、真实的 `YYYY-MM-DD` 或空日期、不超过 600 字符的 `note`、可选的有效 ISO `updatedAt`。笔记同时遵循网页的 600 个 UTF-16 单元限制，避免包含 emoji 的远端数据无法被前端读取。旧 `710000` 记录继续合法，归入台湾县市时，将新增县市键与删除旧键一起保存，服务器确认前不移除旧记录。

本地历史通过用户点击“导入本机足迹”后再提交：只添加云端没有的城市，同城以云端为准，并保留原本地备份。登录账号切换后清空内存状态，重新读取该账号的云端档案。

## 5. 数据库测试与发布验证

开发仓库中的 `supabase/tests/archives.test.mjs` 在隔离的 PGlite PostgreSQL 中实际执行迁移，模拟 Supabase 的 `auth.users`、`auth.uid()` 和数据库角色。它不访问真实 Supabase 项目，也不会发送邮件。静态网页发行包不包含测试或模拟工具；以下命令只适用于完整开发仓库。

可将官方测试依赖安装到仓库外的临时目录后运行，例如 PowerShell：

```powershell
npm install --prefix ../.sql-test-deps --no-save --ignore-scripts @electric-sql/pglite@0.5.11
$env:PGLITE_PACKAGE_DIR = (Resolve-Path ../.sql-test-deps/node_modules/@electric-sql/pglite).Path
node --test supabase/tests/archives.test.mjs
```

已验证 PGlite 0.5.11 / PostgreSQL 18.6：14 项数据库子测试通过，涵盖 RLS、公开 invoker/私有 definer 分层、私有 schema 权限、匿名禁止、跨账号访问禁止、CAS、缺失存档的非零初始版本、非法输入、台湾迁移回滚与成功、用户删除级联。PGlite 使用单数据库连接；相同版本的竞争请求测试验证版本保护逻辑，不替代远端 PostgreSQL 多连接压力测试。[PGlite 官方使用说明](https://pglite.dev/docs/)

上线验收仍需在实际项目完成：普通非团队邮箱注册与验证、邮箱密码登录、密码重置、两账号隔离、第二台设备读取相同足迹、旧表单冲突提示、断网不误报成功。数据库测试不代表邮件投递、Auth 返回页面或公开站点已完成联调。
