# 中国地图数据说明

整理日期：2026-10-22。按用户更正，**县区细化仅适用于中国大陆（含海南）**；台湾恢复上一版 22 个县市，香港、澳门分别恢复为一个整体记录单位。世界地图数据另行维护。

## 来源与署名

大陆及港澳边界沿用原应用的阿里云 DataV GeoAtlas 数据，公开下载入口为 [DataV 地理小工具](https://datav.aliyun.com/portal/school/atlas/area_selector)，接口为 `https://geo.datav.aliyun.com/areas_v3/bound/<行政区划代码>_full.json`。大陆按省、地级市读取县区边界；港澳复用旧版 `assets/cities.json` 的整体边界。原始边界版权归原权利人所有；未将其重新声明为 MIT、CC 或公共领域数据。[阿里云区域热力层文档](https://help.aliyun.com/zh/datav/datav-7-0/user-guide/choropleth-layers-of-v3-x)介绍下载 GeoJSON、提取到区县以及保存至自己的服务器的用法。响应没有给出统一边界生效日期，下载日期不代表行政区划生效日期。

台湾边界直接复用上一版 `assets/taiwan-counties.json` 的 22 个县市、名称及 `tw-` 五位代码。原始提供者为 **內政部國土測繪中心**：[直轄市、縣市界線（TWD97 經緯度）](https://data.gov.tw/dataset/7442)，版本 `COUNTY_MOI_1140318`，依[政府資料開放授權條款－第1版](https://data.gov.tw/license)使用。简化与 GeoJSON 转换来自 [plotdb/pdmaptw v2.4.0](https://github.com/plotdb/pdmaptw/tree/v2.4.0) 的 [county-2025-03-18.geojson](https://github.com/plotdb/pdmaptw/releases/download/v2.4.0/county-2025-03-18.geojson)。資料來源：內政部國土測繪中心；本应用进一步适配字段、显示字形、精度和绘图环方向，提供机关未替本应用背书。原版说明保留在 `assets/TAIWAN-DATA-SOURCES.md`。

先前 368 个台湾乡镇市区来源为同一项目的 [town-2025-03-18.geojson](https://github.com/plotdb/pdmaptw/releases/download/v2.4.0/town-2025-03-18.geojson)，原始资料为[鄉鎮市區界線](https://data.gov.tw/dataset/7441)。该细分数据现在仅用于旧存档父子关系追溯及离岛去重，不再作为可记录的地图单位。香港 18 区和澳门 8 分区来源也仅保留作向旧层级恢复的依据。

下载 URL、原始响应 SHA-256、字节数及旧版本地数据文件哈希记录在 `china-source-manifest.json`。原始下载缓存位于发布目录之外。

## 覆盖与层级

34 个省级包共 **2,871 个可记录单位**：大陆 2,847 个、台湾 22 个县市、香港 1 个整体、澳门 1 个整体。大陆包含四个按市本级记录的单位：东莞、中山、儋州、嘉峪关，其余采用县、区或县级市粒度。这里的数量是来源快照的应用单位数，不是现行法定区划统计。

台湾 `levelNote` 为“县市”，港澳为“特别行政区整体”。应用内部沿用 `level: "city"` 表示这些旧版记录单位；这个字段不宣称特别行政区属于地级市。大陆县级单位采用 `level: "county"`。

两个边界来源对部分离岛存在重复。金门、马祖等离岛只在台湾县市包中提供一次，福建包去除重复的金门县总图形及连江、长乐、秀屿的重复离岛图形。原先乡镇边界仅用于识别重复区域，现地图仍按县市整体展示。处理明细见源文件清单中的 `deduplicated`。

DataV 快照可能没有反映近期区划变化。九江市政府现址的地址来源标注浔阳区，而 DataV 快照在该点仍显示濂溪区；迁移条目保留差异说明，政府驻地不由多边形包含关系推断。

## 文件与 ID

`china-index.json` 保存轻量 Feature 列表（`geometry: null`）和省包清单。点击省份后加载 `china/<provinceCode>.geo.json`，属性与索引一致。34 个省包的文件名保持不变，包括 `china/710000.geo.json`、`china/810000.geo.json`、`china/820000.geo.json`。

大陆与港澳 ID 是字符串形式的六位代码；台湾县市 ID 是 `tw-` 加五位县市代码。香港为 `810000`，澳门为 `820000`。`center` 是小旗的区域内部显示位置，不代表政府地址。

## 存档转换

`county-migration-map.json` 仅将大陆旧地市 ID 映射到有来源证实的政府驻地区，保留 URL、地址、核实日期及说明。台湾 22 县市与港澳 2 个整体 ID 均为 `unchanged` 的同 ID 映射，原先台北、南投、屏东、高雄、台南向下细分的规则已停止。未核实的大陆旧记录仍在 `unresolved`，保留原记录等待整理。

新增 `region-level-reversal-map.json` 提供 **394 条恢复对应关系**：368 台湾乡镇市区 → 22 县市、18 香港分区 → 香港整体、8 澳门分区 → 澳门整体。条目包含 `targetId`、`targetName`、`parentName`、`sourceName`、`sourceProvince`、`source`、`verified` 与关系说明。

该文件只提供行政父子对应关系，不决定冲突处理。执行存档恢复时必须保存原始备份；同一县市存在多个细分记录或已有县市记录时，不得直接覆盖任何日期或笔记。存档模块负责无损合并、冲突记录和用户后续整理。

## 重建与验证

在仓库根目录使用 Node.js：

```sh
node scripts/china-build-data.cjs
node scripts/china-build-migration.cjs
node scripts/china-validate.cjs
```

数据脚本优先使用仓库相邻的 `china-data-cache` 原始缓存，直接复用上一版台湾县市和港澳整体输入。重建同时生成恢复对应关系，不会再次将台湾、港澳向下细分。

验证检查 2,871 个 ID 唯一、索引和几何一致、闭合及有限坐标、D3 球面环方向、旗标落点、34 包及恢复后数量、离岛重复、迁移目标、47 个已有记录 ID 的处理，以及 394 条恢复关系全部指向现存父级单位。存档合并和数据库权限由独立测试覆盖。
