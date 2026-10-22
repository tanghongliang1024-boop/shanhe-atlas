# 云端存档部署状态

记录日期：2026-10-22（Asia/Shanghai）。这是本轮部署与验收记录，不是自动生成的线上健康状态。

**当前状态：本轮游客流程与注册双密码确认已通过本地验收，正在准备发布。** 既有云端版已通过真实注册、邮件验证、登录、云端存档及同浏览器新标签页恢复验收；真正的跨设备、密码找回及多账号完整端到端流程仍未实测。本地验收不代表本轮代码已上线或真实跨设备流程已通过。

## 目标环境

- GitHub 仓库：<https://github.com/tanghongliang1024-boop/shanhe-atlas>
- Pages 网址：<https://tanghongliang1024-boop.github.io/shanhe-atlas/>
- Supabase 项目：`gxaeatehlgepgeuhhmll`
- 公开项目 URL：`https://gxaeatehlgepgeuhhmll.supabase.co`
- 开发分支：`codex/cloud-archives`
- 已发布运行版提交：[`f00ab9c75d3e20af57881fd871013b71478f8de8`](https://github.com/tanghongliang1024-boop/shanhe-atlas/commit/f00ab9c75d3e20af57881fd871013b71478f8de8)
- 本轮发布基线（已发布文档更新）：[`82af6ac347c2fac54849835b982eb6eeb28189be`](https://github.com/tanghongliang1024-boop/shanhe-atlas/commit/82af6ac347c2fac54849835b982eb6eeb28189be)
- 已成功的 Pages 工作流：[`39727042583`](https://github.com/tanghongliang1024-boop/shanhe-atlas/actions/runs/39727042583)
- 已应用的远端迁移版本：`20261022040802`，名称：`shanhe_private_archives`
- 对应源码迁移：[`migrations/20261022040802_shanhe_private_archives.sql`](migrations/20261022040802_shanhe_private_archives.sql)

## 既有线上版已完成

- [x] GitHub Pages 已发布提交 `f00ab9c75d3e20af57881fd871013b71478f8de8`，工作流状态为 `completed / success`。
- [x] 2026-10-22 13:17（Asia/Shanghai）使用匿名 HTTP 请求正式地址，发布时的全部 23 个文件均返回 HTTP 200，SHA-256 与当时发行包一致，无缺失或额外文件；未使用缓存绕过参数。
- [x] 线上浏览器显示云端版界面和 391 个可标记地区，Supabase 未登录状态正常，无 JavaScript 错误；390 × 844 手机视口下登录/注册界面已检查并保存截图。
- [x] 文档更新提交 `82af6ac347c2fac54849835b982eb6eeb28189be` 已发布，工作流 `39727719987` 成功，三份线上文档与当时发行包哈希一致。
- [x] 用户自行完成真实邮箱注册、接收验证邮件、邮箱确认和登录；只读 Auth 检查确认邮箱已验证且已登录。
- [x] 真实账号已保存城市记录；同浏览器新标签页自动恢复会话并显示“云端存档已读取”，恢复后的记录与数据库一致。该结果不代表跨设备测试，个人使用统计仅保留在工作区的包外验收记录中。
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

## 本轮游客与注册改版本地验收

- [x] 独立审核者完整复跑 69 项测试，全部通过；覆盖游客本机存储、刷新恢复、版本保护、双密码校验、主动保存意图与账号隔离。
- [x] 自动化验证了绑定邮箱的主动上传、云端同城记录优先、失败重试、保存期间新增编辑的保留、异步账号切换及旧版记录隔离。
- [x] 实际本地浏览器验证未登录即可保存城市、首次到访日期和笔记，刷新后记录保留。公开文档不记录具体测试城市或用户数据。
- [x] 390 × 844 手机视口下地图显示正常；注册表单确认密码为必填，所有按钮完整可见，切换到登录模式后确认密码字段隐藏、停用且不再必填。
- [x] 本轮发行允许清单已确定为原 23 文件加 `guest-store.js`，共 24 文件；打包脚本检查资源引用、许可、凭据模式和 ZIP 内容哈希。
- [ ] 完成本轮 GitHub Pages 发布并核对工作流、线上 24 个文件及哈希。
- [ ] 在公开站点复核游客保存、刷新恢复与注册界面；真实邮件确认后的游客草稿上传另行验收。

## 其他真实端到端测试待完成

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
