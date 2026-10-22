# 中国县区地图数据说明

整理日期：2026-10-22。此应用使用分级边界快照展示旅行记录；数据发布日期、行政层级与边界精度均按来源说明。

## 来源与署名

大陆及港澳边界沿用原应用的阿里云 DataV GeoAtlas 数据，公开下载入口为 [DataV 地理小工具](https://datav.aliyun.com/portal/school/atlas/area_selector)，接口为 `https://geo.datav.aliyun.com/areas_v3/bound/<行政区划代码>_full.json`。本次按省、地级市读取县区边界。原始边界版权归原权利人所有；未将其重新声明为 MIT、CC 或公共领域数据。[阿里云区域热力层文档](https://help.aliyun.com/zh/datav/datav-7-0/user-guide/choropleth-layers-of-v3-x)介绍下载 GeoJSON、提取到区县以及保存至自己的服务器的用法。数据服务没有在响应中给出统一边界生效日期，下载日期不代表行政区划生效日期。

台湾乡镇市区原始资料由 **內政部國土測繪中心** 提供：[鄉鎮市區界線（TWD97經緯度）](https://data.gov.tw/dataset/7441)，依[政府資料開放授權條款－第1版](https://data.gov.tw/license)使用。边界简化及 GeoJSON 转换使用 [plotdb/pdmaptw v2.4.0](https://github.com/plotdb/pdmaptw/tree/v2.4.0) 的 [town-2025-03-18.geojson](https://github.com/plotdb/pdmaptw/releases/download/v2.4.0/town-2025-03-18.geojson)。山河足迹进一步转换字段、显示字形、坐标精度和绘图环方向。資料來源：內政部國土測繪中心；本应用是加工成果，提供机关未替本应用背书。

下载 URL、原始响应 SHA-256、字节数记录在 `china-source-manifest.json`。原始下载缓存位于发布目录之外。

## 覆盖与真实层级

34 个省级包共 3,241 个可记录单位，其中台湾为 368 个乡镇市区，香港为 18 区，澳门为 8 个来源分区（其中含填海区域），其余来自 DataV 县级边界。澳门分区不宣称为县级行政建制。台湾条目的 `levelNote` 为“乡镇市区”。

东莞、中山、儋州、嘉峪关没有作为普通市辖县区展开，保留 `level: "city"` 和“此地级市不设县级下辖单位，按市本级记录”的说明。其余可分出的县、区、县级市采用 `level: "county"`。省直管县级单位本身就是可记录单位，旧记录保留原 ID。

两个边界来源对部分离岛存在重复。金门、马祖等离岛仅保留乡镇级图形，去除福建包中重复的金门县总图形及连江、长乐、秀屿的重复离岛图形。处理明细见源文件清单中的 `deduplicated`。

DataV 快照可能未反映较新的区划变化，不能把本包单位数当作现行法定区划统计。九江市政府现址的地址来源标注浔阳区，而 DataV 快照在该点仍显示濂溪区；该迁移条目已单独记录差异，政府驻地并非由多边形包含关系推断。

## 文件与 ID

`china-index.json` 保存轻量 Feature 列表（`geometry: null`）和省包清单，搜索无需加载全国几何。点击省份后加载 `china/<provinceCode>.geo.json`。省包的 Feature 属性和索引一致。

大陆及港澳 ID 为字符串形式的六位来源代码；台湾乡镇 ID 为 `tw-` 加八位乡镇代码，`cityCode`/`parentId` 为旧版 `tw-` 加五位县市代码。`center` 是用于小旗显示的区域内部位置，只承担绘图作用，不代表政府地址。

## 旧记录迁移

`county-migration-map.json` 对已核实的旧 ID 提供 `targetId`、来源 URL、地址、核实日期及必要说明。优先使用政府网站原始资料；少数政府页面只给街道地址的条目，附地图服务原始政府 POI 作为所属区佐证。萍乡使用国资企业原始公开发行文件中的政府驻地文字，并附原始地图 POI。

台南和高雄存在多个市政中心，本次分别采用用户明确选择的安平区和苓雅区，并标记 `userSelected: true`。没有来源证实的旧记录列入 `unresolved`，保留原记录等待用户整理，不按城市几何中心或任意第一个区迁移。

## 重建与验证

在仓库根目录使用 Node.js：

```sh
node scripts/china-build-data.cjs
node scripts/china-build-migration.cjs
node scripts/china-validate.cjs
```

数据脚本优先使用仓库相邻的 `china-data-cache` 原始缓存，以保持可重复。迁移脚本保留已有人工核实映射。验证检查 ID 唯一性、索引与几何一致、闭合及有限坐标、D3 球面环方向、旗标落点、台湾及港澳数量、离岛重复、迁移目标所属地市，以及本次已存在的 47 个记录 ID 均有核实映射。
