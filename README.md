# 山河足迹 · 中国旅行地图

手机与桌面均可使用的旅行地图，支持城市插旗、城市着色、首次到访日期、旅行笔记和 CSV 导出。网页托管在 GitHub Pages，邮箱账号与个人云端存档由 Supabase 提供，同一账号可以在手机与电脑继续记录。

**云端版已发布，可在 [山河足迹](https://tanghongliang1024-boop.github.io/shanhe-atlas/) 公开访问测试。** Pages 工作流已成功，发布时 23 个文件均通过 HTTP 与哈希核对，手机注册界面已验证。Gmail SMTP 配置已保存；目前等待用户自行完成真实注册、收取验证邮件和登录，跨设备保存与密码重置等完整流程仍待验收。具体完成项与待办见 [部署状态](supabase/DEPLOYMENT-STATUS.md)。

## 账号与云端足迹

通过邮箱和密码注册，完成邮箱验证后登录。登录并成功读取存档后，可以添加或移除城市足迹、填写首次到访日期和旅行笔记。在另一台设备使用同一账号登录，或在“我的存档”中刷新，即可读取已保存的足迹。

保存会等待服务器确认，页面显示“已保存到云端”才表示成功。网络失败时保留当前输入；两个页面从同一版本编辑时，版本检查（CAS）只允许其中一次保存成功，另一处提示刷新后重新编辑，不会静默覆盖较新的记录。切换或退出账号会清空页面中的当前存档，避免把上一账号的记录显示给下一账号。

每份存档按登录用户隔离。前端只包含公开的项目 URL 和 publishable key；数据库密码、服务端密钥和 SMTP 密码不属于网页配置。

## 旧版本机记录

旧版本地足迹仍保留在原浏览器。登录后，在“我的存档”点击“导入本机足迹”，才会将本机记录保存到当前账号；只补充云端没有的城市，同城以云端记录为准，原本机备份保留。

导入只能读取当前网站域名下、当前浏览器保存的旧记录。原 Sites 地址的本机数据不会自动转移到 GitHub Pages，也不会因登录而自动上传。CSV 导出用于另存备份；当前没有 CSV 导入功能。成功保存到云端的足迹在清理本机浏览器数据后仍可重新登录读取，但未导入的本机旧记录可能丢失。

## 发布到 GitHub Pages

1. 先按 [Supabase 部署说明](supabase/README.md) 完成数据库、邮箱验证、自定义 SMTP 和 Auth 返回地址配置，并核对 [部署状态](supabase/DEPLOYMENT-STATUS.md) 中的配置检查项。
2. 检查 `cloud-config.js` 只包含目标项目的公开 URL 与 publishable key。当前项目为 `gxaeatehlgepgeuhhmll`；不要把密码或私密密钥写入这个文件。
3. 将发行包中的文件放到 GitHub 仓库根目录，确保根目录直接包含 `index.html`、`.nojekyll` 和 `assets/`。开发用测试、预览服务和模拟登录工具不属于发行包。
4. 在 Settings → Pages → Build and deployment 中选择 Deploy from a branch，选择 `main` 分支与 `/(root)` 文件夹并保存。
5. 等待 Pages 工作流成功，再在公开网址验证注册、邮箱回跳、登录、保存和跨设备读取。

目标网址：<https://tanghongliang1024-boop.github.io/shanhe-atlas/>。静态网页无需 Node.js 运行服务或自购云主机，所有资源路径兼容仓库子路径；账号和存档功能需要可用的 Supabase 项目及邮件服务。

## 数据和许可

边界与坐标来自阿里云 DataV：https://datav.aliyun.com/portal/school/atlas/area_selector 。当前包含 391 个可标记地区；直辖市和港澳按整体记录，台湾细分为 22 个县市（含澎湖、金门、连江），详见网页中的数据说明。

台湾县市边界采用 2025-03-18 官方数据的网页简化版本，来源及授权见 [台湾县市数据说明](assets/TAIWAN-DATA-SOURCES.md)。支持简繁体名称搜索，点击地图下方“台湾县市”可快速放大。

旧版台湾整体足迹会显示待整理提示；用户选择对应县市后，原日期和记忆完整保留，已有县市记录不会被覆盖。未整理的旧记录仍可导出。

D3 许可见 [D3-LICENSE.txt](assets/D3-LICENSE.txt)。Supabase 浏览器 SDK 固定为 `2.118.0` 并随网页打包，许可见 [SUPABASE-LICENSE.txt](assets/SUPABASE-LICENSE.txt)。
