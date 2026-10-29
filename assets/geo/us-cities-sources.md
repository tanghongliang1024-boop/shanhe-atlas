# 美国城市、城镇与居民点数据

2026-10-29 整理，地理版本为 **2026-01-01**。美国共提供 **35,608 个可记录地点**：保留已发布的 109 个美国地点全部原始字段，独立增量文件 `us-cities.json` 新增 35,499 个地点。覆盖美国 50 州和华盛顿哥伦比亚特区；波多黎各等继续沿用应用中已有的独立地图入口，不混入美国州目录。

## 覆盖范围

本目录采用美国人口普查局的 Places 范围，包含城市、城镇、村、自治市及 Census-designated places（CDP，普查指定居民点），不设人口门槛。美国各州对 city、town、village 等名称的法律定义不同，因此地点保留官方英文全名和类型后缀；没有可靠中文名称时不生成音译。它是官方行政与统计地点名录，不是所有非正式小地名、农场、街区或历史废弃聚落的集合。

| 官方来源单元 | 原始记录数 | 本次可记录范围 |
| --- | ---: | ---: |
| Incorporated Places | 19,514 | 19,514 |
| Census Designated Places | 12,557 | 12,557 |
| 八州法定 town（Minor Civil Division） | 3,562 | 3,537 |
| 合计 | 35,633 | **35,608** |

