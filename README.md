# 山河足迹 · 中国旅行地图

手机与桌面均可使用的静态旅行地图，支持城市插旗、城市着色、首次到访日期、旅行笔记和 CSV 导出。

## 发布到 GitHub Pages

1. 新建公开仓库（建议名称 `shanhe-atlas`）。
2. 将本文件夹中的全部文件上传到仓库根目录，确保根目录直接包含 `index.html` 和 `assets/`。
3. 在 Settings → Pages → Build and deployment 中选择 Deploy from a branch。
4. 选择 `main` 分支和 `/(root)` 文件夹，保存。
5. 等待 Pages 发布完成后，打开该页面给出的网址。

无需 Node.js、后端服务或自购云主机。所有资源路径兼容 GitHub Pages 的仓库子路径。

## 记录存储

足迹只保存到每位访问者自己的浏览器，清除浏览器数据会移除记录。无账号和跨设备同步。当前 Sites 地址下的记录不会自动转移到 GitHub Pages 的新域名。

## 数据和许可

边界与坐标来自阿里云 DataV：https://datav.aliyun.com/portal/school/atlas/area_selector 。当前包含 370 个可标记地区；直辖市和港澳按整体记录，台湾按全省整体记录，详见网页中的数据说明。

D3 许可见 `assets/D3-LICENSE.txt`。
