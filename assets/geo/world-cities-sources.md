# 海外代表城市数据与首府迁移依据

2026-10-22 整理。`world-cities.json` 包含 **1319 个唯一城市或城镇**：完整保留上一版 1088 个可选地点的 ID 和全部字段，本版新增 231 个欧洲及相关国家、属地的真实居民点。原 IN-AR 下的 Itanagar 继续仅存于 `legacyCities`，供历史记录详情识别。城市构建不改动边界、中国大陆县区、台湾 22 县市或港澳数据。

原有 25 国、644 个州省地块保持不变，其中 637 个地块提供 1～5 个地点，7 个来源单列的离岛地块有明确无城市例外；新加坡五个地块共用一个城市记录。新覆盖的 45 个国家或地图单元和 6 个补充属地直接提供国家级城市入口，不为城市创建虚构的省州。欧洲范围内原有 6 国已经超过 5 城，完整保持原名录。

这些是用于旅行足迹的代表地点，不是完整城市名录、人口排名、实时行政首府名录或精确行政边界判定。不同来源年代不一；城市经纬度保留来源位置，未将城市点移动到简化地块内。当前有 28 个已注明的显示边界例外，包括此前 6 个和本次 22 个海岸、小岛、微型国家或分隔城市点。城市所属来自来源信息与已有地图的空间关联；海岸线和岛屿概略化会使真实城市点落在显示边界外。逐项说明保存在城市的 `spatialException` 和验收报告中。

## 来源与许可

### Natural Earth

Made with Natural Earth. 作者及贡献者包括 Tom Patterson、Nathaniel Vaughn Kelso 等。1154 个当前可选地点使用 Natural Earth 城市点及稳定 `NE_ID`。

