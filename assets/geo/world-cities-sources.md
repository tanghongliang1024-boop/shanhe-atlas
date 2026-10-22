# 海外代表城市数据与首府迁移依据

2026-10-22 整理。本数据为 25 国、644 个当前可选州省地块提供旅行地点；城市构建不改动边界、中国大陆县区、台湾 22 县市或港澳数据。`world-cities.json` 包含 **1088 个唯一城市或城镇**：保留旧版 1006 个可选地点的全部字段，新增 82 个旅游城镇；原 IN-AR 下的 Itanagar 原始地点转存 `legacyCities`，供历史记录详情识别。637 个地块提供 1～5 个地点，另外 7 个来源单列的离岛地块有明确无城市例外。新加坡五个地块共用一个城市记录。

这些是用于旅行足迹的代表地点，不是完整城市名录、人口排名、实时行政首府名录或精确行政边界判定。不同来源年代不一；城市经纬度保留来源位置，未将城市点移动到简化地块内。当前有 6 个已注明的显示边界例外：马穆楚、白马市、世宗、山打根、科隆镇和阳东镇。城市所属来自来源信息与已有地图的空间关联；海岸线和岛屿概略化会使真实城市点落在显示边界外。

## 来源与许可

### Natural Earth

Made with Natural Earth. 作者及贡献者包括 Tom Patterson、Nathaniel Vaughn Kelso 等。991 个当前可选地点使用 Natural Earth 城市点及稳定 `NE_ID`。