[Census 地理术语](https://www.census.gov/programs-surveys/popest/about/glossary/geo-terms.html)说明，新英格兰六州（康涅狄格、缅因、马萨诸塞、新罕布什尔、罗得岛、佛蒙特）以及纽约、威斯康星的 town 按 MCD 收录，单取 Places 会遗漏。补充范围仅取这八州 `LSADC=43`、`MTFCC=G4040` 的法定 town；没有把普通统计 CCD、未组织地区、整个县或全部 township 一并当成城市加入。[LSAD 定义](https://www.census.gov/library/reference/code-lists/legal-status-codes.html)确认 43 对应 town。

其中 25 个 town 的 Census 类别为 `T5`，表示与一个建制地点同范围，已经由 Places 表示；它们保留在来源快照和 `representedTowns` 审计清单中，不生成第二个打卡点。例如 Hartford 和 Bridgeport 的 town/city 不会各出现一份。Milford 的 Places 表示包含 city balance 和其内部独立 borough，保留这些官方地点，不另重复增加整个同范围 town。[Census 类别定义](https://www.census.gov/library/reference/code-lists/class-codes.html)是这一判断的依据。

功能状态不能当成人口或“是否废弃”的过滤条件。`C` 表示政府与另一政府合并且由同一组官员管理，仍是 active；`I` 表示政府不活跃，`N` 为没有自身运作政府的法律实体，`F` 包含为统计完整性建立的 city balance。华盛顿市、路易维尔等也可能具有这些状态。本版保留 2026 来源中仍存在的 Places，并保留六个 `T9` 法定 town，不以政府状态推断该地已经无人居住或删除；完整原始状态留在快照中，汇总见 `functionalStatusCounts`。[功能状态定义](https://www2.census.gov/geo/pdfs/reference/FunctionalStatusCodes.pdf)

## 官方来源与完整性

数据直接来自美国人口普查局 **TIGERweb 官方 REST 服务**。2026 Gazetteer 已发布，但其下载域在本次运行环境中返回 HTTP 403；因此采用同一机构明确标注 January 1, 2026 vintage 的官方图层，未改用第三方城市榜单或有最低人口限制的 GeoNames `cities1000` 作为全量来源。

- [Incorporated Places 图层](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/4)：19,514 条。
- [Census Designated Places 图层](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/5)：12,557 条。
- [County Subdivisions 图层](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/1)：按八州及法定 town 条件查询 3,562 条。
- [States 图层](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/0)：51 个州及特区，用于官方 FIPS→USPS 州代码关联。
- [Counties 图层](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1)：3,144 个县及县等价单位，用于 town 父级和同名地点消歧。

所有列表按 `GEOID ASC` 排序查询；服务上限为 100,000，每个查询均另取官方 `returnCountOnly`，核对记录数、唯一 GEOID、顺序和 `exceededTransferLimit`。两个 Places 图层没有重复 GEOID。来源快照记录完整查询 URL、计数响应、图层版本和原始属性响应；当前数量低于单次返回上限，没有把被截断的结果当作全量。

`scripts/us-cities-source.json.gz` 为公开地理数据的冻结快照，不含用户资料或存档：

- 压缩文件 SHA-256：`1342509960f4728567f11d9e697c38b8bb12454a366f3d9108c416417a45ff87`。
- 解压 JSON SHA-256：`1382ce2cc5de6c865c6740a4833a0d973bec54e476e255973965216e6ea869e7`。
- 2026-10-29 获取，版本固定为 2026-01-01；后续官网刷新不会静默改变本版目录。

署名：U.S. Census Bureau。美国联邦政府公开数据按 public domain 使用；原官方名称、地理代码及来源记录保留。数据位置使用 `INTPTLON/INTPTLAT` 内部代表点，属于该官方区域的代表位置，不保证是市政府、中心商业区或旅游入口。

## 名称、县与稳定编号

紧凑 JSON 的 `columns` 为 `geoid, kind, state, name, longitude, latitude, county`。`kind=place` 使用 7 位 Places GEOID，`kind=town` 使用 10 位 MCD GEOID，均保留前导零。

- 新 Place 编号：`world:USA:city-usplace<GEOID>`。
- 新 MCD town 编号：`world:USA:city-ustown<GEOID>`。
- 父区：现有 `world:USA:US-<USPS州代码>`。

同名居民点不按名称合并。172 个“同州、同官方全名”的 Place 均用官方内部点查询县图层，把**代表点所在县**作为名称辨识信息；跨县城市可能跨越更多县，此字段不宣称是该城市的唯一辖县。MCD town 的县则按 GEOID 中的父县代码关联。原始 172 次地理查询响应保留在快照中。完整的官方全名、州与县组合经核对唯一，仍由 GEOID 决定记录身份。

原地图州边界来自既有 Natural Earth 版本，与 Census 2026 的详细海岸、岛屿和法定边界存在精度及年代差异。城市保留 Census 的真实代表点和官方所属州，不为使其进入简化地图轮廓而移动坐标；本次不替换美国州边界。

## 既有 109 个地点

原 `world-cities.json` 原样保留。新增文件中的 `matchedExisting` 记录 109 个官方地点与既有稳定 ID 的对应，用于不重复新增，**不是用户存档迁移表**。匹配要求同州且标准化名称唯一，并检查原城市点与官方代表点距离。

四个名称差异经过明确处理：Honolulu→Urban Honolulu CDP、Boise→Boise City city、Indianapolis→Indianapolis city (balance)、Nashville→Nashville-Davidson metropolitan government (balance)。Anchorage 和 San Francisco 的法定区域较大或包含外岛，官方内部点可能远离旧城区标记；仍保留旧城市原始坐标。既有中文名、英文名、别名、旅游属性、来源及全部其他字段均不改动。

已发布 109 条美国原始对象的顺序及全部字段构成 SHA-256 `900a8ce4f928275a5b89eee81a37ba9fee4388e6165750337ff5f9a2734094d7`。生成脚本检查此基线，避免重新选择城市改变已有记录身份。其他国家、世界索引、美国州地图、全部历史迁移文件和所有用户数据均不写入。

## 重建

在仓库根目录执行 `node scripts/build-us-cities.cjs`，或附加 `--check` 只验证生成结果。脚本只需 Node 内置模块，离线读取冻结快照与现有目录，不实时刷新来源、不需要账号或数据库。

校验包含来源压缩/解压哈希、五个查询的官方计数、全部标识唯一、州和县父级关联、完整重名消歧、109 个原城市的唯一对应、35,499 个新增编号、51 州/特区覆盖和坐标范围。其余既有地理 JSON 的逐字节哈希必须保持不变。若以后需要更新 Census 版本，应重新核对地理代码变更和既有记录兼容性，不能只更换快照并忽略校验。
