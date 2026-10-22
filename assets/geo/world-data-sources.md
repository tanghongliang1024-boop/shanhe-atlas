# 世界地图数据与许可

本版本于 2026-10-22 整理，供山河足迹显示旅行足迹。全球底图包含 258 个国家及地区要素；这一数字不是主权国家总数。25 个旅行目的地提供 644 个州、省、大区及部分单列岛屿要素，按国家加载；足迹在这些地块内按城市记录。

地图做过显示简化，各来源的行政区划时间和边界口径不同。它不是测量、导航或法定边界依据，也不表示对争议地区归属的判断。中国县区地图另见中国数据来源说明；台湾、香港、澳门的世界底图入口统一进入中国地图层级。

## 来源、署名与授权

### Natural Earth

Made with Natural Earth. 作者及贡献者包括 Tom Patterson、Nathaniel Vaughn Kelso 等。世界国家边界及大部分州省边界来自：

- [Admin 0 – Countries，1:10m](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/)
- [Admin 1 – States, Provinces，1:10m](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/)
- [固定版本源文件](https://github.com/nvkelso/natural-earth-vector/tree/ca96624a56bd078437bca8184e78163e5039ad19/geojson)，提交 `ca96624a56bd078437bca8184e78163e5039ad19`。
- [Natural Earth 使用条款](https://www.naturalearthdata.com/about/terms-of-use/)：地图数据为 public domain，可修改、发布和再分发。其多语言名称主要来自 Wikidata 的 CC0 数据。

Natural Earth 的默认世界边界依据其事实控制口径，包含部分单列争议地区、海外地区及岛屿。本应用除下述明确显示调整外沿用来源口径，不把该来源称为最新官方边界。应用优先使用 `name_zh`，保留英文、当地名称及繁体名称作为搜索别名；少量新省区和大区由应用补充中文标签。

2026-10-22 的显示调整：印度详细地图移除来源编号 `IN-AR` 的地块，同时从世界总览的印度图形中扣除相同原始范围及原显示地块，避免简化边缘残留。其他国家边界、中国县区及印度其余地块保持不变。`world-index.json` 的 `legacyRegions` 只保留该编号的旧名称等元数据；已有足迹仍可查看、编辑和导出，不再出现在地图选择或标记中。此调整不删除用户存档，也不把移除范围改划至其他地图要素。

### 印度尼西亚 38 省

[Indonesia GeoJSON & TopoJSON Maps (38 Provinces)](https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces)，作者 denyherianto。使用固定提交 `80aa4a90ac7eef5136eaa2b551b6aa5d198be27d` 的 GeoJSON。数据作者采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)，[数据许可声明](https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces/blob/80aa4a90ac7eef5136eaa2b551b6aa5d198be27d/DATA_LICENSE.md)。

山河足迹对该数据做了中文标签、稳定 ID、坐标舍入、环方向及适度简化处理；保留了北加里曼丹和新巴布亚省区。应用按省名匹配唯一 ID，未使用源文件中重复的旧 `KODE_PROV` 值作为存档 ID。该衍生文件 `world/IDN.geo.json` 按 CC BY 4.0 提供。

### 柬埔寨、老挝及缅甸补充边界

© [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)。使用 [Open Database License 1.0（ODbL）](https://opendatacommons.org/licenses/odbl/1-0/)。

- 柬埔寨 25 个省及首都：[geoBoundaries 元数据](https://www.geoboundaries.org/api/current/gbOpen/KHM/ADM1/)，边界 ID `KHM-ADM1-37992800`，代表年份 2017；来源 OpenStreetMap / Wambacher。
- 老挝 18 个省及首都：[geoBoundaries 元数据](https://www.geoboundaries.org/api/current/gbOpen/LAO/ADM1/)，边界 ID `LAO-ADM1-31783359`，代表年份 2017；来源 OpenStreetMap / Wambacher。
- 以上两份边界由 [geoBoundaries](https://www.geoboundaries.org/) 发布，固定下载提交 `9469f09`，使用其 simplified GeoJSON。
- 缅甸内比都联邦区：OpenStreetMap [relation 5996482](https://www.openstreetmap.org/relation/5996482)，2026-10-22 经 Nominatim 获取的一次性快照。将其从 Natural Earth 的曼德勒几何中扣除，并单列为第 15 个省级要素。其他 14 个省邦沿用 Natural Earth 几何。这里没有使用 MIMU 的限制在线发布数据。

上述文件都经过中文标签、稳定 ID、显示简化和环方向转换。`world/KHM.geo.json`、`world/LAO.geo.json`、`world/MMR.geo.json` 及汇总索引 `world-index.json` 的地图数据库衍生内容在 ODbL 1.0 下提供，可从本应用同目录直接取得完整机器可读数据。GeoJSON 文件自身保留许可和署名字段。许可证适用于这些地图数据；用户填写的私人旅行记录不包含在分发的地图数据中。

## 行政层级处理

| 国家 | 本应用显示的细分 | 数量 |
| --- | --- | ---: |
| 美国 | 50 州及哥伦比亚特区 | 51 |
| 加拿大 | 省和地区 | 13 |
| 日本 | 都道府县 | 47 |
| 韩国 | 省级单位 | 17 |
| 泰国 | 府及曼谷 | 77 |
| 越南 | 按 2025 年合并规则聚合的省级单位 | 34 |
| 马来西亚 | 州及联邦直辖区 | 16 |
| 新加坡 | 社区发展理事会辖区 | 5 |
| 印度尼西亚 | 省 | 38 |
| 菲律宾 | 大区 | 18 |
| 柬埔寨 | 省及首都 | 25 |
| 老挝 | 省及首都 | 18 |
| 缅甸 | 省、邦及内比都联邦区 | 15 |
| 文莱 | 县 | 4 |
| 澳大利亚 | 州、北领地、首都领地及杰维斯湾 | 9 |
| 新西兰 | 16 大区、查塔姆群岛及 6 组来源单列的离岛 | 23 |
| 英国 | 英格兰、苏格兰、威尔士、北爱尔兰 | 4 |
| 法国 | 本土及海外大区 | 18 |
| 德国 | 联邦州 | 16 |
| 意大利 | 大区 | 20 |
| 西班牙 | 自治区及自治市 | 19 |
| 俄罗斯 | Natural Earth 的行政要素，含来源单列离岛 | 86 |
| 印度 | 邦及联邦属地显示要素（已移除 `IN-AR`） | 35 |
| 巴西 | 州及联邦区 | 27 |
| 南非 | 省 | 9 |

英国、法国、意大利、西班牙、菲律宾按 Natural Earth 的地区字段和明确的分组规则聚合，不把更细的市县数量当成州省数量。澳大利亚将豪勋爵岛并入新南威尔士州、麦夸里岛并入塔斯马尼亚州；新西兰不把世界底图已经单列的托克劳再次计作本国大区。

越南从 63 个旧边界按照 [2025 年省级行政重组决议](https://en.baochinhphu.vn/legislators-approve-resolution-on-the-administrative-reorganization-scheme-for-2025-111250612101649234.htm)及[政府公布的合并对应表](https://en.baochinhphu.vn/names-and-administrative-centers-of-34-provinces-and-centrally-run-cities-specified-111250415094350491.htm)聚合为 34 个区域。此过程更新分组，不重测旧边界，也不保证所有后续行政名称变化均已同步。

菲律宾根据 [PSA 的内格罗斯岛大区](https://psa.gov.ph/classification/psgc/provinces/1800000000)和[苏禄转入第 IX 大区的公告](https://psa.gov.ph/content/province-sulu-officially-transferred-region-ix-zamboanga-peninsula)调整旧几何分组。旧来源未包含的村镇级调整未重新测绘。

俄罗斯沿用 Natural Earth 的几何口径和标签；其中有一个来源未标明行政名称的小岛要素，应用明确标作“离岸岛屿（来源未分区）”。不应把数据要素数当成任何一方当前官方行政区数量。各国极小岛屿、飞地和海外地区在原始比例尺或简化中可能不完整。

## 文件合同与技术处理

- `world.geo.json`：世界总览；每个要素的 `adcode` 为 `world:<代码>`。优先沿用 Natural Earth `ADM0_A3` 稳定代码；其特殊地区扩展码并非全部属于 ISO 3166。
- `world/<代码>.geo.json`：按国家加载的州省边界；`adcode` 为 `world:<国家代码>:<细分代码>`，有 ISO 3166-2 时优先使用，特殊单元使用 `NE-` 前缀。不是依据排列顺序生成的易变 ID。
- `world-index.json`：`countries` 为国家属性数组，`regions` 为全部 645 个细分属性数组，无几何，可用于首次加载的全局搜索和统计。`detailCountries` 列出可下钻国家。
- 所有 GeoJSON 为经纬度 `[longitude, latitude]`。外环顺时针、洞逆时针，供 D3 球面投影使用；保留 180° 经线切分，未把俄罗斯、阿拉斯加或太平洋岛屿平移到错误的经度。
- 中心点优先使用来源内部标签点，否则使用最大多边形内部点，不使用可能落在海上的简单顶点平均值。
- 世界简化容差 0.055°，州省通常为 0.012°，新加坡与文莱为 0.0008°；保留拓扑并进行几何有效性校验。边界仅供旅行足迹显示，不能据此量测精确面积或定位行政归属。
- 生成脚本 `scripts/world-build.py`、固定 OSM 快照 `scripts/world-osm-naypyidaw-20261022.json` 和来源 SHA-256 记录 `scripts/world-validation.json` 在工程源码中保留；任何更新都应再次检查稳定 ID 与已有记录兼容性。

核验包括所有 JSON 可解析、全局 ID 唯一、坐标有限且在经纬度范围内、中心位于自身几何内、环方向正确、D3 球面面积不会被解释为地球补面、旋转后投影路径无 NaN/Infinity。中国城市记录迁移不在这批世界边界脚本中执行。