- [Populated Places，1:10m](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/)：涵盖首都、许多一级行政驻地及重要城市和城镇。其重要性等级服务于地图显示，人口字段可能包含都会区，不能直接当作市辖区人口排名。
- [固定版本 GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places.geojson)，提交 `ca96624a56bd078437bca8184e78163e5039ad19`。
- 源文件 SHA-256：`9b8e3de09048ef00dfc70357dbb9fa324493f214b5e0ae4daf1aa79a8d10116b`。
- [Natural Earth 使用条款](https://www.naturalearthdata.com/about/terms-of-use/)：地图数据为 public domain；多语言名称主要来自 Wikidata CC0。

应用添加了州省关联、中文显示名修订、来源标记、去重及选择规则。源中已发现的翻译混用或人口疑点在构建配置中明确修正或排除，例如 Kuta、Cuttack 的英文名，以及两个无法可靠核实的大人口同名巴西地点。

### GeoNames

© [GeoNames](https://www.geonames.org/about.html)，采用 [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)。97 个当前可选补充地点使用其 WGS84 坐标、英文名称及别名。

- [下载说明与字段定义](https://download.geonames.org/export/dump/readme.txt)。本次从 `cities1000.zip`、`AU.zip`、`LA.zip` 提取所需记录，保留为 `scripts/world-cities-geonames-20261022.json` 固定快照。
- 快照保存原始下载 URL、SHA-256、GeoNames ID、名称、别名、坐标、地点类型、人口及来源修改日期。正式重建读取快照，避免每日下载更新改变稳定产物。
- 每个补充城市的 `sourceUrl` 链接到相应 GeoNames 记录。应用修改包括筛选、州省关联、显示名与别名补充、坐标保留 6 位小数；没有重新测绘地点。

### 州省关联数据库

地块关联使用应用已有边界，详细来源见 [世界地图数据与许可](world-data-sources.md)。其中柬埔寨、老挝和缅甸边界含 © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) 的数据库衍生内容。相应地块关联和本次汇总地图数据库按 [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) 提供；底层 Natural Earth 和 GeoNames 内容仍分别保留 public domain 与 CC BY 4.0 条款。

完整机器可读衍生数据库可直接下载 [world-cities.json](world-cities.json)，构建脚本、固定补充输入和人工配置随工程源码发布。上述地图数据不包含任何用户的日期、笔记、邮箱或私人旅行记录。

## 选择与稳定 ID

基础名录首先保留已核实的迁移首府和明确人工选择；其他地点参考来源行政驻地字段。可选的第二城市按 Natural Earth `SCALERANK`、`LABELRANK` 和人口排序，人工检查重要城市与都会区近郊重复问题。这里只用人口辅助选择，不声称选出了各省人口最大的两城。

同一个 GeoNames ID 或同名且邻近的跨来源地点归为同一城市；不会仅因两个市中心相近而合并不同城市。城市 ID 使用 `world:<ISO3>:city-<NE_ID>`，GeoNames 补充点使用 `world:<ISO3>:city-gn<GeoNamesID>`，不依赖数组顺序。

`parentRegionId` 和 `provinceCode` 为既有完整州省 ID，`province` 为州省中文名，`country` / `countryCode` 为国家名称及代码，`center` 为 `[经度, 纬度]`，`level` 为 `city`。`aliases` 保留来源英文及当地别名。`placeType` 区分普通城市/城镇与明确村落，`capitalOf` 仅用于下述已核实迁移首府。新增旅游地点带有 `tourism: true`、`tourismSource` 和 `tourismSourceName`；此标签仅表示本次扩充条目，未打标签的旧城市也可能是知名旅行目的地。

新加坡的同一记录带有全部五个 `regionIds`，用一个城市档案关联五个地块。新加坡是城市国家，五区是社区发展理事会分区：[外交部说明](https://www.mfa.gov.sg/about-singapore/)、[五区说明](https://www.cdc.gov.sg/about-us/five-districts/)。

## 特殊地点和空白地块

- 杰维斯湾提供真实的“杰维斯湾村（村镇）”，没有虚构独立大城市：[澳大利亚政府介绍](https://www.infrastructure.gov.au/territories-regions-cities/territories/jervis-bay-territory/governance-administration)。
- 老挝赛宋本提供已能核实坐标的“万銮（村镇）”；未据不可靠的首府位置自动迁移旧省记录：[GeoNames 地点](https://www.geonames.org/1658268/)。
- 新西兰六组自然保护离岛没有加入城市记录。研究站和岛屿标签不当作城市：[Raoul Island](https://www.doc.govt.nz/raoulisland)、[Three Kings / Manawatāwhi](https://www.doc.govt.nz/nature/habitats/offshore-islands/te-hiku-far-north-islands/)、[亚南极保护岛屿工作说明](https://www.doc.govt.nz/news/media-releases/2024-media-releases/largest-subantarctic-field-season-wraps-up/)。
- 俄罗斯一个来源未标行政名称的离岸要素没有可核实城市；数据明确标注“未核实”，不推测其人口或首府。
- 马约特选择马穆楚，依据 [INSEE 2026 官方地理代码](https://www.insee.fr/fr/metadonnees/geographie/departement/976-mayotte)；来源旧首府藻德济作为另一个旅行地点保留。

全部例外在 `world-cities.json.exceptions` 中可供界面读取；不通过创建同名假城市填满空白地块。

## 旅游城市扩充与官方依据

此次在 21 国新增 82 个真实城镇，原有新加坡、文莱、柬埔寨和老挝的主要旅行地点保持原样。一般旅游州省可有 2～4 城，本版最多 5 城。选择参考国家或地方官方旅游机构、旅游局及市政府资料；不复制旅游文章正文、照片或商标。旅游网页仅核验地点身份和旅行代表性，坐标仍来自上文许可明确的 Natural Earth / GeoNames。

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

源码应包含 `world-cities-build.py`、`world-cities-curation.json`、`world-cities-geonames-20261022.json` 和生成的 `world-cities-validation.json`，以及地图数据目录原有的 `world-city-migration-map.json`。人工配置中的 `preservedCities` 是公开的旧版 1007 地点元数据快照；正式重建逐字段复用它，避免重新排名改变用户已有城市。不需打包下载缓存或 Python 依赖目录。首次运行会创建缓存目录、下载固定 Natural Earth 文件并核验 SHA-256；正式重建须保留随源码分发的 GeoNames 固定快照。移除快照会启动重新采集流程，不能把此行为当作本版的可重复重建。

验收覆盖 JSON 可解析、城市 ID 唯一且符合格式、全部中文显示名、父区存在、坐标范围及有限性、每个非空地块 1～5 城、同城去重、所有首府迁移目标真实存在且同国同父区、新加坡多父区关联、6 个明确空间例外，以及既有世界边界和索引逐文件 SHA-256 不变。另外验收 82 个新增地点、旧 1006 个可选地点逐字段保持、1 个旧地点完整转入 `legacyCities`。固定输入重复构建得到相同城市 JSON；迁移 JSON 只读核验，绝不重写。详细数量、来源哈希和逐地块选择见 `scripts/world-cities-validation.json`。
