# 海外代表城市数据与首府迁移依据

2026-10-22 整理。本数据为既有 25 国、645 个州省地块补充旅行地点，不改变世界边界、中国大陆县区、台湾 22 县市或港澳数据。`world-cities.json` 包含 **1007 个唯一城市或城镇**：638 个地块提供 1～2 个地点，另外 7 个来源单列的离岛地块有明确无城市例外。新加坡五个地块共用一个城市记录。

这些是用于旅行足迹的代表地点，不是完整城市名录、人口排名、实时行政首府名录或精确行政边界判定。不同来源年代不一；城市经纬度保留来源位置，未将城市点移动到简化地块内。当前有 3 个已注明的显示边界例外：马穆楚、白马市、世宗。

## 来源与许可

### Natural Earth

Made with Natural Earth. 作者及贡献者包括 Tom Patterson、Nathaniel Vaughn Kelso 等。952 个地点使用 Natural Earth 城市点及稳定 `NE_ID`。

- [Populated Places，1:10m](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/)：涵盖首都、许多一级行政驻地及重要城市和城镇。其重要性等级服务于地图显示，人口字段可能包含都会区，不能直接当作市辖区人口排名。
- [固定版本 GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places.geojson)，提交 `ca96624a56bd078437bca8184e78163e5039ad19`。
- 源文件 SHA-256：`9b8e3de09048ef00dfc70357dbb9fa324493f214b5e0ae4daf1aa79a8d10116b`。
- [Natural Earth 使用条款](https://www.naturalearthdata.com/about/terms-of-use/)：地图数据为 public domain；多语言名称主要来自 Wikidata CC0。

应用添加了州省关联、中文显示名修订、来源标记、去重及选择规则。源中已发现的翻译混用或人口疑点在构建配置中明确修正或排除，例如 Kuta、Cuttack 的英文名，以及两个无法可靠核实的大人口同名巴西地点。

### GeoNames

© [GeoNames](https://www.geonames.org/about.html)，采用 [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)。55 个补充地点使用其 WGS84 坐标、英文名称及别名。

- [下载说明与字段定义](https://download.geonames.org/export/dump/readme.txt)。本次从 `cities1000.zip`、`AU.zip`、`LA.zip` 提取所需记录，保留为 `scripts/world-cities-geonames-20261022.json` 固定快照。
- 快照保存原始下载 URL、SHA-256、GeoNames ID、名称、别名、坐标、地点类型、人口及来源修改日期。正式重建读取快照，避免每日下载更新改变稳定产物。
- 每个补充城市的 `sourceUrl` 链接到相应 GeoNames 记录。应用修改包括筛选、州省关联、显示名与别名补充、坐标保留 6 位小数；没有重新测绘地点。

### 州省关联数据库

地块关联使用应用已有边界，详细来源见 [世界地图数据与许可](world-data-sources.md)。其中柬埔寨、老挝和缅甸边界含 © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) 的数据库衍生内容。相应地块关联和本次汇总地图数据库按 [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) 提供；底层 Natural Earth 和 GeoNames 内容仍分别保留 public domain 与 CC BY 4.0 条款。

完整机器可读衍生数据库可直接下载 [world-cities.json](world-cities.json)，构建脚本、固定补充输入和人工配置随工程源码发布。上述地图数据不包含任何用户的日期、笔记、邮箱或私人旅行记录。

## 选择与稳定 ID

首先保留已核实的迁移首府和明确人工选择；其他地点参考来源行政驻地字段。可选的第二城市按 Natural Earth `SCALERANK`、`LABELRANK` 和人口排序，人工检查重要城市与都会区近郊重复问题。这里只用人口辅助选择，不声称选出了各省人口最大的两城。

同一个 GeoNames ID 或同名且邻近的跨来源地点归为同一城市；不会仅因两个市中心相近而合并不同城市。城市 ID 使用 `world:<ISO3>:city-<NE_ID>`，GeoNames 补充点使用 `world:<ISO3>:city-gn<GeoNamesID>`，不依赖数组顺序。

`parentRegionId` 和 `provinceCode` 为既有完整州省 ID，`province` 为州省中文名，`country` / `countryCode` 为国家名称及代码，`center` 为 `[经度, 纬度]`，`level` 为 `city`。`aliases` 保留来源英文及当地别名。`placeType` 区分普通城市/城镇与明确村落，`capitalOf` 仅用于下述已核实迁移首府。

新加坡的同一记录带有全部五个 `regionIds`，用一个城市档案关联五个地块。新加坡是城市国家，五区是社区发展理事会分区：[外交部说明](https://www.mfa.gov.sg/about-singapore/)、[五区说明](https://www.cdc.gov.sg/about-us/five-districts/)。

## 特殊地点和空白地块

- 杰维斯湾提供真实的“杰维斯湾村（村镇）”，没有虚构独立大城市：[澳大利亚政府介绍](https://www.infrastructure.gov.au/territories-regions-cities/territories/jervis-bay-territory/governance-administration)。
- 老挝赛宋本提供已能核实坐标的“万銮（村镇）”；未据不可靠的首府位置自动迁移旧省记录：[GeoNames 地点](https://www.geonames.org/1658268/)。
- 新西兰六组自然保护离岛没有加入城市记录。研究站和岛屿标签不当作城市：[Raoul Island](https://www.doc.govt.nz/raoulisland)、[Three Kings / Manawatāwhi](https://www.doc.govt.nz/nature/habitats/offshore-islands/te-hiku-far-north-islands/)、[亚南极保护岛屿工作说明](https://www.doc.govt.nz/news/media-releases/2024-media-releases/largest-subantarctic-field-season-wraps-up/)。
- 俄罗斯一个来源未标行政名称的离岸要素没有可核实城市；数据明确标注“未核实”，不推测其人口或首府。
- 马约特选择马穆楚，依据 [INSEE 2026 官方地理代码](https://www.insee.fr/fr/metadonnees/geographie/departement/976-mayotte)；来源旧首府藻德济作为另一个旅行地点保留。

全部例外在 `world-cities.json.exceptions` 中可供界面读取；不通过创建同名假城市填满空白地块。

## 旧省州记录迁移

`world-city-migration-map.json` 仅包含 **20 条经过核实的首府关联**，包括新加坡五区到同一城市的五条关联。新西兰大区按议会主要驻地处理。其他未核实的旧省州记录保留待定位；不把代表城市选择或最大人口候选直接当作迁移依据。

迁移必须保留原日期、笔记及更新时间。多个旧分区指向一个城市或目标已有记录时，须保留冲突原记录，不能相互覆盖。数据文件只是地理映射，不执行数据库写入。

| 原省州 ID | 目标城市 | 核验依据 |
| --- | --- | --- |
| DE-BE | 柏林 | [柏林宪法](https://www.berlin.de/rbmskzl/en/the-governing-mayor/the-constitution-of-berlin/artikel.16534.en.php) |
| DE-BW | 斯图加特 | [巴登-符腾堡州政府](https://www.baden-wuerttemberg.de/de/unser-land/land-und-leute/geografie/) |
| DE-BY | 慕尼黑 | [巴伐利亚官方门户](https://www.bayern.de/der-freistaat/) |
| DE-HE | 威斯巴登 | [黑森州总理府](https://staatskanzlei.hessen.de/unser-haus/die-staatskanzlei-entdecken) |
| FR-CVL | 奥尔良 | [法国文化部大区图册](https://www.culture.gouv.fr/content/download/321256/pdf_file/CVL%20Atlas%20culturel%202021.pdf?inLanguage=fre-FR&version=16) |
| GB-ENG | 伦敦 | [伦敦官方旅游机构](https://www.visitlondon.com/things-to-do/visiting-london-for-the-first-time/london-faqs) |
| ID-BA | 登巴萨 | [登巴萨市政府](https://denpasarkota.go.id/page/sejarah) |
| IT-62 | 罗马 | [拉齐奥大区议会](https://www.consiglio.regione.lazio.it/?id=1924&vw=newsDettaglio) |
| MY-01 | 新山 | [柔佛州议会记录](https://dewannegeri.johor.gov.my/wp-content/uploads/2020/09/20080704-Penyata-Rasmi.pdf)，说明行政中心迁移后仍保留州首府地位 |
| NZ-CAN | 基督城 | [Environment Canterbury 官方招标](https://www.gets.govt.nz/CRC/ExternalTenderDetails.htm?id=25629266)，主要总部位于基督城 |
| NZ-MWT | 北帕默斯顿 | [Horizons Regional House 官方方案](https://haveyoursay.horizons.govt.nz/2025AP/future-issue-regional-house-palmerston-north)，不采用来源旧首府标记 Whanganui |
| NZ-OTA | 但尼丁 | [Otago Regional Council 总部说明](https://www.orc.govt.nz/your-council/latest-news/news/2024/september/building-design-celebrates-history-of-place) |
| TH-10 | 曼谷 | [泰国政府门户](https://thailand.go.th/page/capital-city) |
| TH-83 | 普吉 | [固定 Natural Earth 城市点](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places.geojson)的 Admin-1 capital 标记，与 [GeoNames 1151254](https://www.geonames.org/1151254/)的 PPLA 标记交叉核对 |
| US-CA | 萨克拉门托 | [加州财政部](https://dof.ca.gov/about-us/careers/about-sacramento/) |
| SG-01～SG-05 | 新加坡 | [新加坡外交部](https://www.mfa.gov.sg/about-singapore/)及[五个 CDC 分区说明](https://www.cdc.gov.sg/about-us/five-districts/) |

## 重建与验收

需要 Python 3 和 Shapely。可运行 `python -m pip install --target scripts/world-deps shapely==2.1.2`，或使用已安装 Shapely 的 Python 环境；然后运行 `python scripts/world-cities-build.py`。

源码应包含 `world-cities-build.py`、`world-cities-curation.json`、`world-cities-geonames-20261022.json` 和生成的 `world-cities-validation.json`。不需打包下载缓存或 Python 依赖目录。首次运行会创建缓存目录、下载固定 Natural Earth 文件并核验 SHA-256；正式重建须保留随源码分发的 GeoNames 固定快照。移除快照会启动重新采集流程，不能把此行为当作本版的可重复重建。

验收覆盖 JSON 可解析、城市 ID 唯一且符合格式、全部中文显示名、父区存在、坐标范围及有限性、每个非空地块 1～2 城、同城去重、所有首府迁移目标真实存在且同国同父区、新加坡多父区关联、3 个明确空间例外，以及既有世界边界和索引逐文件 SHA-256 不变。固定输入重复构建得到相同城市及迁移 JSON；详细数量、来源哈希和逐地块选择见 `scripts/world-cities-validation.json`。
