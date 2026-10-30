# 山河足迹 · Supabase 云端存档部署

网页托管在 GitHub Pages；Supabase 提供邮箱登录和独立云端存档。访客无需 GitHub 账号，可以先临时记录，再登录或注册。家长登录后可管理最多 4 位旅行成员；孩子只需昵称，不需要邮箱。

当前维护项目为 gxaeatehlgepgeuhhmll。本目录保存可审查的 SQL，**提交这些文件不会自动修改数据库**。上线状态应以项目迁移记录、发布结果和实际核验为准；旧版验收文档只用于追溯。

## 当前协议：2.4.0 地市级地图

大陆（含海南）按地市记录，台湾保留 22 个县市，香港、澳门整体记录。县区回迁的部署顺序、碰撞处理、完整备份及恢复限制见 [行政层级升级说明](WORLD-MIGRATION.md)。

| 存档 | 数据表 | 当前保存 RPC | 返回值 |
| --- | --- | --- | --- |
| 默认成员“我”的地区 | shanhe_archives | shanhe_save_archive_v4(p_records,p_expected_revision) | {records,revision} |
| 默认成员“我”的景点 | shanhe_landmark_archives | shanhe_save_landmark_archive(p_records,p_expected_revision) | {records,revision} |
| 家庭成员信息和孩子的地区、景点 | shanhe_family_archives | shanhe_save_family_archive_v2(p_document,p_expected_revision) | {document,revision} |

旧地区 v1/v2/v3 和旧家庭保存 RPC 返回 CLIENT_UPDATE_REQUIRED；应提示刷新网页或升级 APK，保留当前输入，不显示保存成功。默认成员的旧记录仍在原表中，家庭文档不复制默认成员的地区或景点。

## 数据库安装与升级

新建空数据库时，依序审查并应用 migrations/ 下的文件：

1. 20261022040802_shanhe_private_archives.sql
2. 20261022090551_shanhe_world_counties_v2.sql
3. 20261022101828_shanhe_region_levels_v3.sql
4. 20261028093757_shanhe_landmark_archives.sql
5. 20261028100923_shanhe_family_archives.sql
6. 20261028104048_shanhe_china_prefectures_v4.sql

已有项目先核对迁移历史和当前结构，只应用尚未执行的增量，不能删除原存档重建。历史县区、台湾及海外迁移的额外数据整理步骤见 [WORLD-MIGRATION.md](WORLD-MIGRATION.md)。每次完成数据库变更后运行 Security Advisor，并验证实际 RLS、RPC 权限及 Data API 暴露设置。

三张公开存档表均开启 RLS，只允许登录用户读取 auth.uid() 对应行。浏览器不能直接 INSERT、UPDATE 或 DELETE，只能经校验后的 RPC 保存。公开 RPC 为 SECURITY INVOKER 包装；必要的 SECURITY DEFINER 实现放在 shanhe_private，固定空 search_path，以 auth.uid() 为唯一所有者来源。私有备份和管理员迁移函数没有客户端权限。

