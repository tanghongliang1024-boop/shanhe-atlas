# 山河足迹 · Supabase 云端存档部署

网页继续托管在 GitHub Pages；Supabase 负责邮箱密码登录和每位用户的独立存档。游客先在浏览器本地记录，需要云端保存时才注册或登录；本机游客模式不创建 Supabase 匿名账号。访客不需要 GitHub 账号。本目录提供可审查的数据库迁移；**保存这些文件不会自动修改任何 Supabase 项目**。

当前项目为 `gxaeatehlgepgeuhhmll`，已应用迁移 `20261022040802_shanhe_private_archives`，实际 RLS/CAS 验证通过，远端 Security/Performance Advisor 均为 0 项。Email provider、注册、邮箱验证及精确的 Site URL/Redirect URL 配置均已确认，匿名登录关闭。Gmail SMTP 已完成真实注册验证邮件投递，用户自行完成邮箱验证与登录；真实账号已保存城市记录，同浏览器新标签页恢复后与数据库一致。跨设备、密码找回及多账号完整端到端流程仍未实测。本轮游客保存与双密码注册流程已通过本地验收，正在准备发布；详见 [部署状态](DEPLOYMENT-STATUS.md)。下列步骤用于检查和后续维护，不要求在已迁移的项目重复执行 SQL。

## 1. 先准备邮箱注册与验证

在网站所有者选定的 Supabase 项目中启用 Email provider 和新用户注册，保持 **Confirm email 开启**，不启用匿名登录。用户注册后先验证邮箱，再使用邮箱和密码登录。[Supabase 邮箱密码登录说明](https://supabase.com/docs/guides/auth/passwords)

本轮界面行为：用户点击“保存到云端”时默认显示注册，也可切换登录。注册时两次密码必须一致，前端校验通过后才发出注册请求。保存意图与目标邮箱绑定，不能把在一个邮箱下发起的游客草稿上传到后来切换的另一个账号。本地自动化验证已通过，发布后的真实邮件链路仍需另行验收。

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

本轮游客存储由 `guest-store.js` 管理，使用独立的 `localStorage` 键 `shanhe-atlas-guest-v1`，与旧版 `shanhe-atlas-v1` 和 SDK 的登录会话分开。游客可标记、编辑、删除、填写日期与笔记及导出，刷新后恢复；清理浏览器或换设备无法自动取回未上传草稿。游客操作不调用匿名数据库写入，也不改变当前数据库 RLS 与保存 RPC。

游客转云端必须由用户明确发起“保存到云端”。同一邮箱完成确认或登录后，先成功读取云端存档，再通过现有 CAS 协议提交合并结果；已有同城记录以云端为准。错误或版本冲突时保留草稿与重试入口；服务端确认成功后，只有当草稿仍与提交时的快照一致，才可清理该草稿。如果保存期间发生新增编辑，必须保留这些编辑。单纯登录或切换账号不会自动授权草稿上传。以上为本轮流程约定，验收情况以部署状态中的本轮检查项为准。

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

旧版 `shanhe-atlas-v1` 本地历史仍通过用户点击“导入本机足迹”后再提交：只添加云端没有的城市，同城以云端为准，并保留原本地备份。它与本轮游客草稿的主动保存流程分开。账号切换后重新读取对应账号的云端档案，不能复用上一账号的存档或未完成保存请求。

## 5. 数据库测试与发布验证

开发仓库中的 `supabase/tests/archives.test.mjs` 在隔离的 PGlite PostgreSQL 中实际执行迁移，模拟 Supabase 的 `auth.users`、`auth.uid()` 和数据库角色。它不访问真实 Supabase 项目，也不会发送邮件。静态网页发行包不包含测试或模拟工具；以下命令只适用于完整开发仓库。

可将官方测试依赖安装到仓库外的临时目录后运行，例如 PowerShell：

```powershell
npm install --prefix ../.sql-test-deps --no-save --ignore-scripts @electric-sql/pglite@0.5.11
$env:PGLITE_PACKAGE_DIR = (Resolve-Path ../.sql-test-deps/node_modules/@electric-sql/pglite).Path
node --test supabase/tests/archives.test.mjs
```

已验证 PGlite 0.5.11 / PostgreSQL 18.6：14 项数据库子测试通过，涵盖 RLS、公开 invoker/私有 definer 分层、私有 schema 权限、匿名禁止、跨账号访问禁止、CAS、缺失存档的非零初始版本、非法输入、台湾迁移回滚与成功、用户删除级联。PGlite 使用单数据库连接；相同版本的竞争请求测试验证版本保护逻辑，不替代远端 PostgreSQL 多连接压力测试。[PGlite 官方使用说明](https://pglite.dev/docs/)

既有线上版已完成真实用户注册、邮箱确认、登录、云端保存及同浏览器新标签页恢复。本轮由独立审核者完整复跑的 69 项测试全部通过，覆盖游客存储、双密码拦截、绑定邮箱的主动保存、合并冲突与失败重试、并发编辑后草稿保留、账号切换及旧记录隔离；实际浏览器确认未登录保存日期与笔记后刷新可恢复，390 × 844 手机注册界面的确认密码必填且按钮完整可见。本轮发布尚待完成，真正的跨设备、密码重置和多账号完整端到端流程尚未实测，不能用本地模拟或同浏览器新标签页恢复替代。
