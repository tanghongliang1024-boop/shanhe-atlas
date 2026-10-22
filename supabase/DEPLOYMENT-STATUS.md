# 云端存档部署状态

记录日期：2026-10-22（Asia/Shanghai）。这是本轮部署与验收记录，不是自动生成的线上健康状态。

**当前状态：云端版已发布，可公开访问测试。** Pages 工作流及静态文件核对已通过，手机注册界面已验证。Gmail SMTP 配置已保存并经控制台重新加载确认；目前等待用户自行完成首次真实注册、收取验证邮件和登录，尚未确认实际邮件送达、跨设备保存或完整 Auth 流程。

## 目标环境

- GitHub 仓库：<https://github.com/tanghongliang1024-boop/shanhe-atlas>
- Pages 网址：<https://tanghongliang1024-boop.github.io/shanhe-atlas/>
- Supabase 项目：`gxaeatehlgepgeuhhmll`
- 公开项目 URL：`https://gxaeatehlgepgeuhhmll.supabase.co`
- 开发分支：`codex/cloud-archives`
- 已发布提交：[`f00ab9c75d3e20af57881fd871013b71478f8de8`](https://github.com/tanghongliang1024-boop/shanhe-atlas/commit/f00ab9c75d3e20af57881fd871013b71478f8de8)
- 已成功的 Pages 工作流：[`39727042583`](https://github.com/tanghongliang1024-boop/shanhe-atlas/actions/runs/39727042583)
- 已应用的远端迁移版本：`20261022040802`，名称：`shanhe_private_archives`
- 对应源码迁移：[`migrations/20261022040802_shanhe_private_archives.sql`](migrations/20261022040802_shanhe_private_archives.sql)

## 本轮已完成

- [x] GitHub Pages 已发布提交 `f00ab9c75d3e20af57881fd871013b71478f8de8`，工作流状态为 `completed / success`。
- [x] 2026-10-22 13:17（Asia/Shanghai）使用匿名 HTTP 请求正式地址，发布时的全部 23 个文件均返回 HTTP 200，SHA-256 与当时发行包一致，无缺失或额外文件；未使用缓存绕过参数。
- [x] 线上浏览器显示云端版界面和 391 个可标记地区，Supabase 未登录状态正常，无 JavaScript 错误；390 × 844 手机视口下登录/注册界面已检查并保存截图。
- [x] Supabase 项目已创建，数据库迁移已实际应用。
- [x] 浏览器配置已填写公开 URL 和 publishable key；它不是服务端 secret key。
- [x] Auth Site URL 和 Redirect URL 精确允许地址均已确认保存为 `https://tanghongliang1024-boop.github.io/shanhe-atlas/`。
- [x] Email provider 与 User Signups 已开启，Confirm email 开启；匿名登录关闭，GitHub/Google 登录提供方关闭。
- [x] Gmail 自定义 SMTP 配置已保存，重新加载控制台后确认仍启用；主机为 `smtp.gmail.com`、端口 `587`、发件人名称为“山河足迹”，发件人与用户名已填写，页面无待保存更改。SMTP 密码只存于服务端配置中。
- [x] 远端 Security Advisor：0 项提示。
- [x] 远端 Performance Advisor：0 项提示。
- [x] 在实际远端数据库验证了 RLS 访问隔离和 CAS 版本保存。
- [x] 前端保存等待服务端成功响应；冲突或失败保留输入，不显示保存成功。
- [x] 本机旧足迹由用户主动导入，保留本机备份，同城记录以云端为准。
- [x] 旧台湾整体记录整理在同一次保存中提交县市记录和旧记录移除，失败时保留旧记录。
- [x] D3 与固定版本 Supabase SDK 的许可文件已随源码保留。
- [x] 本地模拟后端下完成 390 × 844 手机版流程检查：旧足迹导入、台湾整理保存失败后保留原记录并可重试成功、城市版本冲突后读取最新存档、城市保存失败后保留输入并可重试成功、切换账号后当前账号记录为空。此项不等同于真实 Supabase 邮件 Auth 或跨设备验收。

上述远端数据库及 Advisor 结果由本轮部署执行者完成；打包过程不再次改动数据库，也不把它们替代为完整 Auth 验收。

## 公开测试待完成

- [ ] 实际发送并确认 Gmail SMTP 验证邮件与密码重置邮件可送达。
- [ ] 用普通非项目团队邮箱完成注册、验证邮件收取、确认链接返回网页和邮箱密码登录。
- [ ] 验证密码重置邮件、在发起请求的浏览器打开回跳链接、设置新密码及重新登录。
- [ ] 在两个实际账号间验证完整登录、退出与存档隔离。
- [ ] 在第二台设备登录同一账号，确认已保存的城市、日期和笔记可读取。
- [ ] 在真实账号中保存一条足迹，并在另一台设备读取、修改和重新读取，验证跨设备保存。
- [ ] 在实际登录状态下验证旧本机记录导入、跨页面版本冲突与断网失败提示。
- [ ] 在公开网址完成手机和桌面的完整流程检查后，将已通过项逐一记录为验收完成。

## 发行范围与敏感信息

发行包只收录运行页面、脚本、样式、地图数据、第三方 SDK/许可和部署说明；不收录 `.git`、测试目录、模拟 Auth/存储工具、预览服务、依赖安装目录或凭据文件。

可公开：Supabase Project URL、publishable key、地图数据及许可。不可进入发行包：SMTP 应用密码、数据库密码、Supabase secret/service-role key、访问令牌、真实用户会话、测试账号密码。发信配置缺失时不通过关闭邮箱验证绕过。

## 维护参考

- [Supabase 邮箱密码认证](https://supabase.com/docs/guides/auth/passwords)
- [Supabase 自定义 SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Auth 返回地址](https://supabase.com/docs/guides/auth/redirect-urls)