Data API 的 Exposed schemas 应包含 public，**不包含 shanhe_private**。不得通过暴露私有 schema 或授予匿名权限来修复客户端错误。[Supabase RLS 说明](https://supabase.com/docs/guides/database/postgres/row-level-security)

## 邮箱注册和公开连接信息

启用 Email provider、新用户注册与邮箱确认；游客临时使用不需要 Supabase 匿名登录。配置可用的自定义 SMTP 并验证实际邮件投递。SMTP 密码由所有者保存在 Supabase 配置中，不写入源码。[SMTP 配置说明](https://supabase.com/docs/guides/auth/auth-smtp)

正式 Site URL 和 Redirect URLs 使用 https://tanghongliang1024-boop.github.io/shanhe-atlas/ 。Android 和本地开发只添加实际使用的准确返回地址，不放宽为任意域名。[返回地址说明](https://supabase.com/docs/guides/auth/redirect-urls)

点击“保存到云端”默认打开登录页，新用户可以切换注册。注册需两次输入相同密码，成功后关闭注册窗口并明确提示邮箱验证。保存意图与填写的邮箱绑定；单纯切换账号不会把上一个账号或其他邮箱的草稿上传。

网页提供“输入邮箱验证码”入口，使用 `verifyOtp({ email, token, type: 'email' })` 验证注册邮件中的验证码；返回真实会话、匹配邮箱及服务端邮箱确认时间后才显示成功。验证码不进入 URL、存储或日志。注册后仅记住待验证邮箱，供刷新后继续；验证码验证和密码登录均保留原有游客转存与账号隔离保护。

在 Authentication → Emails → Confirm sign up 中，将主题设置为“山河足迹 · 邮箱验证码”，正文使用本目录的 [confirm-signup.html](confirm-signup.html)。本项目 Email OTP length 为 8，expiration 为 3600 秒；模板与网页输入规则必须和这两项配置一致。模板仅包含 `{{ .Token }}` 与不带凭据的 `{{ .SiteURL }}?auth=verify` 入口，打开页面不自动验证、不自动发信，避免邮箱链接预读消耗验证码。旧邮件的验证链接仍兼容，过期或失败时会显示提示。[Supabase 邮件模板与 OTP](https://supabase.com/docs/guides/auth/auth-email-templates#email-prefetching)

先部署并确认新版网页可用，再更新邮件模板。无需更改邮箱确认开关、密码规则、数据库或 RLS。真实验收须由邮箱持有人使用最新验证码，并核对后台 `email_confirmed_at` 与实际登录状态；本地模拟和自动化测试不代表真实投递已完成。

前端配置只含项目 URL 和 publishable key。service_role、secret key、数据库密码、SMTP 密码和 Android 签名私钥都不得进入网页或公开源码。

## 版本保护与本机草稿

读取存档必须先处理查询错误，只有成功且没有数据行时才解释为首次使用，不能将网络或权限错误当成空存档。保存请求携带打开表单时的版本：首次预期 0，成功创建版本 1，以后每次成功加 1。CAS 使用原子 INSERT ... ON CONFLICT ... WHERE revision = expected；过期编辑不会覆盖另一设备的修改。

| 错误 | 处理 |
| --- | --- |
| 40001 / REVISION_CONFLICT | 保留表单，读取最新记录后重新编辑 |
| 22023 / CLIENT_UPDATE_REQUIRED | 提示更新客户端，保留输入 |
| 22023 / INVALID_RECORDS、INVALID_DOCUMENT、INVALID_REVISION | 不保存，保留输入并核对数据 |
| 42501 / AUTH_REQUIRED | 登录后重新读取 |
| 网络或其他错误 | 不报告成功，允许重试 |

地区整档最多 10,000 条、16 MiB；接受中国六位编号、台湾 tw- 编号及稳定的 world: 编号。地区记录保存 visited:true、真实日期或空日期、最多 600 个 UTF-16 单元的笔记，以及可选有效 ISO 更新时间。景点使用 poi: 编号和 visited / wish 状态。家庭文档最多 4 人、每人不同昵称与颜色，最多 16 MiB；取消一人的记录不改变其他人的记录，当前不支持删除整位成员。

游客地区键为 shanhe-atlas-guest-v5，首次从 v4 或更早版本读取时完成地市归档，原本地键保持完整。当前 v5 与已迁移云端不会重复归档，因此取消城市后不会由历史县区恢复。景点仍使用独立的游客存档。

游客转云端先读取目标账号，再合并缺失地区；已有不同内容的记录不覆盖，冲突草稿保留。服务器确认后，仅当当前草稿仍与提交快照一致时清理已上传部分。账号或成员切换会使旧表单和迟到响应失效。

## 验证

本地 PGlite 测试使用虚构用户，不连接生产数据库、不发送邮件。在开发仓库运行 node --test tests/*.test.cjs supabase/tests/*.test.mjs。

数据库测试依赖 @electric-sql/pglite；可通过 PGLITE_PACKAGE_DIR 指向仓库外的安装目录。prefectures-v4.test.mjs 的 12 项测试覆盖完整迁移、2,813 条映射与浏览器一致性、备份、原字段保留、成员隔离、旧协议拒写、CAS、幂等和失败回滚。

发布后还应检查线上新资源、真实账号读取和手机页面。生产数据审计只输出条数、版本和一致性汇总，不导出用户日期、笔记、邮箱或登录凭据。不要把本地模拟成功当作真实邮件或跨设备流程已经通过。