- [Populated Places，1:10m](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/)：涵盖首都、许多一级行政驻地及重要城市和城镇。其重要性等级服务于地图显示，人口字段可能包含都会区，不能直接当作市辖区人口排名。
- [固定版本 GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places.geojson)，提交 `ca96624a56bd078437bca8184e78163e5039ad19`。
- 源文件 SHA-256：`9b8e3de09048ef00dfc70357dbb9fa324493f214b5e0ae4daf1aa79a8d10116b`。
- [Natural Earth 使用条款](https://www.naturalearthdata.com/about/terms-of-use/)：地图数据为 public domain；多语言名称主要来自 Wikidata CC0。

应用添加了州省关联、中文显示名修订、来源标记、去重及选择规则。源中已发现的翻译混用或人口疑点在构建配置中明确修正或排除，例如 Kuta、Cuttack 的英文名，以及两个无法可靠核实的大人口同名巴西地点。

### GeoNames

© [GeoNames](https://www.geonames.org/about.html)，采用 [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)。165 个当前可选补充地点使用其 WGS84 坐标、英文名称及别名。

- [下载说明与字段定义](https://download.geonames.org/export/dump/readme.txt)。本次从 `cities1000.zip`、`AU.zip`、`LA.zip` 提取所需记录，保留为 `scripts/world-cities-geonames-20261022.json` 固定快照。
- 快照保存原始下载 URL、SHA-256、GeoNames ID、名称、别名、坐标、地点类型、人口及来源修改日期。正式重建读取快照，避免每日下载更新改变稳定产物。
- 每个补充城市的 `sourceUrl` 链接到相应 GeoNames 记录。应用修改包括筛选、州省关联、显示名与别名补充、坐标保留 6 位小数；没有重新测绘地点。

### 州省关联数据库

地块关联使用应用已有边界，详细来源见 [世界地图数据与许可](world-data-sources.md)。其中柬埔寨、老挝和缅甸边界含 © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) 的数据库衍生内容。相应地块关联和本次汇总地图数据库按 [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) 提供；底层 Natural Earth 和 GeoNames 内容仍分别保留 public domain 与 CC BY 4.0 条款。

完整机器可读衍生数据库可直接下载 [world-cities.json](world-cities.json)，构建脚本、固定补充输入和人工配置随工程源码发布。上述地图数据不包含任何用户的日期、笔记、邮箱或私人旅行记录。

## 选择与稳定 ID

基础名录首先保留已核实的迁移首府和明确人工选择；其他地点参考来源行政驻地字段。可选的第二城市按 Natural Earth `SCALERANK`、`LABELRANK` 和人口排序，人工检查重要城市与都会区近郊重复问题。这里只用人口辅助选择，不声称选出了各省人口最大的两城。

同一个 GeoNames ID 或同名且邻近的跨来源地点归为同一城市；不会仅因两个市中心相近而合并不同城市。城市 ID 使用 `world:<ISO3>:city-<NE_ID>`，GeoNames 补充点使用 `world:<ISO3>:city-gn<GeoNamesID>`，不依赖数组顺序。

`parentRegionId` 和 `provinceCode` 在已细分国家中为完整州省 ID，`province` 为州省中文名；无州省细分的国家中，父 ID 为 `world:<ISO3>`，`province` 为国家名称。`country` / `countryCode` 为国家名称及代码，`center` 为 `[经度, 纬度]`，`level` 为 `city`。`aliases` 保留来源英文及当地别名。`placeType` 区分普通城市/城镇与明确村落，`capitalOf` 仅用于下述已核实迁移首府。新增旅游地点带有 `tourism: true`、`tourismSource` 和 `tourismSourceName`；此标签表示扩充条目，未打标签的旧城市也可能是知名旅行目的地。顶层 `countryCoverage` 明列本版欧洲覆盖范围、数量、最低要求和单城例外原因。

新加坡的同一记录带有全部五个 `regionIds`，用一个城市档案关联五个地块。新加坡是城市国家，五区是社区发展理事会分区：[外交部说明](https://www.mfa.gov.sg/about-singapore/)、[五区说明](https://www.cdc.gov.sg/about-us/five-districts/)。

## 特殊地点和空白地块

- 杰维斯湾提供真实的“杰维斯湾村（村镇）”，没有虚构独立大城市：[澳大利亚政府介绍](https://www.infrastructure.gov.au/territories-regions-cities/territories/jervis-bay-territory/governance-administration)。
- 老挝赛宋本提供已能核实坐标的“万銮（村镇）”；未据不可靠的首府位置自动迁移旧省记录：[GeoNames 地点](https://www.geonames.org/1658268/)。
- 新西兰六组自然保护离岛没有加入城市记录。研究站和岛屿标签不当作城市：[Raoul Island](https://www.doc.govt.nz/raoulisland)、[Three Kings / Manawatāwhi](https://www.doc.govt.nz/nature/habitats/offshore-islands/te-hiku-far-north-islands/)、[亚南极保护岛屿工作说明](https://www.doc.govt.nz/news/media-releases/2024-media-releases/largest-subantarctic-field-season-wraps-up/)。
- 俄罗斯一个来源未标行政名称的离岸要素没有可核实城市；数据明确标注“未核实”，不推测其人口或首府。
- 马约特选择马穆楚，依据 [INSEE 2026 官方地理代码](https://www.insee.fr/fr/metadonnees/geographie/departement/976-mayotte)；来源旧首府藻德济作为另一个旅行地点保留。

全部例外在 `world-cities.json.exceptions` 中可供界面读取；不通过创建同名假城市填满空白地块。

## 旅游城市扩充与官方依据

上一版在 21 国新增的 82 个真实城镇在本版原样保留，原有新加坡、文莱、柬埔寨和老挝的主要旅行地点也保持原样。一般旅游州省可有 2～4 城，本版最多 5 城。选择参考国家或地方官方旅游机构、旅游局及市政府资料；不复制旅游文章正文、照片或商标。旅游网页仅核验地点身份和旅行代表性，坐标仍来自上文许可明确的 Natural Earth / GeoNames。

箱根明确为町；阳东是富国岛上的真实镇区，科隆是布桑加岛上的科隆镇，尼亚加拉瀑布市是城市而非瀑布景点。蒲甘入口使用真实城镇娘乌，未将遗址区伪作城市。Fremantle 的 GeoNames 类型为 PPLX，经该市政府资料核实为城市后显式纳入。上述城镇标签描述居民点身份，不据此声称其所有行政建制截至今天仍相同。

| 国家 | 新增城市或城镇 | 所属州省 | 官方旅游依据 |
| --- | --- | --- | --- |
| 澳大利亚 | 拜伦湾（镇） / Byron Bay | 新南威尔士州 | [Tourism Australia](https://www.australia.com/en-ca/trips-and-itineraries/best-road-trips-australia.html) |
| 澳大利亚 | 道格拉斯港（镇） / Port Douglas | 昆士兰州 | [Tourism Australia](https://www.australia.com/en/places/cairns-and-surrounds/what-to-do-at-great-barrier-reef.html) |
| 澳大利亚 | 凯恩斯 / Cairns | 昆士兰州 | [Tourism Australia](https://www.australia.com/en/places/cairns-and-surrounds/guide-to-cairns.html) |
| 澳大利亚 | 黄金海岸 / Gold Coast | 昆士兰州 | [Tourism Australia](https://www.australia.com/en-ca/trips-and-itineraries/best-road-trips-australia.html) |
| 澳大利亚 | 弗里曼特尔 / Fremantle | 西澳大利亚州 | [City of Fremantle](https://www.fremantle.wa.gov.au/your-city-and-council/new-residents/) |
| 巴西 | 欧鲁普雷图 / Ouro Preto | 米纳斯吉拉斯 | [Embratur / Visit Brasil](https://www.visitbrasil.com/conheca-ouro-preto-a-bordo-de-uma-charmosa-jardineira-dos-anos-1930) |
| 巴西 | 伊瓜苏市 / Foz do Iguacu | 巴拉那州 | [Embratur / Visit Brasil](https://www.visitbrasil.com/location/foz-do-iguacu-pt/) |
| 巴西 | 帕拉蒂 / Paraty | 里约热内卢州 | [Embratur / Visit Brasil](https://www.visitbrasil.com/location/paraty/) |
| 巴西 | 布济乌斯 / Armacao dos Buzios | 里约热内卢州 | [Embratur / Visit Brasil](https://www.visitbrasil.com/en/location/buzios) |
| 加拿大 | 贾斯珀（镇） / Jasper | 阿尔伯塔省 | [Travel Alberta](https://www.travelalberta.com/places-to-go/cities-towns) |
| 加拿大 | 班夫（镇） / Banff | 阿尔伯塔省 | [Travel Alberta](https://www.travelalberta.com/places-to-go/cities-towns) |
| 加拿大 | 惠斯勒（镇） / Whistler | 不列颠哥伦比亚 | [Tourism Whistler](https://www.whistler.com/discover/) |
| 加拿大 | 尼亚加拉瀑布市 / Niagara Falls | 安大略省 | [Niagara Falls Tourism](https://www.niagarafallstourism.com/info/) |
| 德国 | 海德堡 / Heidelberg | 巴登－符腾堡 | [German National Tourist Board](https://www.germany.travel/de/staedte-kultur/heidelberg.html) |
| 德国 | 巴登巴登 / Baden-Baden | 巴登－符腾堡 | [German National Tourist Board](https://www.germany.travel/de/inspiring-germany/baden-wuerttemberg.html) |
| 德国 | 陶伯河畔罗滕堡 / Rothenburg ob der Tauber | 巴伐利亚 | [German National Tourist Board](https://www.germany.travel/en/cities-culture/rothenburg.html) |
| 西班牙 | 马拉加 / Malaga | 安达卢西亚 | [Turespaña](https://www.spain.info/en/top/unmissable-andalusian-cities/) |
| 西班牙 | 格拉纳达 / Granada | 安达卢西亚 | [Turespaña](https://www.spain.info/en/top/unmissable-andalusian-cities/) |
| 西班牙 | 萨拉曼卡 / Salamanca | 卡斯蒂利亚-莱昂 | [Turespaña](https://www.spain.info/es/destino/salamanca/) |
| 西班牙 | 圣塞瓦斯蒂安 / San Sebastian | 巴斯克 | [Turespaña](https://www.spain.info/en/destination/donostia-san-sebastian/) |
| 法国 | 安纳西 / Annecy | 奥弗涅-罗讷-阿尔卑斯大区 | [Atout France](https://cn-res.france.fr/hk/France_on_Web.pdf) |
| 法国 | 科尔马 / Colmar | 大东部大区 | [Atout France](https://nl-res.france.fr/Info/Carte%20de%20France%202014-2015%20FR.pdf) |
| 法国 | 戛纳 / Cannes | 普罗旺斯-阿尔卑斯-蓝色海岸大区 | [Atout France](https://www.france.fr/fr/destination/cote-dazur/) |
| 法国 | 阿维尼翁 / Avignon | 普罗旺斯-阿尔卑斯-蓝色海岸大区 | [Atout France](https://www.france.fr/fr/destination/provence/) |
| 英国 | 巴斯 / Bath | 英格兰 | [VisitBritain](https://www.visitbritain.com/en/destinations/england/bath) |
| 英国 | 约克 / York | 英格兰 | [VisitBritain](https://www.visitbritain.com/en/destinations/england/york) |
| 英国 | 牛津 / Oxford | 英格兰 | [VisitBritain](https://www.visitbritain.com/en/destinations/england/oxford) |
| 英国 | 因弗内斯 / Inverness | 苏格兰 | [VisitScotland](https://www.visitscotland.com/places-to-go/inverness) |
| 印度尼西亚 | 库塔（镇） / Kuta | 巴厘岛 | [Indonesia Ministry of Tourism](https://www.indonesia.travel/id/id/destination/bali-nusa-tenggara/bali/kuta) |
| 印度尼西亚 | 乌布（镇） / Ubud | 巴厘岛 | [Indonesia Ministry of Tourism](https://www.indonesia.travel/id/en/destination/bali-nusa-tenggara/bali/ubud/) |
| 印度尼西亚 | 拉布安巴焦（镇） / Labuan Bajo | 东努沙登加拉省 | [Indonesia Ministry of Tourism](https://www.indonesia.travel/sg/en/destination/bali-nusa-tenggara/east-nusa-tenggara/labuan-bajo) |
| 印度 | 科钦 / Kochi | 喀拉拉邦 | [India Ministry of Tourism](https://www.incredibleindia.gov.in/en/kerala/kochi) |
| 印度 | 乌代布尔 / Udaipur | 拉贾斯坦邦 | [India Ministry of Tourism](https://www.incredibleindia.gov.in/en/rajasthan/udaipur) |
| 印度 | 杰伊瑟尔梅尔 / Jaisalmer | 拉贾斯坦邦 | [India Ministry of Tourism](https://www.incredibleindia.gov.in/en/rajasthan) |
| 印度 | 阿格拉 / Agra | 北方邦 | [India Ministry of Tourism](https://www.incredibleindia.gov.in/en/uttar-pradesh/agra) |
| 印度 | 瓦拉纳西 / Varanasi | 北方邦 | [India Ministry of Tourism](https://www.incredibleindia.gov.in/en/uttar-pradesh/agra) |
| 意大利 | 锡耶纳 / Siena | 托斯卡纳大区 | [Italia.it / ENIT](https://www.italia.it/it/toscana/siena) |
| 意大利 | 卢卡 / Lucca | 托斯卡纳大区 | [Italia.it / ENIT](https://www.italia.it/en/tuscany/lucca) |
| 意大利 | 索伦托 / Sorrento | 坎帕尼亚大区 | [Italia.it / ENIT](https://www.italia.it/it/campania/penisola-sorrentina) |
| 意大利 | 陶尔米纳 / Taormina | 西西里大区 | [Italia.it / ENIT](https://www.italia.it/it/sicilia/taormina) |
| 日本 | 小樽 / Otaru | 北海道 | [Japan National Tourism Organization](https://www.japan.travel/en/spot/2161/) |
| 日本 | 日光 / Nikko | 栃木县 | [Japan National Tourism Organization](https://www.japan.travel/fr/fr/itineraires/les-incontournables/) |
| 日本 | 镰仓 / Kamakura | 神奈川县 | [Japan National Tourism Organization](https://www.japan.travel/fr/fr/itineraires/les-incontournables/) |
| 日本 | 箱根（町） / Hakone | 神奈川县 | [Japan National Tourism Organization](https://www.japan.travel/fr/fr/itineraires/les-incontournables/) |
| 日本 | 高山 / Takayama | 岐阜县 | [Japan National Tourism Organization](https://www.japan.travel/fr/fr/itineraires/les-incontournables/) |
| 韩国 | 束草 / Sokcho | 江原道 | [Korea Tourism Organization](https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/locIntrdnList.do?menuSn=216&rprsRgnCd=RPRS_RGN__20) |
| 韩国 | 庆州 / Gyeongju | 庆尚北道 | [Korea Tourism Organization](https://www.visitkorea.or.kr/common_intl/mapInformation.kto?func_name=main&md=enu) |
| 韩国 | 西归浦 / Seogwipo | 济州特别自治道 | [Jeju Tourism Organization](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500731&menuId=DOM_000001920000000000) |
| 缅甸 | 娘乌（镇，蒲甘门户） / Nyaung U | 曼德勒省 | [Myanmar Ministry of Hotels and Tourism](https://tourism.gov.mm/cn/ecotourism) |
| 缅甸 | 娘水（镇） / Nyaungshwe | 掸邦 | [Myanmar Ministry of Hotels and Tourism](https://tourism.gov.mm/en/inbound-tour-companies?page=2&q=Inbound) |
| 缅甸 | 格劳（镇） / Kalaw | 掸邦 | [Myanmar Ministry of Hotels and Tourism](https://tourism.gov.mm/en/inbound-tour-companies?page=2&q=Inbound) |
| 马来西亚 | 瓜镇（兰卡威） / Kuah | 吉打 | [Tourism Malaysia](https://storage.ebrochures.malaysia.travel/storage/Langkawi-The-Jewel-of-Kedah_English_.pdf) |
| 马来西亚 | 山打根 / Sandakan | 沙巴 | [Sabah Tourism Board](https://sabahtourism.com/district/sandakan/?locale=ru) |
| 马来西亚 | 仙本那（镇） / Semporna | 沙巴 | [Tourism Malaysia](https://www.malaysia.travel/index.php/explore/bohey-dulang-island) |
| 新西兰 | 罗托鲁瓦 / Rotorua | 普伦蒂湾大区 | [Tourism New Zealand](https://www.newzealand.com/us/rotorua/) |
| 新西兰 | 凯库拉（镇） / Kaikoura | 坎特伯雷 | [Tourism New Zealand](https://www.newzealand.com/us/kaikoura/) |
| 新西兰 | 瓦纳卡（镇） / Wanaka | 奥塔哥大区 | [Tourism New Zealand](https://www.newzealand.com/us/wanaka/) |
| 新西兰 | 蒂阿瑙（镇） / Te Anau | 南地大区 | [Tourism New Zealand](https://www.newzealand.com/us/te-anau/) |
| 菲律宾 | 杜马盖地 / Dumaguete | 内格罗斯岛大区 | [Philippines Department of Tourism](https://philippines.travel/destinations/dumaguete-city/index) |
| 菲律宾 | 大雅台 / Tagaytay | 卡拉巴松大区 | [Tagaytay City Government](https://tagaytay.gov.ph/history.html) |
| 菲律宾 | 爱妮岛（镇） / El Nido | 民马罗巴大区 | [Philippines Department of Tourism](https://www.philippines.travel/destinations/palawan-el-nido/index) |
| 菲律宾 | 科隆（镇） / Coron | 民马罗巴大区 | [Philippines Department of Tourism](https://www.tourism.gov.ph/destination/mimaropa/coron/) |
| 俄罗斯 | 谢尔吉耶夫镇 / Sergiyev Posad | 莫斯科州 | [Moscow Region Tourism Portal](https://welcome.mosreg.ru/directions/sergiev-posad) |
| 俄罗斯 | 苏兹达尔 / Suzdal | 弗拉基米尔州 | [Vladimir Oblast Tourism Information Centre](https://vladimirtravel.ru/anniversaryofsuzdal1000/turistskiy-informatsionnyy-tsentr-g-suzdal/) |
| 俄罗斯 | 佩列斯拉夫尔-扎列斯基 / Pereslavl-Zalessky | 雅罗斯拉夫尔州 | [Yaroslavl Region Official Tourism Portal](https://visityaroslavia.ru/places/2472) |
| 泰国 | 芭堤雅 / Pattaya | 春武里府 | [Tourism Authority of Thailand](https://www.tourismthailand.org/Destinations/Provinces/Pattaya/469) |
| 泰国 | 清刊（镇） / Chiang Khan | 黎府 | [Tourism Authority of Thailand](https://tourismproduct.tourismthailand.org/en/sustainable-tourism) |
| 泰国 | 拜县（镇） / Pai | 夜丰颂府 | [Tourism Authority of Thailand](https://www.tourismthailand.org/Attraction/pai-walking-street) |
| 美国 | 塞多纳 / Sedona | 亚利桑那州 | [Arizona Office of Tourism](https://www.visitarizona.com/places/cities/sedona) |
| 美国 | 圣迭戈 / San Diego | 加利福尼亚州 | [Visit California](https://www.visitcalifornia.com/places-to-visit/san-diego/) |
| 美国 | 旧金山 / San Francisco | 加利福尼亚州 | [Visit California](https://www.visitcalifornia.com/places-to-visit/san-francisco/) |
| 美国 | 基韦斯特 / Key West | 佛罗里达州 | [VISIT FLORIDA](https://www.visitflorida.com/places-to-go/southeast/key-west/) |
| 美国 | 奥兰多 / Orlando | 佛罗里达州 | [VISIT FLORIDA](https://www.visitflorida.com/places-to-go/central/orlando/) |
| 美国 | 阿什维尔 / Asheville | 北卡罗来纳州 | [Visit North Carolina](https://www.visitnc.com/list/5-fantastic-mountain-escapes-north-carolina) |
| 美国 | 圣安东尼奥 / San Antonio | 得克萨斯州 | [Travel Texas](https://www.traveltexas.com/cities-and-regions/texas-cities/) |
| 美国 | 达拉斯 / Dallas | 得克萨斯州 | [Travel Texas](https://www.traveltexas.com/cities-and-regions/texas-cities/) |
| 越南 | 沙坝（镇） / Sa Pa | 老街省 | [Vietnam National Authority of Tourism](https://vietnam.travel/places-to-go/northern-midlands-mountains/sapa) |
| 越南 | 阳东（镇，富国岛） / Duong Dong | 安江省 | [Vietnam National Authority of Tourism](https://www.vietnam.travel/things-to-do/sunset-in-phu-quoc) |
| 越南 | 会安 / Hoi An | 岘港市 | [Vietnam National Authority of Tourism](https://vietnam.travel/things-to-do/the-best-ways-to-explore-the-ancient-town-of-hoi-an) |
| 南非 | 克尼斯纳（镇） / Knysna | 西开普省 | [South African Tourism](https://saspecialist.southafrica.net/za/en/topics/entry/western-cape-main-centres) |
| 南非 | 赫曼努斯（镇） / Hermanus | 西开普省 | [South African Tourism](https://www.southafrica.net/gl/en/travel/article/hermanus-western-cape) |
| 南非 | 斯泰伦博斯 / Stellenbosch | 西开普省 | [South African Tourism](https://www.southafrica.net/za/en/travel/article/stellenbosch-a-town-on-the-scenic-countryside-of-the-western-cape) |

## 欧洲国家覆盖（本版新增）

本次必需范围为 51 个现有国家地图单元：传统欧洲国家、俄罗斯、土耳其、塞浦路斯、亚美尼亚、阿塞拜疆、格鲁吉亚、哈萨克斯坦，以及现有科索沃地图单元。该清单用于应用旅游覆盖，不借此判定国家地位或边界。49 个单元各有至少 5 个城市或城镇；摩纳哥、梵蒂冈各保留 1 个真实城市。格陵兰地理上不属于欧洲，未纳入本次最低数量要求；其他单列地图要素不因本次城市扩充改变边界或归属。

新增 45 个国家地图单元共 217 城，另为 6 个属地补充 14 城，总计 231。德国、西班牙、法国、英国、意大利、俄罗斯原有数量已达要求，原有名录完全不变。小国使用真实居民点；没有把城堡、湖泊、景区或同城街区充作独立城市。摩纳哥官方资料将 Monaco-Ville、Monte-Carlo、Fontvieille 等称为城区，因此不拆分凑数；[官方城市国家说明](https://www.visitmonaco.com/en/explore/activities/routes-and-walks/course/chemin-des-sculptures-rainier-iii)。梵蒂冈按[官方地理说明](https://www.vaticanstate.va/en/state-and-government/general-informations/geography.html)保留城市国家的一个入口。

下表的选择依据主要为国家、地方旅游机构或政府目的地目录，可能覆盖该国的一部分代表目的地，不能视作整张名单的逐城证明。每一城市的身份与点位另由固定 Natural Earth / GeoNames 记录核验，完整来源链接保存在 `sourceUrl`；个别地点的更直接旅游资料保存在 `tourismSource`。白俄罗斯国家旅游门户本次未能读取，明斯克、布列斯特、格罗德诺、维捷布斯克按固定 Natural Earth 城市点选择，涅斯维日另有 UNESCO 官方遗产资料；不把 UNESCO 署名为国家旅游局。不复制这些网页的正文或图片。

| 国家或地图单元 | 城市数 | 本次新增城市或城镇 | 代表性来源 |
| --- | ---: | --- | --- |
| 阿尔巴尼亚（ALB） | 5 | 培拉特、吉诺卡斯特、都拉斯、斯库台、地拉那 | [Albania National Tourism Agency](https://akt.gov.al/en/) |
| 安道尔（AND） | 5 | 安道尔城、奥尔迪诺、埃斯卡尔德斯-恩戈尔达尼、马萨纳、恩坎普 | [Andorra Turisme](https://visitandorra.com/es/actividades/itinerarios-audioguiados/) |
| 亚美尼亚（ARM） | 5 | 久姆里、埃里温、戈里斯、塞万、迪利然 | [Armenia Tourism Committee](https://armenia.travel/places-to-go/top-cities/) |
| 奥地利（AUT） | 5 | 格拉茨、林茨、萨尔茨堡、因斯布鲁克、维也纳 | [Austrian National Tourist Office](https://www.austria.info/en-gb/inspiration/cities/) |
| 阿塞拜疆（AZE） | 5 | 盖贝莱、甘贾、连科兰、巴库、舍基 | [Azerbaijan Tourism Board](https://azerbaijan.travel/regional-maps) |
| 比利时（BEL） | 5 | 根特、列日、布鲁日、安特卫普、布鲁塞尔 | [VISITFLANDERS](https://www.visitflanders.com/en/flemish-destinations) |
| 保加利亚（BGR） | 5 | 普罗夫迪夫、大特尔诺沃、瓦尔纳、布尔加斯、索非亚 | [Bulgaria Ministry of Tourism](https://www.tourism.government.bg/en/tourist-information-centers) |
| 波斯尼亚和黑塞哥维那（BIH） | 5 | 莫斯塔尔、巴尼亚卢卡、萨拉热窝、特雷比涅、亚伊采 | [Mostar Tourist Board](https://exploremostar.ba/en/) |
| 白俄罗斯（BLR） | 5 | 格罗德诺、维捷布斯克、布列斯特、明斯克、涅斯维日 | [固定 Natural Earth 城市点](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places.geojson)；[UNESCO 涅斯维日](https://whc.unesco.org/en/list/1196) |
| 瑞士（CHE） | 5 | 卢塞恩、卢加诺、伯尔尼、苏黎世、日内瓦 | [Switzerland Tourism](https://www.myswitzerland.com/en-gb/destinations/holiday-destinations/cities/cities-search/) |
| 塞浦路斯（CYP） | 5 | 拉纳卡、帕福斯、利马索尔、尼科西亚、阿依纳帕 | [Cyprus Deputy Ministry of Tourism](https://www.visitcyprus.com/useful-info/about-cyprus/) |
| 捷克（CZE） | 5 | 奥洛穆茨、布尔诺、布拉格、卡罗维发利、捷克克鲁姆洛夫 | [CzechTourism](https://www.visitczechia.com/en-us/things-to-do/places/landmarks/cities) |
| 德国（DEU） | 31 | 原有名录原样保留 | 见上文原有城市与来源 |
| 丹麦（DNK） | 5 | 罗斯基勒、欧登塞、奥尔堡、奥胡斯、哥本哈根 | [VisitDenmark](https://www.visitdenmark.com/denmark/destinations) |
| 西班牙（ESP） | 34 | 原有名录原样保留 | 见上文原有城市与来源 |
| 爱沙尼亚（EST） | 5 | 纳尔瓦、塔尔图、派尔努、塔林、库雷萨雷 | [Visit Estonia](https://visitestonia.com/en/where-to-go) |
| 芬兰（FIN） | 5 | 图尔库、奥卢、罗瓦涅米、坦佩雷、赫尔辛基 | [Visit Finland](https://www.visitfinland.com/en/fen-lan-lv-you-mu-di-di/) |
| 法国（FRA） | 38 | 原有名录原样保留 | 见上文原有城市与来源 |
| 英国（GBR） | 12 | 原有名录原样保留 | 见上文原有城市与来源 |
| 格鲁吉亚（GEO） | 5 | 库塔伊西、巴统、第比利斯、西格纳吉、姆茨赫塔 | [Georgian National Tourism Administration](https://georgia.travel/why-georgia-main-cities-towns) |
| 希腊（GRC） | 5 | 哈尼亚、罗得市、伊拉克利翁、塞萨洛尼基、雅典 | [Greek National Tourism Organisation](https://www.visitgreece.gr/en/islands/Cr%C3%A8te/Chania) |
| 克罗地亚（HRV） | 5 | 杜布罗夫尼克、斯普利特、扎达尔、普拉、萨格勒布 | [Dubrovnik Tourist Board](https://tzdubrovnik.hr/) |
| 匈牙利（HUN） | 5 | 埃格尔、佩奇、塞格德、德布勒森、布达佩斯 | [Hungarian Tourism Agency](https://visithungary.com/articles/autumn-in-hungary) |
| 爱尔兰（IRL） | 5 | 戈尔韦、基尔肯尼、科克、利默里克、都柏林 | [Tourism Ireland](https://www.ireland.com/en-gb/destinations/where-to-go/) |
| 冰岛（ISL） | 5 | 埃伊尔斯塔济、伊萨菲厄泽、阿克雷里、雷克雅未克、胡萨维克 | [Visit Iceland](https://www.visiticeland.com/icelandic-towns-and-villages/) |
| 意大利（ITA） | 38 | 原有名录原样保留 | 见上文原有城市与来源 |
| 哈萨克斯坦（KAZ） | 5 | 突厥斯坦、奇姆肯特、阿斯塔纳、阿拉木图、阿克套 | [Kazakh Tourism](https://www.kazakhstan.travel/en/regions/turkistan-province) |
| 科索沃（KOS） | 5 | 普里兹伦、普里什蒂纳、佩奇、格尼拉内、贾科维察 | [Ministry of Local Government Administration](https://mapl.rks-gov.net/wp-content/uploads/2018/09/3.Profili-i-komunave-anglisht.pdf) |
| 列支敦士登（LIE） | 5 | 瓦杜兹、特里森贝格、特里森、沙恩、巴尔策斯 | [Liechtenstein Tourism](https://en.tourismus.li/entdecken/ganzjaehrig/uebersicht/sehenswuerdigkeiten.html) |
| 立陶宛（LTU） | 5 | 克莱佩达、考纳斯、维尔纽斯、特拉凯、帕兰加 | [Lithuania Travel](https://lithuania.travel/en/mice/general-information/locations/mice-cities) |
| 卢森堡（LUX） | 5 | 卢森堡市、维安登、阿尔泽特河畔埃施、埃希特纳赫、克莱沃 | [Luxembourg for Tourism](https://www.visitluxembourg.com/tour/luxembourg-river-tour-on-the-banks-of-the-moselle-sauer-and-alzette) |
| 拉脱维亚（LVA） | 5 | 利耶帕亚、陶格夫匹尔斯、里加、锡古尔达、尤尔马拉 | [Latvia Travel / Investment and Development Agency of Latvia](https://www.latvia.travel/en/cities-latvia) |
| 摩纳哥（MCO） | 1 | 摩纳哥 | [Monaco Government Tourist and Convention Authority](https://www.visitmonaco.com/en/explore/activities/routes-and-walks/course/chemin-des-sculptures-rainier-iii) |
| 摩尔多瓦（MDA） | 5 | 伯尔兹、卡胡尔、基希讷乌、索罗卡、奥尔海伊 | [Moldova Travel national tourism platform](https://moldova.travel/en/places-to-visit/) |
| 北马其顿（MKD） | 5 | 比托拉、斯科普里、斯特鲁加、普里莱普、奥赫里德 | [Agency for Promotion and Support of Tourism of North Macedonia](https://tourismmacedonia.gov.mk/wp-content/uploads/2023/03/NOVA-TURISTICKA-KARTA-APPT.pdf) |
| 马耳他（MLT） | 5 | 瓦莱塔、斯利马、维多利亚（戈佐岛）、拉巴特、姆迪纳 | [Malta Tourism Authority](https://www.visitmalta.com/en/wtm-in-london/) |
| 黑山（MNE） | 5 | 波德戈里察、科托尔、新海尔采格、采蒂涅、布德瓦 | [National Tourism Organisation of Montenegro](https://www.montenegro.travel/en/explore-montenegro/nature-and-adventure/panoramic-roads-of-montenegro) |
| 荷兰（NLD） | 5 | 马斯特里赫特、乌得勒支、鹿特丹、海牙、阿姆斯特丹 | [Netherlands Board of Tourism and Conventions](https://www.holland.com/global/tourism/discover-the-netherlands/visit-the-cities) |
| 挪威（NOR） | 5 | 斯塔万格、特罗姆瑟、特隆赫姆、卑尔根、奥斯陆 | [Visit Norway / Innovation Norway](https://www.visitnorway.com/places-to-go/) |
| 波兰（POL） | 5 | 弗罗茨瓦夫、波兹南、格但斯克、克拉科夫、华沙 | [Polish Tourism Organisation](https://www.poland.travel/en/cities/) |
| 葡萄牙（PRT） | 5 | 科英布拉、波尔图、丰沙尔、里斯本、法鲁 | [Turismo de Portugal](https://www.visitportugal.com/en/sobre-portugal/como-chegar) |
| 罗马尼亚（ROU） | 5 | 锡比乌、布拉索夫、克卢日-纳波卡、布加勒斯特、锡吉什瓦拉 | [锡比乌市政府旅游](https://turism.sibiu.ro/en/)；[UNESCO 锡吉什瓦拉](https://whc.unesco.org/en/list/902) |
| 俄罗斯（RUS） | 160 | 原有名录原样保留 | 见上文原有城市与来源 |
| 圣马力诺（SMR） | 5 | 圣马力诺市、塞拉瓦莱、多马尼亚诺、博尔戈马焦雷、阿夸维瓦 | [San Marino Tourism Board](https://www.visitsanmarino.com/pub1/VisitSM/contenuto/About-San-Marino/I-NOVE-CASTELLI.html) |
| 塞尔维亚（SRB） | 5 | 苏博蒂察、尼什、诺维萨德、贝尔格莱德、新帕扎尔 | [National Tourism Organisation of Serbia](https://www.serbia.travel/en/cities/) |
| 斯洛伐克（SVK） | 5 | 班斯卡-比斯特里察、科希策、布拉迪斯拉发、班斯卡-什佳夫尼察、波普拉德 | [Slovakia Travel](https://slovakia.travel/o-slovensku/mesta) |
| 斯洛文尼亚（SVN） | 5 | 马里博尔、卢布尔雅那、皮兰、科佩尔、布莱德 | [Slovenian Tourist Board](https://www.slovenia.info/en/places-to-go/cities-and-destinations) |
| 瑞典（SWE） | 5 | 维斯比、乌普萨拉、哥德堡、马尔默、斯德哥尔摩 | [Visit Sweden](https://traveltrade.visitsweden.com/why-sweden/about-sweden/) |
| 土耳其（TUR） | 5 | 内夫谢希尔、安塔利亚、伊兹密尔、安卡拉、伊斯坦布尔 | [Türkiye Tourism Promotion and Development Agency](https://goturkiye.com/) |
| 乌克兰（UKR） | 5 | 乌日霍罗德、切尔诺夫策、利沃夫、敖德萨、基辅 | [Uzhhorod City Council Tourism](https://travel.rada-uzhgorod.gov.ua/?p=1564) |
| 梵蒂冈（VAT） | 1 | 梵蒂冈城 | [Vatican City State](https://www.vaticanstate.va/en/state-and-government/general-informations/geography.html) |

以下 6 个属地作为补充入口，不计入欧洲国家最低五城要求。奥兰旅游机构说明玛丽港是群岛唯一 town；泽西、根西本轮只选主要城市，没有声称岛上不存在其他居民点。直布罗陀采用英国政府确认的实际城市入口。

| 补充属地 | 城市数 | 本次新增城市或城镇 | 代表性来源 |
| --- | ---: | --- | --- |
| 奥兰（ALD） | 1 | 玛丽港 | [Visit Åland](https://visitaland.com/en/experience/outdoor/cycle-in-aland/the-aland-archipelago-trail/archipelago-trail-on-the-aland-main-island/) |
| 法罗群岛（FRO） | 5 | 克拉克斯维克、托尔斯港、韦斯特曼纳、特沃罗伊里、富格拉菲厄泽 | [Visit Faroe Islands](https://visitfaroeislands.com/en/see-do/inspiration-guides/popular-guides/regional-guides/northern-islands) |
| 根西（GGY） | 1 | 圣彼得港 | [Visit Guernsey](https://www.visitguernsey.com/experiences/st-peter-port/) |
| 直布罗陀（GIB） | 1 | 直布罗陀 | [UK Cabinet Office](https://www.gov.uk/government/news/government-re-affirms-city-status-of-gibraltar) |
| 马恩岛（IMN） | 5 | 道格拉斯、拉姆西、埃林港、皮尔、卡斯尔敦 | [Visit Isle of Man](https://www.visitisleofman.com/visitor-information/visitor-information-points/ancestry/1000) |
| 泽西（JEY） | 1 | 圣赫利尔 | [Visit Jersey](https://www.jersey.com/things-to-do/points-of-interest/listings/st-helier/) |

马耳他拉巴特与戈佐岛维多利亚（也叫 Rabat）是分属两岛的不同居民点，虽有同名别名仍分别保留；[戈佐官方资料](https://visitgozo.com/places/ir-rabat-victoria/)。赫拉克利翁、哈尼亚、罗得城、法鲁、丰沙尔等均采用城市点，不把岛屿或行政区整体作为城市。尼科西亚保留来源中心点并显式注明分隔首都和地图缓冲区例外。法罗小岛、戈佐岛、奥兰等部分真实点位落在简化国家多边形外，保留原坐标并记录空间例外，不人为挪点。

新增国家城市不触发旧国家足迹自动迁移：原 `world:<ISO3>` 记录仍须保留为历史记录，不能默认视为到过首都。本次没有增加首府迁移条目或执行数据库写入。

## 旧省州记录迁移

`world-city-migration-map.json` 原样保留已发布的 **20 条经过核实的首府关联**，包括新加坡五区到同一城市的五条关联。新西兰大区按议会主要驻地处理。其他未核实的旧省州记录保留待定位；不把代表城市选择或最大人口候选直接当作迁移依据。

迁移必须保留原日期、笔记及更新时间。多个旧分区指向一个城市或目标已有记录时，须保留冲突原记录，不能相互覆盖。数据文件只是地理映射，不执行数据库写入。本次旅游城市扩充不重写、不扩展、不重跑该迁移；固定文件 SHA-256 为 `2985f0a2adc82053cfdc6e48dad9a0801386bbe5ca446a03bf624da36e8797ee`，构建前后均必须逐字节一致。

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

源码应包含 `world-cities-build.py`、`world-cities-curation.json`、新增的 `world-cities-europe-curation.json`、`world-cities-geonames-20261022.json` 和生成的 `world-cities-validation.json`，以及地图数据目录原有的 `world-city-migration-map.json`、世界边界和索引。人工配置中的 `preservedCities` 是公开的上一版 1088 个可选地点与 1 个历史地点的元数据快照；正式重建逐字段复用它，避免重新排名改变用户已有城市。不需打包下载缓存或 Python 依赖目录。首次运行会创建缓存目录、下载固定 Natural Earth 文件并核验 SHA-256；正式重建须保留随源码分发的 GeoNames 固定快照。移除快照会启动重新采集流程，不能把此行为当作本版的可重复重建。

验收覆盖 JSON 可解析、城市 ID 唯一且符合格式、全部中文显示名、父区存在、坐标范围及有限性、每个非空州省地块 1～5 城、同城去重、所有首府迁移目标真实存在且同国同父区、新加坡多父区关联、28 个明确空间例外，以及既有世界边界和索引逐文件 SHA-256 不变。本版另核验新增 231 个地点、旧 1088 个可选地点逐字段保持、1 个历史地点保持在 `legacyCities`、51 个必须覆盖单元全部达到 5 城或已核实单城例外。固定输入重复构建得到相同城市 JSON；迁移 JSON 只读核验，绝不重写。详细数量、来源哈希和逐地块选择见 `scripts/world-cities-validation.json`。

本版已用无缓存的独立源码副本重新下载固定 Natural Earth 输入完成重建，城市 JSON、验收 JSON 与已发布迁移 JSON 的 SHA-256 均与主目录完全一致；也通过了原目录重复构建验证。

## 阿联酋七座首府（2026-10-29）

在此前 1319 个地点原样保留的基础上，新增阿联酋七座首府，当前共 **1326 个可选择城市或城镇**。每座首府只对应自己的酋长国，使用 `parentRegionId` 与 `capitalOf` 明确关联；没有增加其他旅游城市，也没有把阿联酋原有国家级记录迁移到首府。

[阿布扎比社区发展部《Our Emirates》](https://www.dcd.gov.ae/portal/portal/yearlyreport/english/OurEmirates-ar-en.pdf)的地图用“Capital of the Emirate”图例标注这七座城市；[阿联酋政府七个酋长国介绍](https://u.ae/en/about-the-uae/the-seven-emirates)核对七区范围。迪拜与拉斯海玛的政府页面、[阿治曼政府数据页](https://egov.ajman.ae/en/ajman-data)、[沙迦档案馆](https://www.alwathiqa.ae/en/State/Sharjah/)也明确对应城市的首府身份。

| 酋长国编号 | 首府 | 稳定城市编号 | 坐标来源 |
| --- | --- | --- | --- |
| `world:ARE:AE-AZ` | 阿布扎比 Abu Dhabi | `world:ARE:city-1159150565` | Natural Earth |
| `world:ARE:AE-DU` | 迪拜 Dubai | `world:ARE:city-1159151497` | Natural Earth |
| `world:ARE:AE-SH` | 沙迦 Sharjah | `world:ARE:city-1159126943` | Natural Earth |
| `world:ARE:AE-AJ` | 阿治曼 Ajman | `world:ARE:city-gn292932` | GeoNames 292932 |
| `world:ARE:AE-UQ` | 乌姆盖万 Umm Al Quwain | `world:ARE:city-1159126925` | Natural Earth |
| `world:ARE:AE-RK` | 拉斯海玛 Ras Al Khaimah | `world:ARE:city-1159134277` | Natural Earth |
| `world:ARE:AE-FU` | 富查伊拉 Fujairah | `world:ARE:city-1159134281` | Natural Earth |

六座城市的名称、稳定 `NE_ID` 和原始坐标取自同一固定 Natural Earth 提交的 [Populated Places 文件](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places.geojson)，SHA-256 为 `9b8e3de09048ef00dfc70357dbb9fa324493f214b5e0ae4daf1aa79a8d10116b`，沿用 public domain 许可。沙迦保留“夏尔迦”、富查伊拉保留“富吉拉”等来源别名，支持原有名称习惯搜索。

阿治曼未在该 Natural Earth 城市点文件单列，使用 [GeoNames 292932](https://www.geonames.org/292932/) 的真实城市点 `[55.47878,25.40177]`，来源类别为 `PPLA`、国家 `AE`、一级行政代码 `02`。该行取自工程已冻结的 2026-10-22 `cities1000.zip` 缓存（SHA-256 `9d3916f7a9448bb4ea45e93c06c5413d2cceb1a89e03f75c2178bbb08af12018`，行修改日期 2026-04-13），必要字段和别名完整冻结在 `scripts/build-uae-data.cjs` 的 `AJMAN` 常量中，复现不依赖实时搜索或新版下载。GeoNames 署名与 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可继续适用。城市总来源数现为 1160 个 Natural Earth、166 个 GeoNames。

七个城市均保留真实来源坐标，并位于各自酋长国原始几何内，无需移动标记点或增加边界例外。`world/ARE.geo.json` 另保留的两片来源共管区域只用于背景显示，没有独立城市、首府或记录。`world-city-migration-map.json` 保持原来的 20 条映射和 SHA-256 `2985f0a2adc82053cfdc6e48dad9a0801386bbe5ca446a03bf624da36e8797ee`，旧 `world:ARE` 记录继续作为国家历史足迹；不能据其推测到过阿布扎比或迪拜。

本次使用 `node scripts/build-uae-data.cjs` 局部构建，`--check` 可检查可重复性。脚本只生成阿联酋详图、修改该国索引、增加七城，并逐项保留其他国家、城市、历史城市及欧洲覆盖清单。此前全世界构建脚本与冻结配置保留作历史版本的复现依据，不用于覆盖此次新增内容。
