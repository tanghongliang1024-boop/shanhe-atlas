(function(root){
  'use strict';
  const data = {
  "version": 3,
  "coordinateNote": "地图上的点表示景区的大致位置，不作为入口导航或登顶证明。",
  "note": "五岳、中国100景、世界100景共201处不同目的地，重合景点只记录一次。中国与世界清单依据“图说天下·国家地理系列”书目整理，具体版本与计数方式见下方；不代表《中国国家地理》杂志或美国National Geographic发布的官方榜单。广域目的地采用代表点，不作为导航位置。",
  "themes": [
    {
      "id": "wuyue",
      "name": "五岳",
      "description": "从东岳到西岳，收集属于自己的五岳旅行印章。",
      "badgeName": "五岳足迹",
      "placeIds": [
        "poi:CHN:taishan",
        "poi:CHN:huashan",
        "poi:CHN:hengshan-hunan",
        "poi:CHN:hengshan-shanxi",
        "poi:CHN:songshan"
      ]
    },
    {
      "id": "china-most-beautiful-100",
      "name": "中国100景",
      "badgeName": "中国百景足迹",
      "description": "从中国山川到古城古迹，沿图说天下·国家地理系列书目，收集100处旅行记忆。",
      "source": {
        "title": "《图说天下·国家地理系列：中国最美的100个地方》",
        "edition": "北京联合出版公司，2012年；ISBN 9787550207479",
        "url": "https://item.jd.com/product/lUlGnApyYX20r8JiRukd6A.html",
        "note": "公开目录98条。“孔庙、孔府、孔林”拆为三个独立打卡点，按本应用口径共100处。"
      },
      "placeIds": [
        "poi:CHN:mount-everest",
        "poi:CHN:gongga-shan",
        "poi:CHN:bogda-peak",
        "poi:CHN:meili-snow-mountains",
        "poi:CHN:taishan",
        "poi:CHN:huashan",
        "poi:CHN:mount-emei",
        "poi:CHN:mount-wutai",
        "poi:CHN:huangshan",
        "poi:CHN:mount-wuyi",
        "poi:CHN:alishan",
        "poi:CHN:lushan",
        "poi:CHN:taklamakan-desert",
        "poi:CHN:jiangjun-gobi",
        "poi:CHN:flaming-mountains",
        "poi:CHN:lop-nur",
        "poi:CHN:urho-ghost-city",
        "poi:CHN:ngari",
        "poi:CHN:mingsha-dunhuang",
        "poi:CHN:yarlung-tsangpo-grand-canyon",
        "poi:CHN:yangtze-three-gorges",
        "poi:CHN:taroko-gorge",
        "poi:CHN:nujiang-grand-canyon",
        "poi:CHN:loess-plateau",
        "poi:CHN:xiaozhai-tiankeng",
        "poi:CHN:zhijin-cave",
        "poi:CHN:shilin",
        "poi:CHN:changbai-heaven-lake",
        "poi:CHN:tianshan-tianchi",
        "poi:CHN:namtso",
        "poi:CHN:qinghai-lake",
        "poi:CHN:kanas-lake",
        "poi:CHN:west-lake-hangzhou",
        "poi:CHN:chaka-salt-lake",
        "poi:CHN:zhaoqing-star-lake",
        "poi:CHN:sun-moon-lake",
        "poi:CHN:erhai",
        "poi:CHN:li-river",
        "poi:CHN:tarim-river",
        "poi:CHN:tamsui-river",
        "poi:CHN:wucai-bay",
        "poi:CHN:three-parallel-rivers",
        "poi:CHN:detian-waterfall",
        "poi:CHN:huangguoshu",
        "poi:CHN:hukou-waterfall",
        "poi:CHN:tianya-haijiao",
        "poi:CHN:xisha-islands",
        "poi:CHN:penghu-islands",
        "poi:CHN:gulangyu",
        "poi:CHN:yalong-bay",
        "poi:CHN:dongzhai-harbour",
        "poi:CHN:yehliu",
        "poi:CHN:greater-khingan",
        "poi:CHN:qilian-grasslands",
        "poi:CHN:shennongjia",
        "poi:CHN:xishuangbanna",
        "poi:CHN:mount-siguniang",
        "poi:CHN:fanjingshan",
        "poi:CHN:hulunbuir-grassland",
        "poi:CHN:zhalong",
        "poi:CHN:wolong",
        "poi:CHN:bashang-grasslands",
        "poi:CHN:shangri-la",
        "poi:CHN:wulingyuan",
        "poi:CHN:jiuzhaigou",
        "poi:CHN:daocheng",
        "poi:CHN:huanglong",
        "poi:CHN:great-wall",
        "poi:CHN:beijing-forbidden-city",
        "poi:CHN:temple-of-heaven",
        "poi:CHN:potala-palace",
        "poi:CHN:chengde-mountain-resort",
        "poi:CHN:confucius-temple-qufu",
        "poi:CHN:kong-family-mansion-qufu",
        "poi:CHN:confucius-cemetery-qufu",
        "poi:CHN:wudang-ancient-buildings",
        "poi:CHN:yungang-grottoes",
        "poi:CHN:longmen-grottoes",
        "poi:CHN:dazu-rock-carvings",
        "poi:CHN:classical-gardens-suzhou",
        "poi:CHN:summer-palace",
        "poi:CHN:ming-qing-imperial-tombs",
        "poi:CHN:dujiangyan-irrigation-system",
        "poi:CHN:turpan-karez",
        "poi:CHN:beijing-hangzhou-grand-canal",
        "poi:CHN:yuanyang-rice-terraces",
        "poi:CHN:pingyao-ancient-city",
        "poi:CHN:fenghuang-ancient-town",
        "poi:CHN:lijiang-old-town",
        "poi:CHN:anhui-traditional-dwellings",
        "poi:CHN:fujian-tulou",
        "poi:CHN:kaiping-diaolou",
        "poi:CHN:wuzhen",
        "poi:CHN:tunxi-old-street",
        "poi:CHN:zhouzhuang",
        "poi:CHN:harbin",
        "poi:CHN:dalian",
        "poi:CHN:qingdao",
        "poi:CHN:shanghai",
        "poi:CHN:hong-kong"
      ]
    },
    {
      "id": "world-most-beautiful-100",
      "name": "世界100景",
      "badgeName": "世界百景足迹",
      "description": "山脉、海岛、古迹与城市，跟随图说天下·国家地理系列书目探索世界100处目的地。",
      "source": {
        "title": "《图说天下·国家地理系列：全球最美的100个地方》",
        "edition": "北京联合出版公司，2012年；ISBN 9787550207325",
        "url": "https://item.jd.com/product/lCK8Y0MAnFV2BxTbfTA9Iw.html",
        "note": "本版公开目录核实99条。经用户选择，补入同系列《人一生要去的100个地方（世界篇）》推荐的奈良，合计100处；不是声称单本原目录有100条。",
        "additionalSources": [
          {
            "title": "奈良补充来源：《人一生要去的100个地方（世界篇）》，ISBN 9787550207523",
            "url": "https://www.yami.com/us/zh/p/100/3114002981"
          }
        ]
      },
      "placeIds": [
        "poi:NPL:himalayas",
        "poi:CHE:alps",
        "poi:TZA:kilimanjaro",
        "poi:ARG:andes",
        "poi:CAN:rocky-mountains",
        "poi:USA:grand-canyon",
        "poi:KEN:east-african-rift",
        "poi:ZAF:cape-of-good-hope",
        "poi:USA:mount-mckinley",
        "poi:USA:arches",
        "poi:USA:badlands",
        "poi:MAR:sahara-desert",
        "poi:AUS:uluru",
        "poi:AUS:pinnacles-desert",
        "poi:ITA:mount-etna",
        "poi:USA:kilauea",
        "poi:NZL:ngauruhoe",
        "poi:USA:haleakala-crater",
        "poi:CAN:niagara-falls",
        "poi:ZWE:victoria-falls",
        "poi:VEN:angel-falls",
        "poi:ARG:iguazu-falls",
        "poi:BRA:amazon-rainforest",
        "poi:AUS:queensland-wet-tropics",
        "poi:ATA:antarctica",
        "poi:USA:great-plains",
        "poi:GBR:giants-causeway",
        "poi:TUR:pamukkale",
        "poi:EGY:nile-river",
        "poi:HUN:danube-river",
        "poi:USA:mississippi-river",
        "poi:USA:florida-everglades",
        "poi:KEN:lake-nakuru",
        "poi:PER:lake-titicaca",
        "poi:AUS:lake-eyre",
        "poi:AUS:port-campbell",
        "poi:AUS:great-barrier-reef",
        "poi:NZL:rotorua",
        "poi:THA:phang-nga-bay",
        "poi:ECU:galapagos-islands",
        "poi:TZA:serengeti",
        "poi:USA:yellowstone-national-park",
        "poi:TZA:ngorongoro-crater",
        "poi:FIN:lapland",
        "poi:CHE:switzerland",
        "poi:ISL:iceland",
        "poi:GBR:english-lake-district",
        "poi:USA:vermont-forests",
        "poi:CAN:waterton-lakes",
        "poi:USA:mount-rainier",
        "poi:NOR:norwegian-coast",
        "poi:FRA:provence",
        "poi:ITA:tuscany",
        "poi:USA:hawaii",
        "poi:SYC:seychelles",
        "poi:GRC:crete",
        "poi:AUS:gold-coast",
        "poi:NZL:queenstown",
        "poi:MDV:maldives",
        "poi:IDN:bali",
        "poi:PYF:tahiti",
        "poi:JPN:hokkaido",
        "poi:CHN:shangri-la",
        "poi:CHN:tibet",
        "poi:GRC:acropolis-athens",
        "poi:EGY:great-pyramid-giza",
        "poi:GBR:stonehenge",
        "poi:VAT:vatican-city",
        "poi:ITA:colosseum",
        "poi:PSX:jerusalem",
        "poi:SYR:palmyra",
        "poi:JOR:jerash",
        "poi:IRQ:babylon",
        "poi:GTM:maya-sites",
        "poi:PER:machu-picchu",
        "poi:MEX:chichen-itza",
        "poi:JOR:petra",
        "poi:KHM:angkor",
        "poi:IND:taj-mahal",
        "poi:SAU:makkah",
        "poi:EGY:karnak-temple",
        "poi:CHL:easter-island",
        "poi:FRA:paris",
        "poi:ITA:venice",
        "poi:ESP:barcelona",
        "poi:AUT:salzburg",
        "poi:GBR:london",
        "poi:RUS:saint-petersburg",
        "poi:AUS:sydney",
        "poi:USA:new-york-city",
        "poi:USA:san-francisco",
        "poi:USA:new-orleans",
        "poi:BRA:rio-de-janeiro",
        "poi:MAR:casablanca",
        "poi:SYR:damascus",
        "poi:TUR:istanbul",
        "poi:NPL:pokhara",
        "poi:JPN:kyoto",
        "poi:CHN:hong-kong",
        "poi:JPN:nara"
      ]
    }
  ],
  "places": [
    {
      "id": "poi:CHN:taishan",
      "name": "泰山",
      "nameEn": "Mount Tai",
      "aliases": [
        "东岳",
        "東岳",
        "岱宗",
        "Taishan",
        "Tai Shan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "370000"
      ],
      "regionIds": [
        "370900"
      ],
      "location": "山东 · 泰安",
      "coordinates": [
        117.1,
        36.27
      ],
      "themeIds": [
        "wuyue",
        "china-most-beautiful-100"
      ],
      "stampLabel": "东岳",
      "description": "山路连接古建、石刻与层叠山峦。泰山把悠久的人文记忆留在了自然风景之中。",
      "coordinateMethod": "UNESCO 遗产参考坐标，四舍五入至小数点后两位。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 泰山",
          "url": "https://whc.unesco.org/en/list/437/"
        }
      ]
    },
    {
      "id": "poi:CHN:huashan",
      "name": "华山",
      "nameEn": "Mount Hua",
      "aliases": [
        "西岳",
        "西嶽",
        "華山",
        "太华山",
        "Huashan",
        "Hua Shan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "610000"
      ],
      "regionIds": [
        "610500"
      ],
      "location": "陕西 · 渭南 · 华阴",
      "coordinates": [
        110.09,
        34.52
      ],
      "themeIds": [
        "wuyue",
        "china-most-beautiful-100"
      ],
      "stampLabel": "西岳",
      "description": "花岗岩山体塑造出陡峭的峰峦。沿途的古道、道观与摩崖石刻，记录着华山的山岳文化。",
      "coordinateMethod": "官方公开资料所列核心景区经纬度范围的中点，四舍五入至小数点后两位。",
      "sources": [
        {
          "title": "文化和旅游部 · 渭南市华山风景区",
          "url": "https://sjfw.mct.gov.cn/site/dataservice/culdetails?curId=10&id=35093"
        },
        {
          "title": "陕西省生态环境厅公开环评 · 华山风景名胜区范围（正文第 134 页）",
          "url": "https://sthjt.shaanxi.gov.cn/sy/gs/202203/P020241011591564756796.pdf"
        }
      ]
    },
    {
      "id": "poi:CHN:hengshan-hunan",
      "name": "衡山",
      "nameEn": "Mount Heng (Hunan)",
      "aliases": [
        "南岳",
        "南嶽",
        "南岳衡山",
        "祝融峰",
        "Hengshan Hunan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "430000"
      ],
      "regionIds": [
        "430400"
      ],
      "location": "湖南 · 衡阳 · 南岳区",
      "coordinates": [
        112.67,
        27.27
      ],
      "themeIds": [
        "wuyue"
      ],
      "stampLabel": "南岳",
      "description": "南岳衡山位于湖南，祝融峰周围群峰与森林相依。山地湿润的气候，孕育了丰富的植物景观。",
      "coordinateMethod": "湖南省林业局所列南岳衡山自然保护区经纬度范围的中点，四舍五入至小数点后两位。",
      "sources": [
        {
          "title": "湖南省林业局 · 湖南省南岳衡山自然保护区",
          "url": "https://lyj.hunan.gov.cn/lyj/ztzl/gdzt/zrbhq/201512/t20151227_2587456.html"
        }
      ]
    },
    {
      "id": "poi:CHN:hengshan-shanxi",
      "name": "恒山",
      "nameEn": "Mount Heng (Shanxi)",
      "aliases": [
        "北岳",
        "北嶽",
        "恆山",
        "北岳恒山",
        "天峰岭",
        "Hengshan Shanxi"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "140000"
      ],
      "regionIds": [
        "140200"
      ],
      "location": "山西 · 大同 · 浑源",
      "coordinates": [
        113.72,
        39.68
      ],
      "themeIds": [
        "wuyue"
      ],
      "stampLabel": "北岳",
      "description": "北岳恒山位于山西浑源，主峰为天峰岭。依山而建的古建筑与峭壁，一起构成了这里的山岳风景。",
      "coordinateMethod": "景区内公开野外调查记录坐标，四舍五入至小数点后两位；不是主峰或入口坐标。",
      "sources": [
        {
          "title": "浑源县人民政府 · 恒山",
          "url": "https://www.hunyuan.gov.cn/hyxrmzfz/sqgllssy/202307/073531f44aa04840853ca5c6219bb2d7.shtml"
        },
        {
          "title": "植物资源与环境学报 · 山西省植物新记录（2026，35(2)：121–124）",
          "url": "https://zwzy.jib.ac.cn/ClientFile/UploadFile/01cbdc21-5f0b-40e2-81d5-451e268fd92f/File/15%E6%AE%B5%E8%BF%8E%E6%B8%AF.pdf"
        }
      ]
    },
    {
      "id": "poi:CHN:songshan",
      "name": "嵩山",
      "nameEn": "Mount Song",
      "aliases": [
        "中岳",
        "中嶽",
        "太室山",
        "少室山",
        "Songshan",
        "Song Shan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "410000"
      ],
      "regionIds": [
        "410100"
      ],
      "location": "河南 · 郑州 · 登封",
      "coordinates": [
        113.06,
        34.5
      ],
      "themeIds": [
        "wuyue"
      ],
      "stampLabel": "中岳",
      "description": "太室山与少室山构成了嵩山的主体。山间的岩层与人文遗迹，让一次旅行同时遇见地质与历史。",
      "coordinateMethod": "登封市政府所列嵩山世界地质公园经纬度范围的中点，四舍五入至小数点后两位。",
      "sources": [
        {
          "title": "登封市人民政府 · 嵩山地质文化",
          "url": "https://www.dengfeng.gov.cn/dzwh/5263183.jhtml"
        }
      ]
    },
    {
      "id": "poi:CHN:shangri-la",
      "name": "香格里拉",
      "nameEn": "Shangri-La",
      "aliases": [
        "香格里拉市",
        "中甸",
        "Shangrila",
        "Zhongdian"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "530000"
      ],
      "regionIds": [
        "533400"
      ],
      "location": "云南 · 迪庆 · 香格里拉",
      "coordinates": [
        99.71,
        27.83
      ],
      "themeIds": [
        "china-most-beautiful-100",
        "world-most-beautiful-100"
      ],
      "stampLabel": "香格里拉",
      "description": "迪庆高原上的香格里拉连接雪山、湖泊与牧场。这里按广域目的地记录，可把实际到访的村镇或景区写进旅行笔记。",
      "coordinateMethod": "采用本项目归档 china-index.json 中香格里拉市的地图显示代表点，取两位小数；表示香格里拉广域目的地，不是任何景区的入口导航点。",
      "sources": [
        {
          "title": "香格里拉市人民政府 · 旅游资源",
          "url": "https://www.xianggelila.gov.cn/dqgk/lyzy.html"
        }
      ]
    },
    {
      "id": "poi:CHN:jiuzhaigou",
      "name": "九寨沟",
      "nameEn": "Jiuzhaigou Valley",
      "aliases": [
        "九寨沟风景名胜区",
        "九寨溝",
        "Jiuzhai Valley"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "510000"
      ],
      "regionIds": [
        "513200"
      ],
      "location": "四川 · 阿坝 · 九寨沟",
      "coordinates": [
        103.92,
        33.08
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "九寨沟",
      "description": "川北山谷中，湖泊、瀑布与森林沿水流相连。水中的色彩与山林的季节变化，共同构成九寨沟的景观。",
      "coordinateMethod": "UNESCO 九寨沟遗产参考坐标 N33°4′59.988″、E103°55′0.012″，换算后取两位小数；仅示意遗产区域，不作入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 九寨沟风景名胜区",
          "url": "https://whc.unesco.org/en/list/637/"
        }
      ]
    },
    {
      "id": "poi:CHN:xishuangbanna",
      "name": "西双版纳",
      "nameEn": "Xishuangbanna",
      "aliases": [
        "西双版纳傣族自治州",
        "西雙版納",
        "Sipsongpanna"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "530000"
      ],
      "regionIds": [
        "532800"
      ],
      "location": "云南 · 西双版纳（勐仑片区代表点）",
      "coordinates": [
        101.27,
        21.92
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "西双版纳",
      "description": "西双版纳的热带森林保留着丰富的植物与动物生境。这里按地区记录，地图以勐仑植物园片区示意，可在笔记中补充具体行程。",
      "coordinateMethod": "选用中科院西双版纳热带植物园勐仑片区作为广域目的地代表点，依据西双版纳站公布的 E101°16′、N21°55′取两位小数；不是全州中心或入口导航点。",
      "sources": [
        {
          "title": "国家生态系统观测研究网络 · 西双版纳站地理位置",
          "url": "https://cnern.cern.ac.cn/getContent_class.action?article_class_id=5&class_id=bnf3&id=32679&pid=bnfroot"
        }
      ]
    },
    {
      "id": "poi:CHN:west-lake-hangzhou",
      "name": "西湖",
      "nameEn": "West Lake, Hangzhou",
      "aliases": [
        "杭州西湖",
        "西子湖",
        "Hangzhou West Lake",
        "Xihu"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "330000"
      ],
      "regionIds": [
        "330100"
      ],
      "location": "浙江 · 杭州",
      "coordinates": [
        120.14,
        30.24
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "西湖",
      "description": "西湖把湖面、堤岸、岛屿与周围山色连成一体。沿湖的园林和古建筑，让杭州的自然风景与文化记忆彼此相融。",
      "coordinateMethod": "UNESCO 杭州西湖文化景观地图页参考坐标 N30°14′15″、E120°8′27″，换算后取两位小数；不作入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 杭州西湖文化景观",
          "url": "https://whc.unesco.org/en/list/1334/"
        },
        {
          "title": "UNESCO · 西湖文化景观地理数据",
          "url": "https://whc.unesco.org/en/list/1334/maps/"
        }
      ]
    },
    {
      "id": "poi:CHN:erhai",
      "name": "洱海",
      "nameEn": "Erhai Lake",
      "aliases": [
        "大理洱海",
        "Er Hai"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "530000"
      ],
      "regionIds": [
        "532900"
      ],
      "location": "云南 · 大理",
      "coordinates": [
        100.18,
        25.78
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "洱海",
      "description": "洱海是大理高原上的湖泊，湖岸村落与周围山地相连。沿岸不同方向的风景，可以分别写入同一份洱海旅行记录。",
      "coordinateMethod": "云南省养殖水域滩涂规划表 2-2 所列洱海范围 E100°05′—100°17′、N25°35′—25°58′的中点，取两位小数；是湖区示意点，不是官方中心或导航点。",
      "sources": [
        {
          "title": "云南省农业农村厅 · 云南省养殖水域滩涂规划（表 2-2）",
          "url": "https://nync.yn.gov.cn/uploadfile/s38/2023/0214/20230214051416325.pdf"
        },
        {
          "title": "云南省自然资源厅 · 洱海综合治理生态产品价值实现案例",
          "url": "https://dnr.yn.gov.cn/html/2024/dxjy_0419/46131.html"
        }
      ]
    },
    {
      "id": "poi:CHN:daocheng",
      "name": "稻城",
      "nameEn": "Daocheng",
      "aliases": [
        "稻城县",
        "稻城亚丁",
        "Daocheng County",
        "Dabpa"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "510000"
      ],
      "regionIds": [
        "513300"
      ],
      "location": "四川 · 甘孜 · 稻城",
      "coordinates": [
        100.3,
        29.04
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "稻城",
      "description": "稻城的旅行范围从海子山延伸到亚丁一带，包含高原湖泊与山地景观。这里记录整个稻城目的地，可在笔记中区分具体到访地点。",
      "coordinateMethod": "采用本项目归档 china-index.json 中稻城县的地图显示代表点，取两位小数；表示稻城广域目的地，不是亚丁景区入口或登山点。",
      "sources": [
        {
          "title": "稻城县人民政府 · 稻城概况",
          "url": "https://www.daocheng.gov.cn/dcxrmzf/c102540/202011/762216a9605243eebdc2bed7271456b6.shtml"
        },
        {
          "title": "中国地质调查局 · 稻城地质景观",
          "url": "https://www.cgs.gov.cn/ywdt/dwdt/201905/t20190530_830735.html"
        }
      ]
    },
    {
      "id": "poi:CHN:zhalong",
      "name": "扎龙",
      "nameEn": "Zhalong Wetland",
      "aliases": [
        "扎龙湿地",
        "扎龙自然保护区",
        "扎龙国家级自然保护区",
        "Zhalong Nature Reserve"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "230000"
      ],
      "regionIds": [
        "230200",
        "230600"
      ],
      "location": "黑龙江 · 齐齐哈尔 / 大庆",
      "coordinates": [
        124.2,
        47.2
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "扎龙",
      "description": "扎龙由芦苇沼泽、浅湖和草地组成，为鹤类与其他迁徙水鸟提供生境。湿地跨越齐齐哈尔与大庆的部分地区。",
      "coordinateMethod": "拉姆萨尔国际重要湿地名录扎龙参考坐标 N47°12′、E124°12′，换算为两位小数；表示湿地位置，不作观鸟区入口导航。",
      "sources": [
        {
          "title": "国家林业和草原局 · 黑龙江扎龙国际重要湿地",
          "url": "https://www.forestry.gov.cn/c/www/sd/24968.jhtml"
        },
        {
          "title": "Ramsar Sites Information Service · 中国湿地名录中的扎龙",
          "url": "https://rsis.ramsar.org/sites/default/files/rsiswp_search/exports/Ramsar-Sites-annotated-summary-China.pdf"
        }
      ]
    },
    {
      "id": "poi:CHN:greater-khingan",
      "name": "大兴安岭",
      "nameEn": "Greater Khingan Mountains",
      "aliases": [
        "大兴安岭林区",
        "大興安嶺",
        "Daxinganling",
        "Greater Hinggan Range"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "230000",
        "150000"
      ],
      "regionIds": [
        "232700",
        "150700"
      ],
      "location": "黑龙江 / 内蒙古 · 大兴安岭北部林区代表点",
      "coordinates": [
        124.1,
        51.84
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "大兴安岭",
      "description": "大兴安岭的山脉与森林跨越黑龙江和内蒙古。地图以北部林区作代表，记录一次到访并不表示走遍整条山脉。",
      "coordinateMethod": "以大兴安岭北部林区作广域目的地代表，取行署所列地区范围 E121°10′53″—127°01′21″、N50°07′02″—53°33′42″中点至两位小数；不是整条山脉中心或导航点。regionIds 仅关联已核实的北部林区主要地市，不是完整边界。",
      "sources": [
        {
          "title": "大兴安岭地区行政公署 · 自然地理",
          "url": "https://dxal.gov.cn/dxal/c100010/tydp.shtml"
        },
        {
          "title": "国家林业和草原局 · 大兴安岭寒温带针叶林经营区",
          "url": "https://www.forestry.gov.cn/lyj/1/zhzs/20260228/657093.html"
        },
        {
          "title": "国家林业和草原局 · 大兴安岭山脉范围与森林",
          "url": "https://www.forestry.gov.cn/c/www/xtq/11483.jhtml"
        }
      ]
    },
    {
      "id": "poi:CHN:wolong",
      "name": "卧龙",
      "nameEn": "Wolong",
      "aliases": [
        "卧龙自然保护区",
        "臥龍",
        "Wolong Nature Reserve",
        "Wolong Panda Habitat"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "510000"
      ],
      "regionIds": [
        "513200"
      ],
      "location": "四川 · 阿坝 · 汶川",
      "coordinates": [
        103.13,
        31.08
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "卧龙",
      "description": "卧龙位于汶川的山地森林之间，是四川大熊猫栖息地的重要组成部分。山谷与高山生态系统承载着丰富的野生动植物。",
      "coordinateMethod": "国家林草局公开项目资料所列卧龙保护区范围 E102°52′—103°24′、N30°45′—31°25′的中点，取两位小数；不是园区入口或熊猫基地导航点。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 四川大熊猫栖息地",
          "url": "https://whc.unesco.org/en/list/1213/"
        },
        {
          "title": "国家林业和草原局公开项目资料 · 卧龙地理位置（正文第 12 页）",
          "url": "https://www.forestry.gov.cn/u/cms/dxm/202502/27102708cr12.pdf"
        }
      ]
    },
    {
      "id": "poi:CHN:hulunbuir-grassland",
      "name": "呼伦贝尔草原",
      "nameEn": "Hulunbuir Grassland",
      "aliases": [
        "呼伦贝尔大草原",
        "呼倫貝爾草原",
        "Hulun Buir Grassland",
        "Hulunbeier Grassland"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "150000"
      ],
      "regionIds": [
        "150700"
      ],
      "location": "内蒙古 · 呼伦贝尔（谢尔塔拉草原代表点）",
      "coordinates": [
        119.94,
        49.33
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "呼伦贝尔",
      "description": "大兴安岭以西分布着呼伦贝尔的草原景观。这里按广域草原目的地记录，可把到访的牧场、河流或城镇补充到笔记中。",
      "coordinateMethod": "选谢尔塔拉草甸草原作代表，取呼伦贝尔国家野外站公布范围 N49°19′—21′、E119°55′—58′中点至两位小数；不是整个草原中心，不指示研究站或牧场可进入，也不作导航。",
      "sources": [
        {
          "title": "呼伦贝尔市人民政府 · 自然地理",
          "url": "https://www.hlbe.gov.cn/News/show/176355.html"
        },
        {
          "title": "呼伦贝尔草原生态系统国家野外科学观测研究站 · 站点介绍",
          "url": "https://hlg.cern.ac.cn/content?id=23385"
        }
      ]
    },
    {
      "id": "poi:CHN:huangguoshu",
      "name": "黄果树瀑布",
      "nameEn": "Huangguoshu Waterfall",
      "aliases": [
        "黄果树",
        "黃果樹瀑布",
        "Huangguoshu Falls"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "520000"
      ],
      "regionIds": [
        "520400"
      ],
      "location": "贵州 · 安顺",
      "coordinates": [
        105.67,
        25.95
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "黄果树",
      "description": "黄果树瀑布所在的喀斯特地貌中，河流跌落形成瀑布群。大瀑布、水帘洞与周围峡谷，共同展现流水塑造山地的过程。",
      "coordinateMethod": "采用中国提交至 UNESCO 预备名单资料中黄果树瀑布的参考坐标 N25°57′08″、E105°40′05″，取两位小数；为来源所列景区示意点，不作瀑布精确位置或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产预备名单 · 黄果树风景名胜区（中国提交资料）",
          "url": "https://whc.unesco.org/en/tentativelists/6380"
        }
      ]
    },
    {
      "id": "poi:CHN:hukou-waterfall",
      "name": "壶口瀑布",
      "nameEn": "Hukou Waterfall",
      "aliases": [
        "黄河壶口瀑布",
        "壺口瀑布",
        "Hukou Falls"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "140000",
        "610000"
      ],
      "regionIds": [
        "141000",
        "610600"
      ],
      "location": "山西 · 临汾 / 陕西 · 延安",
      "coordinates": [
        110.44,
        36.14
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "壶口瀑布",
      "description": "黄河在晋陕峡谷中收束并跌入石槽，形成壶口瀑布。山西吉县与陕西宜川分列两岸，共享这一河流景观。",
      "coordinateMethod": "采用公开原始研究《黄河上中游水体沉积物对磷酸盐的吸附/释放行为》表 1 的壶口采样点 N36°8.573′、E110°26.393′，取两位小数；仅代表壶口附近河段，不是景区入口。",
      "sources": [
        {
          "title": "文化和旅游部 · 秦晋携手打造黄河文化保护传承高地",
          "url": "https://www.mct.gov.cn/whzx/qgwhxxlb/sx_7740/202207/t20220725_934888.htm"
        },
        {
          "title": "生态与农村环境学报 · 黄河上中游水体沉积物研究（2010，26(4)：356–360，表 1）",
          "url": "https://www.ere.ac.cn/en/article/pdf/preview/8418.pdf"
        }
      ]
    },
    {
      "id": "poi:CHN:mingsha-dunhuang",
      "name": "鸣沙山",
      "nameEn": "Mingsha Mountain, Dunhuang",
      "aliases": [
        "敦煌鸣沙山",
        "鸣沙山月牙泉",
        "鳴沙山",
        "Singing-Sand Mountain",
        "Mingshashan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "620000"
      ],
      "regionIds": [
        "620900"
      ],
      "location": "甘肃 · 酒泉 · 敦煌",
      "coordinates": [
        94.67,
        40.06
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "鸣沙山",
      "description": "敦煌城南的鸣沙山由连绵沙丘组成，月牙泉位于沙山环抱之中。这里记录敦煌的鸣沙山，与其他地区的同名沙山区分。",
      "coordinateMethod": "取甘肃省交通运输厅公开资料中鸣沙山月牙泉地质公园范围 E94°36′20″—94°44′00″、N40°00′—40°07′的中点至两位小数；是沙山区域示意点，不是月牙泉水面或入口导航点。",
      "sources": [
        {
          "title": "文化和旅游部 · 酒泉市鸣沙山月牙泉景区",
          "url": "https://sjfw.mct.gov.cn/site/dataservice/culdetails?curId=10&id=35106"
        },
        {
          "title": "甘肃省交通运输厅公开资料 · 地质公园坐标表",
          "url": "https://jtys.gansu.gov.cn/jtys/c106445/201105/455b3d5d9e8c47fe98723769b5044eeb/files/bba2dd1307b0478ea5d7f17c60b46d83.pdf"
        }
      ]
    },
    {
      "id": "poi:CHN:urho-ghost-city",
      "name": "乌尔禾魔鬼城",
      "nameEn": "Urho Ghost City",
      "aliases": [
        "乌尔禾世界魔鬼城",
        "世界魔鬼城",
        "乌尔禾雅丹",
        "Wuerhe Ghost City",
        "Urho Yardang"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "650000"
      ],
      "regionIds": [
        "650200"
      ],
      "location": "新疆 · 克拉玛依 · 乌尔禾",
      "coordinates": [
        85.48,
        46
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "魔鬼城",
      "description": "乌尔禾的岩层在风化与侵蚀中形成形态各异的雅丹。成片的土丘与沟槽，让准噶尔盆地边缘呈现出独特的荒漠景观。",
      "coordinateMethod": "新疆自然资源厅地质遗迹名录列示乌尔禾魔鬼城 E85°29′00″、N46°00′00″，换算后取两位小数；仅作景观代表点，不作入口导航。",
      "sources": [
        {
          "title": "新疆维吾尔自治区自然资源厅 · 自治区地质遗迹名录（第一批）说明",
          "url": "https://zrzyt.xinjiang.gov.cn/xjgtzy/zydzyj/202512/de061bfb812144e995a84d0138d588cf.shtml"
        },
        {
          "title": "乌尔禾区人民政府 · 世界魔鬼城",
          "url": "https://www.weh.gov.cn/weh/ly1/202505/36181c14f6d44d87914615d7f6ffa853.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:shilin",
      "name": "石林",
      "nameEn": "Shilin Stone Forest",
      "aliases": [
        "云南石林",
        "路南石林",
        "石林喀斯特",
        "Yunnan Stone Forest"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "530000"
      ],
      "regionIds": [
        "530100"
      ],
      "location": "云南 · 昆明 · 石林",
      "coordinates": [
        103.35,
        24.91
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "石林",
      "description": "石灰岩在长期溶蚀中形成密集的石柱、峰丛与狭缝。云南石林是中国南方喀斯特的组成部分，适合观察岩石与流水共同留下的地貌。",
      "coordinateMethod": "采用 UNESCO 石林喀斯特乃古石林子区域的参考坐标 N24°54′32″、E103°21′13″，取两位小数，作为石林景观代表点；不是整个遗产的中心或景区入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 中国南方喀斯特",
          "url": "https://whc.unesco.org/en/list/1248/"
        },
        {
          "title": "UNESCO · 石林喀斯特各组成区域地理数据",
          "url": "https://whc.unesco.org/en/list/1248/maps/"
        }
      ]
    },
    {
      "id": "poi:CHN:huangshan",
      "name": "黄山",
      "nameEn": "Mount Huangshan",
      "aliases": [
        "黄山风景区",
        "黃山",
        "Huang Shan",
        "Yellow Mountain"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "340000"
      ],
      "regionIds": [
        "341000"
      ],
      "location": "安徽 · 黄山",
      "coordinates": [
        118.16,
        30.15
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "黄山",
      "description": "黄山的花岗岩峰峦、松树与云雾共同形成层次丰富的山岳景观。历代画家从这里取景，也让黄山成为自然与艺术相遇的地方。",
      "coordinateMethod": "UNESCO 黄山遗产参考坐标 N30°8′43.199″、E118°9′18.299″，换算后取两位小数；不作入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 黄山",
          "url": "https://whc.unesco.org/en/list/547/"
        }
      ]
    },
    {
      "id": "poi:CHN:lushan",
      "name": "庐山",
      "nameEn": "Mount Lushan",
      "aliases": [
        "庐山风景区",
        "廬山",
        "Lushan National Park",
        "Lu Shan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "360000"
      ],
      "regionIds": [
        "360400"
      ],
      "location": "江西 · 九江 · 庐山",
      "coordinates": [
        115.87,
        29.43
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "庐山",
      "description": "庐山的山谷与峰峦之间，留有寺观、书院和多种历史建筑。自然山景与长期积累的人文活动，使这里成为一处文化景观。",
      "coordinateMethod": "UNESCO 庐山遗产参考坐标 N29°25′60″、E115°52′0″，换算后取两位小数；不作入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 庐山国家公园",
          "url": "https://whc.unesco.org/en/list/778/"
        }
      ]
    },
    {
      "id": "poi:CHN:namtso",
      "name": "纳木错",
      "nameEn": "Namtso Lake",
      "aliases": [
        "纳木措",
        "納木錯",
        "Nam Co",
        "Namtso"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "540000"
      ],
      "regionIds": [
        "540100",
        "540600"
      ],
      "location": "西藏 · 拉萨 / 那曲",
      "coordinates": [
        90.65,
        30.72
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "纳木错",
      "description": "纳木错位于念青唐古拉山北侧，湖区连接拉萨当雄与那曲班戈。高原湖面与周围草地、雪山形成开阔的景观。",
      "coordinateMethod": "取中科院研究人员发布的纳木错数据辞条范围 E90°14′36″—91°02′54″、N30°30′10″—30°55′46″中点至两位小数；是湖区示意点，不是官方中心或入口导航点。",
      "sources": [
        {
          "title": "生态环境部 · 纳木错",
          "url": "https://www.mee.gov.cn/home/ztbd/2023/mlhh2/yxal2/xz/202311/t20231113_1055746.shtml"
        },
        {
          "title": "全球变化科学研究数据出版系统 · 纳木错数据辞条",
          "url": "https://doi.org/10.3974/geodb.2019.06.16.V1"
        }
      ]
    },
    {
      "id": "poi:CHN:qinghai-lake",
      "name": "青海湖",
      "nameEn": "Qinghai Lake",
      "aliases": [
        "青海湖国家自然保护区",
        "青海湖泊",
        "Koko Nor",
        "Kokonor"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "630000"
      ],
      "regionIds": [
        "632200",
        "632500"
      ],
      "location": "青海 · 海北 / 海南",
      "coordinates": [
        100.22,
        36.94
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "青海湖",
      "description": "青海湖的咸水湖面、湖滨草地与周围山地共同形成高原湿地。这里也是迁徙水鸟停留和繁殖的重要区域。",
      "coordinateMethod": "采用中国提交至 UNESCO 青海湖预备名单资料的参考坐标 N36°56′33″、E100°13′20″，取两位小数；仅示意湖区，不作环湖路线或景区入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产预备名单 · 青海湖（中国提交资料）",
          "url": "https://whc.unesco.org/en/tentativelists/6186/"
        }
      ]
    },
    {
      "id": "poi:CHN:ngari",
      "name": "阿里",
      "nameEn": "Ngari",
      "aliases": [
        "阿里地区",
        "藏西阿里",
        "Ali Prefecture",
        "Ngari Prefecture"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "540000"
      ],
      "regionIds": [
        "542500"
      ],
      "location": "西藏 · 阿里（狮泉河片区代表点）",
      "coordinates": [
        80.11,
        32.5
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "阿里",
      "description": "阿里包含高原湖盆、山地与宽阔河谷，是多条大河的发源地区。这里按整个地区记录，地图以狮泉河片区作代表。",
      "coordinateMethod": "采用本项目 china-prefecture-index.json 中阿里地区位于狮泉河片区的地图显示代表点，取两位小数；表示广域目的地，不是全地区几何中心或景区入口。",
      "sources": [
        {
          "title": "阿里地区行政公署 · 自然地理",
          "url": "https://www.al.gov.cn/zjal/zrdl.htm"
        },
        {
          "title": "阿里地区行政公署 · 狮泉河镇",
          "url": "https://www.al.gov.cn/info/1019/128467.htm"
        }
      ]
    },
    {
      "id": "poi:CHN:mount-everest",
      "name": "珠穆朗玛峰",
      "nameEn": "Mount Everest",
      "aliases": [
        "珠峰",
        "珠穆朗瑪峰",
        "Qomolangma",
        "Chomolungma",
        "Sagarmatha"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN",
        "NPL"
      ],
      "country": "中国",
      "provinceCodes": [
        "540000"
      ],
      "regionIds": [
        "540200"
      ],
      "location": "中国西藏 · 日喀则 / 尼泊尔边界",
      "coordinates": [
        86.93,
        27.99
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "珠穆朗玛峰",
      "description": "珠穆朗玛峰耸立于中国与尼泊尔边界，周围分布着冰川与高山地貌。旅行记录可写明观景或到访地点，景点打卡并不代表登顶。",
      "coordinateMethod": "尼泊尔旅游主管部门公开登山资料所列参考坐标 N27°59′17″、E86°55′31″，换算后取两位小数；仅示意山峰，不是大本营入口、登山路线或登顶证明。",
      "sources": [
        {
          "title": "尼泊尔旅游主管部门 · Mountaineering in Nepal",
          "url": "https://www.tourism.gov.np/files/publication_files/310.pdf"
        },
        {
          "title": "尼泊尔旅游局 · Natural Treasures of Nepal（珠峰跨境地理说明）",
          "url": "https://trade.ntb.gov.np/wp-content/uploads/2023/04/natural-treasures-of-nepal-insides.pdf"
        }
      ]
    },
    {
      "id": "poi:CHN:gongga-shan",
      "name": "贡嘎山",
      "nameEn": "Mount Gongga",
      "aliases": [
        "贡嘎雪山",
        "貢嘎山",
        "Minya Konka",
        "Gongga Shan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "510000"
      ],
      "regionIds": [
        "513300",
        "511800"
      ],
      "location": "四川 · 甘孜州、雅安",
      "coordinates": [
        101.84,
        29.55
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "贡嘎山",
      "description": "贡嘎山周边的雪峰、冰川和深切河谷展现川西高山地貌。这里以贡嘎山保护区的代表点呈现山地景观，范围涉及甘孜和雅安。",
      "coordinateMethod": "四川省林草局公开评价报告所列保护区范围 E101°29′—102°12′、N29°01′—30°05′的中点，取两位小数；不是主峰或入口坐标。",
      "sources": [
        {
          "title": "四川省林业和草原局 · 贡嘎山自然保护区生物多样性影响评价报告",
          "url": "https://lcj.sc.gov.cn/scslyt/uploadfiles/20190516151210300.pdf"
        }
      ]
    },
    {
      "id": "poi:CHN:meili-snow-mountains",
      "name": "梅里雪山",
      "nameEn": "Meili Snow Mountains",
      "aliases": [
        "梅里雪山群",
        "太子雪山",
        "卡瓦格博",
        "梅里雪山西坡",
        "Meili Xueshan",
        "Kawagebo"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "530000",
        "540000"
      ],
      "regionIds": [
        "533400",
        "540400",
        "540300"
      ],
      "location": "云南 · 迪庆州 / 西藏 · 林芝、昌都",
      "coordinates": [
        98.68,
        28.44
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "梅里雪山",
      "description": "梅里雪山连接滇藏边界的雪峰、冰川与山地森林，卡瓦格博是其中的代表山峰。地图以山体附近的一点呈现整个山群。",
      "coordinateMethod": "卡瓦格博山体附近的近似代表示意点，取两位小数；用于显示梅里雪山群，不是官方峰顶测量点、观景台或登山入口。",
      "sources": [
        {
          "title": "察隅县人民政府 · 梅里雪山西坡风景名胜区总体规划（2023—2035）",
          "url": "https://chayu.gov.cn/chyx/c100962/202306/2e5f7540b91240d88fc11dd211ab6d7c/files/%E5%AF%9F%E9%9A%85%E5%8E%BF%E6%A2%85%E9%87%8C%E9%9B%AA%E5%B1%B1%E8%A5%BF%E5%9D%A1%E9%A3%8E%E6%99%AF%E5%90%8D%E8%83%9C%E5%8C%BA%E6%80%BB%E4%BD%93%E8%A7%84%E5%88%92%EF%BC%88%E8%AF%B4%E6%98%8E%E4%B9%A6%EF%BC%89.pdf"
        },
        {
          "title": "昌都市人民政府 · 左贡梅里雪山",
          "url": "https://www.changdu.gov.cn/cdrmzf/c100670/202602/529da9248a194500bc470bef34497dde.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:yarlung-tsangpo-grand-canyon",
      "name": "雅鲁藏布大峡谷",
      "nameEn": "Yarlung Tsangpo Grand Canyon",
      "aliases": [
        "雅魯藏布大峽谷",
        "雅鲁藏布江大峡谷",
        "Yarlung Zangbo Grand Canyon",
        "Yarlung Tsangpo Canyon"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "540000"
      ],
      "regionIds": [
        "540400"
      ],
      "location": "西藏 · 林芝",
      "coordinates": [
        94.9,
        29.5
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "雅鲁藏布",
      "description": "雅鲁藏布江在林芝的高山间深切成峡，沿途植被随海拔变化。峡谷延伸很长，地图以米林派镇附近的江谷作为代表。",
      "coordinateMethod": "以米林派镇附近江谷选取近似代表点并保留两位小数，表示广域峡谷景观，不代表完整边界或景区入口。",
      "sources": [
        {
          "title": "林芝市人民政府 · 雅鲁藏布大峡谷",
          "url": "https://www.linzhi.gov.cn/linzhi/zmlz/201812/c362dda620884226a7441bcfec3eda51.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:shennongjia",
      "name": "神农架",
      "nameEn": "Shennongjia",
      "aliases": [
        "神農架",
        "湖北神农架",
        "神农顶",
        "Hubei Shennongjia",
        "Shennongding"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "420000"
      ],
      "regionIds": [
        "429021",
        "422800"
      ],
      "location": "湖北 · 神农架林区、恩施州",
      "coordinates": [
        110.3,
        31.45
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "神农架",
      "description": "神农架的高山森林保存着多样的植物与野生动物栖息地。景观覆盖多个片区，地图以神农顶附近的山地作为代表。",
      "coordinateMethod": "以神农顶附近山地区域选取近似代表点，保留两位小数；关联包含遗产地的巴东片区，不代表全部保护区边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 湖北神农架",
          "url": "https://whc.unesco.org/en/list/1509/"
        }
      ]
    },
    {
      "id": "poi:CHN:mount-siguniang",
      "name": "四姑娘山",
      "nameEn": "Mount Siguniang",
      "aliases": [
        "四姑娘山景区",
        "四姑娘山群峰",
        "Siguniang Shan",
        "Four Sisters Mountain"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "510000"
      ],
      "regionIds": [
        "513200"
      ],
      "location": "四川 · 阿坝州 · 小金",
      "coordinates": [
        102.9,
        31.11
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "四姑娘山",
      "description": "四姑娘山的雪峰与双桥沟、长坪沟、海子沟共同组成高山景观。地图以山麓附近的一点代表整个景区，不限定某条游览路线。",
      "coordinateMethod": "景区山麓附近的近似代表示意点，保留两位小数；非四座山峰的精确峰顶或景区入口。",
      "sources": [
        {
          "title": "小金县人民政府 · 四姑娘山风景名胜区简介",
          "url": "https://www.xiaojin.gov.cn/xjxrmzf/c100130/201705/322e6a4c3ee2472b97f55f6dacbb0138.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:yangtze-three-gorges",
      "name": "长江三峡",
      "nameEn": "Three Gorges of the Yangtze River",
      "aliases": [
        "長江三峽",
        "瞿塘峡",
        "巫峡",
        "西陵峡",
        "Yangtze Three Gorges",
        "Changjiang Sanxia"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "500000",
        "420000"
      ],
      "regionIds": [
        "500000",
        "422800",
        "420500"
      ],
      "location": "重庆 / 湖北 · 恩施州、宜昌",
      "coordinates": [
        109.6,
        31.04
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "长江三峡",
      "description": "瞿塘峡、巫峡和西陵峡连成横跨渝鄂的长江峡谷景观。地图以巫峡一带作为代表，记录对象包含三段峡谷。",
      "coordinateMethod": "以巫峡附近江段选取近似代表点，保留两位小数；不是三峡全域中心、三峡大坝位置或游船码头。",
      "sources": [
        {
          "title": "重庆市人民政府 · 壮美三峡",
          "url": "https://www.cq.gov.cn/zjcq/202409/t20240912_13620984.html"
        },
        {
          "title": "宁夏水利厅 · 长江三峡风景名胜区",
          "url": "https://slt.nx.gov.cn/xxgk_281/fdzdgknr/slkp/jhzl/202201/t20220120_3290896.html"
        }
      ]
    },
    {
      "id": "poi:CHN:nujiang-grand-canyon",
      "name": "怒江大峡谷",
      "nameEn": "Nujiang Grand Canyon",
      "aliases": [
        "怒江大峽谷",
        "怒江峡谷",
        "怒江第一湾",
        "Nu River Grand Canyon",
        "Nujiang Canyon"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "530000"
      ],
      "regionIds": [
        "533300"
      ],
      "location": "云南 · 怒江州",
      "coordinates": [
        98.62,
        27.99
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "怒江峡谷",
      "description": "怒江在滇西北山地间蜿蜒，两岸村寨与陡峭山坡相伴。本条呈现云南怒江峡谷旅行区域，以丙中洛附近的江湾作为代表。",
      "coordinateMethod": "以丙中洛附近怒江第一湾选取近似代表点，保留两位小数；表示长距离峡谷景观，不等于全部怒江流域。",
      "sources": [
        {
          "title": "云南省交通运输厅 · 一路穿越怒江大峡谷",
          "url": "https://jtyst.yn.gov.cn/xyxw/202601/t20260105_3431033.html"
        },
        {
          "title": "云南省医疗保障局 · 怒江丙中洛",
          "url": "https://ylbz.yn.gov.cn/index.php?c=show&id=2797"
        }
      ]
    },
    {
      "id": "poi:CHN:lijiang-old-town",
      "name": "丽江古城",
      "nameEn": "Old Town of Lijiang",
      "aliases": [
        "麗江古城",
        "大研古城",
        "丽江大研",
        "Lijiang Old Town",
        "Dayan Old Town"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "530000"
      ],
      "regionIds": [
        "530700"
      ],
      "location": "云南 · 丽江",
      "coordinates": [
        100.23,
        26.87
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "丽江古城",
      "description": "丽江古城依地势铺展，传统民居与穿城水系相互交织。地图以大研古城作为代表点，也保留这一历史城镇景观的整体含义。",
      "coordinateMethod": "大研古城片区的近似代表点，保留两位小数；不是整个串联遗产的几何中心或入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 丽江古城",
          "url": "https://whc.unesco.org/en/list/811/"
        }
      ]
    },
    {
      "id": "poi:CHN:wuzhen",
      "name": "乌镇",
      "nameEn": "Wuzhen",
      "aliases": [
        "烏鎮",
        "乌镇古镇",
        "东栅",
        "西栅",
        "Wuzhen Water Town",
        "Wu Zhen"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "330000"
      ],
      "regionIds": [
        "330400"
      ],
      "location": "浙江 · 嘉兴 · 桐乡",
      "coordinates": [
        120.49,
        30.75
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "乌镇",
      "description": "乌镇的河道、石桥与临水建筑构成江南水乡风貌。东栅和西栅各有游览空间，地图以古镇附近的一点共同代表。",
      "coordinateMethod": "乌镇古镇片区的近似代表示意点，保留两位小数；不限定东栅或西栅入口。",
      "sources": [
        {
          "title": "文化和旅游部 · 嘉兴市乌镇古镇旅游区",
          "url": "https://sjfw.mct.gov.cn/site/dataservice/culdetails?curId=10&id=34882"
        }
      ]
    },
    {
      "id": "poi:CHN:pingyao-ancient-city",
      "name": "平遥古城",
      "nameEn": "Ancient City of Pingyao",
      "aliases": [
        "平遙古城",
        "平遥",
        "Ping Yao",
        "Pingyao Old Town"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "140000"
      ],
      "regionIds": [
        "140700"
      ],
      "location": "山西 · 晋中 · 平遥",
      "coordinates": [
        112.18,
        37.2
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "平遥古城",
      "description": "平遥古城保存着传统城墙、街巷与民居格局，票号遗存让商业历史仍然可见。地图以城内区域作为这一古城的代表。",
      "coordinateMethod": "平遥城墙内片区的近似代表示意点，保留两位小数；不是城门或游客中心位置。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 平遥古城",
          "url": "https://whc.unesco.org/en/list/812/"
        }
      ]
    },
    {
      "id": "poi:CHN:zhouzhuang",
      "name": "周庄",
      "nameEn": "Zhouzhuang",
      "aliases": [
        "周莊",
        "周庄古镇",
        "贞丰里",
        "Zhouzhuang Water Town",
        "Zhou Zhuang"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "320000"
      ],
      "regionIds": [
        "320500"
      ],
      "location": "江苏 · 苏州 · 昆山",
      "coordinates": [
        120.86,
        31.12
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "周庄",
      "description": "周庄的古桥跨越水巷，老宅与街道沿河相连。这一水乡古镇保存着江南聚落依水而居的空间格局。",
      "coordinateMethod": "采用周庄旅游官方网站简介所列东经 120.86°、北纬 31.12°作为古镇代表点；不是具体景点入口。",
      "sources": [
        {
          "title": "周庄旅游官方网站 · 周庄简介",
          "url": "https://zhouzhuang.net/intro_5.html"
        }
      ]
    },
    {
      "id": "poi:CHN:fenghuang-ancient-town",
      "name": "凤凰古城",
      "nameEn": "Fenghuang Ancient Town",
      "aliases": [
        "鳳凰古城",
        "凤凰古镇",
        "沱江古城",
        "Fenghuang Old Town",
        "Phoenix Ancient Town"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "430000"
      ],
      "regionIds": [
        "433100"
      ],
      "location": "湖南 · 湘西州 · 凤凰",
      "coordinates": [
        109.6,
        27.95
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "凤凰古城",
      "description": "沱江穿过凤凰古城，吊脚楼、石板街与古城墙保留着湘西城镇的风貌。地图以沿江古城片区作为代表。",
      "coordinateMethod": "沱江沿岸古城片区的近似代表点，保留两位小数；不是景区边界或特定入口。",
      "sources": [
        {
          "title": "湖南省人民政府台湾事务办公室 · 凤凰古城（来源：湖南省文旅厅）",
          "url": "https://www.hnstb.gov.cn/plus/view-7345-1.html"
        }
      ]
    },
    {
      "id": "poi:CHN:anhui-traditional-dwellings",
      "name": "安徽民居",
      "nameEn": "Traditional Dwellings of Anhui",
      "aliases": [
        "安徽传统民居",
        "安徽傳統民居",
        "皖南民居",
        "徽派民居",
        "Anhui Vernacular Houses",
        "Huizhou Dwellings"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "340000"
      ],
      "regionIds": [
        "341000",
        "341800"
      ],
      "location": "安徽 · 皖南等地（宏村代表点）",
      "coordinates": [
        117.99,
        30
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "安徽民居",
      "description": "安徽民居是分布在不同村落的传统居住建筑，皖南的院落、街巷和水系是其重要代表。地图选宏村作代表点，记录对象并不限于宏村或西递。",
      "coordinateMethod": "以宏村片区选取近似代表点，保留两位小数；原书条目是安徽民居这一群组景观，不把代表村落等同于全部范围。地市关联为主要代表地区，非穷尽。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 皖南古村落：西递、宏村（安徽民居代表实例）",
          "url": "https://whc.unesco.org/en/list/1002/"
        }
      ]
    },
    {
      "id": "poi:CHN:fujian-tulou",
      "name": "福建土楼",
      "nameEn": "Fujian Tulou",
      "aliases": [
        "福建土樓",
        "永定土楼",
        "南靖土楼",
        "华安土楼",
        "Fujian Earthen Buildings",
        "Tulou"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "350000"
      ],
      "regionIds": [
        "350800",
        "350600"
      ],
      "location": "福建 · 龙岩、漳州",
      "coordinates": [
        117.06,
        24.66
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "福建土楼",
      "description": "福建土楼把居住、防御与宗族生活组织在圆形或方形的大型夯土建筑中。土楼分布于多个地方，地图以永定洪坑土楼群附近作为代表。",
      "coordinateMethod": "永定洪坑土楼群附近的近似代表点，保留两位小数；并非全部福建土楼或世界遗产各组成部分的中心。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 福建土楼",
          "url": "https://whc.unesco.org/en/list/1113/"
        }
      ]
    },
    {
      "id": "poi:CHN:kaiping-diaolou",
      "name": "开平碉楼",
      "nameEn": "Kaiping Diaolou",
      "aliases": [
        "開平碉樓",
        "开平碉楼与村落",
        "自力村碉楼",
        "Kaiping Diaolou and Villages",
        "Kaiping Watchtowers"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "440000"
      ],
      "regionIds": [
        "440700"
      ],
      "location": "广东 · 江门 · 开平",
      "coordinates": [
        112.58,
        22.37
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "开平碉楼",
      "description": "开平碉楼散布于乡村，在防御性建筑中融入多种中西建筑元素。地图以自力村碉楼群作为代表，记录对象包括开平的碉楼景观。",
      "coordinateMethod": "自力村碉楼群附近的近似代表点，保留两位小数；不是所有碉楼村落的共同中心或入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 开平碉楼与村落",
          "url": "https://whc.unesco.org/en/list/1112/"
        }
      ]
    },
    {
      "id": "poi:CHN:great-wall",
      "name": "万里长城",
      "nameEn": "Great Wall of China",
      "aliases": [
        "萬里長城",
        "长城",
        "八达岭",
        "Great Wall",
        "Changcheng"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "110000",
        "120000",
        "130000",
        "140000",
        "150000",
        "210000",
        "220000",
        "230000",
        "370000",
        "410000",
        "610000",
        "620000",
        "630000",
        "640000",
        "650000"
      ],
      "regionIds": [
        "110000"
      ],
      "location": "中国多地（北京八达岭代表点）",
      "coordinates": [
        116.02,
        40.36
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "万里长城",
      "description": "历代长城的墙体、关堡与烽燧分布于中国多地，记录着漫长的营建历史。地图选八达岭作为代表点，打卡对象并不限于北京段。",
      "coordinateMethod": "以八达岭附近墙体选取近似代表点，保留两位小数；省份数组按文旅部所列历代长城 15 省区市保留，地市仅关联代表点，不假定游遍长城。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 长城",
          "url": "https://whc.unesco.org/en/list/438/"
        },
        {
          "title": "文化和旅游部 · 长城保护修缮与全国分布",
          "url": "https://www.mct.gov.cn/whzx/whyw/201904/t20190417_842887.htm"
        }
      ]
    },
    {
      "id": "poi:CHN:beijing-forbidden-city",
      "name": "北京故宫",
      "nameEn": "Forbidden City, Beijing",
      "aliases": [
        "北京故宮",
        "紫禁城",
        "故宫博物院",
        "Palace Museum",
        "Beijing Imperial Palace"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "110000"
      ],
      "regionIds": [
        "110000"
      ],
      "location": "北京 · 故宫",
      "coordinates": [
        116.39,
        39.92
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "北京故宫",
      "description": "北京故宫由层层院落、殿宇和宫墙构成，是明清宫廷建筑的重要遗存。本条仅记录北京故宫，不包含沈阳故宫。",
      "coordinateMethod": "北京故宫宫殿群内的近似代表示意点，保留两位小数；不采用北京与沈阳两处遗产的合并中心，也不是入场门位置。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 北京及沈阳的明清皇宫（北京部分）",
          "url": "https://whc.unesco.org/en/list/439/"
        }
      ]
    },
    {
      "id": "poi:CHN:potala-palace",
      "name": "布达拉宫",
      "nameEn": "Potala Palace",
      "aliases": [
        "布達拉宮",
        "拉萨布达拉宫",
        "Potala",
        "Budala Palace"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "540000"
      ],
      "regionIds": [
        "540100"
      ],
      "location": "西藏 · 拉萨",
      "coordinates": [
        91.12,
        29.66
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "布达拉宫",
      "description": "布达拉宫依拉萨红山展开，白宫、红宫与山体共同形成鲜明的建筑轮廓。本条记录布达拉宫本体，不合并大昭寺或罗布林卡的到访。",
      "coordinateMethod": "红山上布达拉宫建筑群附近的近似代表点，保留两位小数；不是整个历史建筑群串联遗产的中心或入场点。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 拉萨布达拉宫历史建筑群",
          "url": "https://whc.unesco.org/en/list/707/"
        }
      ]
    },
    {
      "id": "poi:CHN:dujiangyan-irrigation-system",
      "name": "都江堰",
      "nameEn": "Dujiangyan Irrigation System",
      "aliases": [
        "都江堰水利工程",
        "鱼嘴",
        "宝瓶口",
        "Du Jiang Yan",
        "Dujiangyan Waterworks"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "510000"
      ],
      "regionIds": [
        "510100"
      ],
      "location": "四川 · 成都 · 都江堰",
      "coordinates": [
        103.61,
        31
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "都江堰",
      "description": "都江堰顺应岷江水势分流引水，古老水利工程至今仍与成都平原的生活相连。本条记录水利工程景观。",
      "coordinateMethod": "采用 UNESCO 遗产页 N31°00′6.012″、E103°36′19.008″参考坐标，换算并取两位小数；用作都江堰工程示意，不合并青城山到访。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 青城山与都江堰水利工程",
          "url": "https://whc.unesco.org/en/list/1001/"
        }
      ]
    },
    {
      "id": "poi:CHN:classical-gardens-suzhou",
      "name": "苏州园林",
      "nameEn": "Classical Gardens of Suzhou",
      "aliases": [
        "蘇州園林",
        "苏州古典园林",
        "拙政园",
        "留园",
        "Suzhou Gardens",
        "Chinese Classical Gardens Suzhou"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "320000"
      ],
      "regionIds": [
        "320500"
      ],
      "location": "江苏 · 苏州（拙政园代表点）",
      "coordinates": [
        120.63,
        31.32
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "苏州园林",
      "description": "苏州园林用山石、水面、花木与建筑组织层次丰富的庭园空间。多个园林各具面貌，地图以拙政园作为代表，记录不限定于单一园林。",
      "coordinateMethod": "以拙政园片区选取近似代表点，保留两位小数；代表苏州园林群组，不表示已游览全部园林。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 苏州古典园林",
          "url": "https://whc.unesco.org/en/list/813/"
        }
      ]
    },
    {
      "id": "poi:CHN:longmen-grottoes",
      "name": "龙门石窟",
      "nameEn": "Longmen Grottoes",
      "aliases": [
        "龍門石窟",
        "洛阳龙门",
        "龙门石刻",
        "Longmen Caves",
        "Longmen Shiku"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "410000"
      ],
      "regionIds": [
        "410300"
      ],
      "location": "河南 · 洛阳",
      "coordinates": [
        112.47,
        34.55
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "龙门石窟",
      "description": "龙门石窟沿伊河两岸山崖开凿，造像与题记呈现多个时代的石刻艺术。地图以主要石窟所在江岸片区作为代表。",
      "coordinateMethod": "伊河西岸主要石窟片区的近似代表示意点，保留两位小数；不是景区入口或边界坐标。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 龙门石窟",
          "url": "https://whc.unesco.org/en/list/1003/"
        }
      ]
    },
    {
      "id": "poi:CHN:yungang-grottoes",
      "name": "云冈石窟",
      "nameEn": "Yungang Grottoes",
      "aliases": [
        "雲岡石窟",
        "大同云冈",
        "武州山石窟",
        "Yungang Caves",
        "Yun Gang"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "140000"
      ],
      "regionIds": [
        "140200"
      ],
      "location": "山西 · 大同",
      "coordinates": [
        113.12,
        40.11
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "云冈石窟",
      "description": "云冈石窟依山开凿，大型佛像与洞窟中的细部雕刻展现北魏时期的艺术面貌。沿崖展开的窟群构成这一遗产的主体。",
      "coordinateMethod": "UNESCO 遗产页 N40°06′34.992″、E113°07′19.992″参考坐标换算后取两位小数，用作窟群代表点。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 云冈石窟",
          "url": "https://whc.unesco.org/en/list/1039/"
        }
      ]
    },
    {
      "id": "poi:CHN:dazu-rock-carvings",
      "name": "大足石刻",
      "nameEn": "Dazu Rock Carvings",
      "aliases": [
        "重庆大足石刻",
        "重慶大足石刻",
        "宝顶山石刻",
        "北山石刻",
        "Dazu Carvings",
        "Dazu Shike"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "500000"
      ],
      "regionIds": [
        "500000"
      ],
      "location": "重庆 · 大足（宝顶山代表点）",
      "coordinates": [
        105.79,
        29.75
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "大足石刻",
      "description": "大足石刻分布于多处山崖，以造像和题记呈现宗教观念与世俗生活。地图以宝顶山作为代表，记录对象也涵盖北山等石刻群。",
      "coordinateMethod": "以宝顶山石刻片区选取近似代表点，保留两位小数；不是大足所有石刻的共同中心，也不表示已游完各组。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 大足石刻",
          "url": "https://whc.unesco.org/en/list/912/"
        }
      ]
    },
    {
      "id": "poi:CHN:bogda-peak",
      "name": "博格达峰",
      "nameEn": "Bogda Peak",
      "aliases": [
        "博格达山",
        "博格達峰",
        "Mount Bogda"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "650000"
      ],
      "regionIds": [
        "652300"
      ],
      "location": "新疆 · 昌吉 · 博格达山",
      "coordinates": [
        88.33,
        43.8
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "博格达峰",
      "description": "博格达峰的冰雪山体与周围森林、草地构成天山垂直景观的一部分。这里记录山地到访，具体线路可写入笔记。",
      "coordinateMethod": "编辑按博格达峰山体地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 新疆天山",
          "url": "https://whc.unesco.org/en/list/1414/"
        },
        {
          "title": "新疆维吾尔自治区人民政府 · 天山天池",
          "url": "https://www.xinjiang.gov.cn/xinjiang/lyjg/201912/f74fa70bcf1c4d14ae3439fa3ba508bc.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:mount-emei",
      "name": "峨眉山",
      "nameEn": "Mount Emei",
      "aliases": [
        "峨嵋山",
        "Emeishan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "510000"
      ],
      "regionIds": [
        "511100"
      ],
      "location": "四川 · 乐山 · 峨眉山",
      "coordinates": [
        103.33,
        29.52
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "峨眉山",
      "description": "峨眉山的寺院散布在山林之间，随海拔变化可以看到不同植被。山地风景与长期积累的佛教文化共同构成这处目的地。",
      "coordinateMethod": "编辑按峨眉山山体地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 峨眉山—乐山大佛",
          "url": "https://whc.unesco.org/en/list/779/"
        }
      ]
    },
    {
      "id": "poi:CHN:mount-wutai",
      "name": "五台山",
      "nameEn": "Mount Wutai",
      "aliases": [
        "五臺山",
        "Wutaishan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "140000"
      ],
      "regionIds": [
        "140900"
      ],
      "location": "山西 · 忻州 · 五台山",
      "coordinates": [
        113.59,
        39.02
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "五台山",
      "description": "五台山以五座平坦山顶和山间寺院群闻名。地图以台怀寺院片区示意，沿途到访的寺庙与山路可分别记入笔记。",
      "coordinateMethod": "编辑按台怀寺院片区作为五台山广域代表点地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 五台山",
          "url": "https://whc.unesco.org/en/list/1279/"
        }
      ]
    },
    {
      "id": "poi:CHN:mount-wuyi",
      "name": "武夷山",
      "nameEn": "Mount Wuyi",
      "aliases": [
        "武夷山风景名胜区",
        "Wuyishan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "350000",
        "360000"
      ],
      "regionIds": [
        "350700",
        "361100"
      ],
      "location": "福建 · 南平 / 江西 · 上饶",
      "coordinates": [
        117.95,
        27.65
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "武夷山",
      "description": "武夷山把森林、岩峰、溪谷和文化遗迹连接在一起。地图以九曲溪片区代表这处跨闽赣的山地目的地。",
      "coordinateMethod": "编辑按九曲溪片区作为武夷山广域代表点地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 武夷山",
          "url": "https://whc.unesco.org/en/list/911/"
        }
      ]
    },
    {
      "id": "poi:CHN:alishan",
      "name": "阿里山",
      "nameEn": "Alishan",
      "aliases": [
        "阿里山森林游乐区",
        "阿里山國家森林遊樂區",
        "Alishan National Forest Recreation Area"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "710000"
      ],
      "regionIds": [
        "tw-10010"
      ],
      "location": "台湾 · 嘉义县 · 阿里山",
      "coordinates": [
        120.8,
        23.51
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "阿里山",
      "description": "阿里山山林中可见高大的桧木，森林铁路穿行其间。这里以森林游乐区代表阿里山地区，记录林间步道与山景体验。",
      "coordinateMethod": "编辑按阿里山森林游乐区作为阿里山地区代表点地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "林业及自然保育署 · 阿里山国家森林游乐区",
          "url": "https://recreation.forest.gov.tw/Forest/RA?typ=0&typ_id=0500001"
        }
      ]
    },
    {
      "id": "poi:CHN:taklamakan-desert",
      "name": "塔克拉玛干沙漠",
      "nameEn": "Taklamakan Desert",
      "aliases": [
        "塔克拉瑪干沙漠",
        "Taklimakan Desert"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "650000"
      ],
      "regionIds": [
        "652800",
        "652900"
      ],
      "location": "新疆 · 塔里木盆地（塔中片区代表点）",
      "coordinates": [
        83.65,
        39
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "塔克拉玛干沙漠",
      "description": "塔克拉玛干沙漠位于塔里木盆地，连绵沙丘构成大范围沙海。地图以塔中片区示意，实际到访的公路、绿洲或沙漠边缘可写入笔记。",
      "coordinateMethod": "编辑按塔中片区作为沙漠广域代表点，主要关联巴音郭楞与阿克苏地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "若羌县人民政府 · 塔克拉玛干沙漠",
          "url": "https://www.xjrq.gov.cn/rqxrmzf/c109233/201412/ced1e8cf6fd04202b576eac0eb155f7e.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:jiangjun-gobi",
      "name": "将军戈壁",
      "nameEn": "Jiangjun Gobi",
      "aliases": [
        "将军庙戈壁",
        "將軍戈壁",
        "Jiangjunmiao Gobi"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "650000"
      ],
      "regionIds": [
        "652300"
      ],
      "location": "新疆 · 昌吉 · 奇台北部戈壁",
      "coordinates": [
        90.2,
        44.7
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "将军戈壁",
      "description": "将军戈壁位于准噶尔盆地东部，砾石荒漠与裸露地层展现干旱地区的地貌。地图以将军庙一带示意这片广域戈壁。",
      "coordinateMethod": "编辑按奇台北部将军庙片区作为广域戈壁代表点，不对应开放景区入口地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "中国科学院古脊椎动物与古人类研究所 · 五彩湾和将军庙地区的地层与化石研究",
          "url": "https://www.ivpp.cas.cn/xwdt/kyjz/201811/t20181103_5155313.html"
        },
        {
          "title": "新疆生态环境厅 · 将军庙输变电工程环境影响报告（区域自然环境）",
          "url": "https://sthjt.xinjiang.gov.cn/xjepd/hfshpsl/202403/07588e9ccbcb4dac850372256e694ca7/files/%E6%96%B0%E7%96%86%E5%B0%86%E5%86%9B%E5%BA%99750%E5%8D%83%E4%BC%8F%E8%BE%93%E5%8F%98%E7%94%B5%E5%B7%A5%E7%A8%8B%E7%8E%AF%E5%A2%83%E5%BD%B1%E5%93%8D%E6%8A%A5%E5%91%8A%E4%B9%A6%E9%80%81%E5%AE%A1%E7%A8%BF%EF%BC%88%E5%85%AC%E7%A4%BA%E7%89%88%EF%BC%89.pdf"
        }
      ]
    },
    {
      "id": "poi:CHN:flaming-mountains",
      "name": "火焰山",
      "nameEn": "Flaming Mountains",
      "aliases": [
        "吐鲁番火焰山",
        "Huoyanshan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "650000"
      ],
      "regionIds": [
        "650400"
      ],
      "location": "新疆 · 吐鲁番 · 火焰山",
      "coordinates": [
        89.51,
        42.91
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "火焰山",
      "description": "火焰山的红色沉积岩层沿山坡展开，沟壑勾勒出鲜明的纹理。它与吐鲁番盆地的干热环境共同形成独特的荒漠景观。",
      "coordinateMethod": "编辑按吐鲁番火焰山中部山体地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "新疆维吾尔自治区人民政府 · 火焰山",
          "url": "https://www.xinjiang.gov.cn/xinjiang/tsxj/201111/06af0af108c84bbbbf799667115a855c.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:lop-nur",
      "name": "罗布泊",
      "nameEn": "Lop Nur",
      "aliases": [
        "罗布淖尔",
        "羅布泊",
        "Lop Nor"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "650000"
      ],
      "regionIds": [
        "652800"
      ],
      "location": "新疆 · 巴音郭楞 · 罗布泊湖盆",
      "coordinates": [
        90.35,
        40.4
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "罗布泊",
      "description": "罗布泊的干涸湖盆留下层叠的盐壳与地表纹理，附近还可见雅丹地貌。这里按广域目的地记录，具体经过的区域可写入笔记。",
      "coordinateMethod": "编辑按罗布泊干涸湖盆的广域代表点，不是道路或进入地点地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "新疆自然资源厅 · 地质遗迹与罗布泊景观",
          "url": "https://zrzyt.xinjiang.gov.cn/xjgtzy/zydzyj/202512/de061bfb812144e995a84d0138d588cf.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:taroko-gorge",
      "name": "太鲁阁大峡谷",
      "nameEn": "Taroko Gorge",
      "aliases": [
        "太魯閣大峽谷",
        "太鲁阁峡谷",
        "Taroko"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "710000"
      ],
      "regionIds": [
        "tw-10015"
      ],
      "location": "台湾 · 花莲县 · 太鲁阁",
      "coordinates": [
        121.62,
        24.16
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "太鲁阁大峡谷",
      "description": "立雾溪切穿大理岩山地，形成太鲁阁陡峭的峡谷景观。地图以游客中心附近的峡谷口示意，实际到访路段可记入笔记。",
      "coordinateMethod": "采用台湾观光署太鲁阁游客中心公布位置 E121.62223、N24.158076，取两位小数作为峡谷入口片区代表点；仅作地图显示，不表示道路开放或入口导航。",
      "sources": [
        {
          "title": "台湾观光署 · 太鲁阁游客中心",
          "url": "https://eng.taiwan.net.tw/m1.aspx?id=r43&sNo=0002016"
        }
      ]
    },
    {
      "id": "poi:CHN:loess-plateau",
      "name": "黄土高原",
      "nameEn": "Loess Plateau",
      "aliases": [
        "黃土高原",
        "Huangtu Plateau"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "610000",
        "140000",
        "150000",
        "410000",
        "620000",
        "640000",
        "630000"
      ],
      "regionIds": [
        "610600"
      ],
      "location": "陕晋蒙豫甘宁青（延安片区代表点）",
      "coordinates": [
        109.49,
        36.6
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "黄土高原",
      "description": "黄土高原横跨多省区，塬、梁、峁与沟壑构成多样的黄土地貌。地图用延安片区示意这一广域目的地，可在笔记中注明实际到访位置。",
      "coordinateMethod": "采用项目地市目录中延安市的地图代表点并取两位小数，作为黄土高原的示意位置；不是全域中心、完整边界或导航点。",
      "sources": [
        {
          "title": "国家发展改革委 · 黄土高原地区综合治理规划大纲",
          "url": "https://www.ndrc.gov.cn/fzggw/jgsj/njs/sjdt/201101/W020240430572756442125.pdf"
        }
      ]
    },
    {
      "id": "poi:CHN:xiaozhai-tiankeng",
      "name": "小寨天坑",
      "nameEn": "Xiaozhai Tiankeng",
      "aliases": [
        "奉节小寨天坑",
        "小寨天坑地缝",
        "Xiaozhai Heavenly Pit"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "500000"
      ],
      "regionIds": [
        "500000"
      ],
      "location": "重庆 · 奉节 · 小寨天坑",
      "coordinates": [
        109.47,
        30.75
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "小寨天坑",
      "description": "小寨天坑的陡壁围出深邃空间，展现喀斯特地区洞穴与地表演变的结果。这里记录天坑景观，具体观景位置可补充在笔记中。",
      "coordinateMethod": "编辑按奉节小寨天坑地貌地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "重庆市民政局 · 新重庆老地名：奉节小寨天坑",
          "url": "https://mzj.cq.gov.cn/sy_218/bmdt/mzyw/202405/t20240511_13194982.html"
        }
      ]
    },
    {
      "id": "poi:CHN:zhijin-cave",
      "name": "织金洞",
      "nameEn": "Zhijin Cave",
      "aliases": [
        "织金洞世界地质公园",
        "織金洞",
        "Zhijindong"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "520000"
      ],
      "regionIds": [
        "520500"
      ],
      "location": "贵州 · 毕节 · 织金",
      "coordinates": [
        105.88,
        26.77
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "织金洞",
      "description": "织金洞的地下空间中分布着形态丰富的钟乳石等岩溶沉积。周边峡谷和天坑与洞穴共同组成喀斯特地貌。",
      "coordinateMethod": "编辑按织金洞洞穴片区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO · 世界地质公园网络新增景区（织金洞）",
          "url": "https://www.unesco.org/zh/articles/shijiedezhigongyuanwangluoxinzengjiuchujingqu"
        }
      ]
    },
    {
      "id": "poi:CHN:changbai-heaven-lake",
      "name": "长白山天池",
      "nameEn": "Changbai Mountain Heaven Lake",
      "aliases": [
        "長白山天池",
        "白头山天池",
        "Changbaishan Tianchi",
        "Paektu Heaven Lake"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN",
        "PRK"
      ],
      "country": "中国",
      "provinceCodes": [
        "220000"
      ],
      "regionIds": [
        "220600",
        "222400"
      ],
      "location": "吉林 · 白山 / 延边 · 长白山",
      "coordinates": [
        128.06,
        42.01
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "长白山天池",
      "description": "天池位于长白山火山口，湖水被周围山峰环抱。此条目主要关联中国一侧的到访记录，湖泊同时涉及中朝边界。",
      "coordinateMethod": "编辑按长白山天池湖面代表点地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "吉林省地震局 · 长白山天池的由来",
          "url": "https://dzj.jl.gov.cn/ztzl/cbshsztbd/zbstchsdl/"
        }
      ]
    },
    {
      "id": "poi:CHN:tianshan-tianchi",
      "name": "天山天池",
      "nameEn": "Heavenly Lake of Tianshan",
      "aliases": [
        "阜康天池",
        "新疆天池",
        "Tianshan Tianchi"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "650000"
      ],
      "regionIds": [
        "652300"
      ],
      "location": "新疆 · 昌吉 · 阜康",
      "coordinates": [
        88.13,
        43.89
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "天山天池",
      "description": "天池坐落在博格达山地，湖岸森林与远处雪峰相映。它是新疆天山自然景观中的一处高山湖泊。",
      "coordinateMethod": "编辑按天山天池湖区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "新疆维吾尔自治区人民政府 · 天山天池",
          "url": "https://www.xinjiang.gov.cn/xinjiang/lytj/201607/8c0506d675014e5ab4520e7bb3b522f0.shtml"
        },
        {
          "title": "文化和旅游部数据服务 · 天山天池",
          "url": "https://sjfw.mct.gov.cn/site/dataservice/culdetails?curId=10&id=35121"
        }
      ]
    },
    {
      "id": "poi:CHN:kanas-lake",
      "name": "喀纳斯湖",
      "nameEn": "Kanas Lake",
      "aliases": [
        "喀納斯湖",
        "Kanasi Lake"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "650000"
      ],
      "regionIds": [
        "654300"
      ],
      "location": "新疆 · 阿勒泰 · 布尔津",
      "coordinates": [
        87.04,
        48.8
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "喀纳斯湖",
      "description": "喀纳斯湖沿山谷延伸，四周森林、草甸与冰川塑造的地貌相伴。可将湖岸与沿河不同停留记入同一段旅程。",
      "coordinateMethod": "编辑按喀纳斯湖湖区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "新疆自然资源厅 · 喀纳斯地质遗迹",
          "url": "https://zrzyt.xinjiang.gov.cn/xjgtzy/dzyjxq1/202307/5f963ed047e64c56ac30b27e923629e4.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:chaka-salt-lake",
      "name": "茶卡盐湖",
      "nameEn": "Chaka Salt Lake",
      "aliases": [
        "茶卡鹽湖",
        "Chaka Yanhu"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "630000"
      ],
      "regionIds": [
        "632800"
      ],
      "location": "青海 · 海西 · 乌兰",
      "coordinates": [
        99.08,
        36.7
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "茶卡盐湖",
      "description": "茶卡盐湖位于高原盆地，湖面、盐层与远山共同构成开阔景观。不同水量和天气下，湖面的色彩与倒影也会变化。",
      "coordinateMethod": "编辑按茶卡盐湖湖区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "贵南县人民政府 · 茶卡盐湖景观介绍",
          "url": "https://www.guinan.gov.cn/lnb/zc1__zwgk/zc/aztfl/dwsw/content_25609304"
        }
      ]
    },
    {
      "id": "poi:CHN:zhaoqing-star-lake",
      "name": "肇庆星湖",
      "nameEn": "Star Lake, Zhaoqing",
      "aliases": [
        "肇慶星湖",
        "七星岩",
        "Xinghu",
        "Seven Star Crags"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "440000"
      ],
      "regionIds": [
        "441200"
      ],
      "location": "广东 · 肇庆 · 星湖",
      "coordinates": [
        112.48,
        23.1
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "肇庆星湖",
      "description": "星湖的湖水围绕石灰岩峰林展开，七星岩构成其中有代表性的景观。这里以七星岩湖区示意，其他到访片区可写入笔记。",
      "coordinateMethod": "编辑按星湖七星岩湖区作为目的地代表点地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "广东省外事办公室 · 肇庆七星岩",
          "url": "https://www.gdfao.gov.cn/zwgk/zdly/zqs/content/post_1333567.html"
        },
        {
          "title": "文化和旅游部数据服务 · 星湖景区",
          "url": "https://sjfw.mct.gov.cn/site/dataservice/culdetails?curId=10&id=35014"
        }
      ]
    },
    {
      "id": "poi:CHN:sun-moon-lake",
      "name": "日月潭",
      "nameEn": "Sun Moon Lake",
      "aliases": [
        "鱼池日月潭",
        "日月潭国家风景区",
        "Riyue Tan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "710000"
      ],
      "regionIds": [
        "tw-10008"
      ],
      "location": "台湾 · 南投县 · 鱼池",
      "coordinates": [
        120.91,
        23.86
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "日月潭",
      "description": "日月潭的湖岸被山地环抱，水面与沿岸聚落相连。地图以水社湖岸代表湖区，可记录环湖途中不同的停留。",
      "coordinateMethod": "采用台湾观光署水社码头公布位置 E120.91191、N23.864501，取两位小数作为湖岸代表点；仅供旅行地图显示，不表示完整湖界或码头导航。",
      "sources": [
        {
          "title": "台湾观光署 · 水社码头与日月潭",
          "url": "https://eng.taiwan.net.tw/m1.aspx?id=A12-00292&sno=0002016"
        }
      ]
    },
    {
      "id": "poi:CHN:li-river",
      "name": "漓江",
      "nameEn": "Li River",
      "aliases": [
        "桂林漓江",
        "Lijiang River"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "450000"
      ],
      "regionIds": [
        "450300"
      ],
      "location": "广西 · 桂林（兴坪河段代表点）",
      "coordinates": [
        110.56,
        24.93
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "漓江",
      "description": "漓江穿行在桂林的喀斯特山峰之间，沿岸连接村落、田园与林地。地图以兴坪河段示意，可在笔记中补充实际游览河段。",
      "coordinateMethod": "编辑按兴坪河段作为漓江广域代表点地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "生态环境部 · 桂林漓江美丽河湖案例",
          "url": "https://www.mee.gov.cn/home/ztbd/2021/mlhhyxalzjhd/tmal/202201/t20220127_968342.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:tarim-river",
      "name": "塔里木河",
      "nameEn": "Tarim River",
      "aliases": [
        "塔里木河流域",
        "Tarim Darya"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "650000"
      ],
      "regionIds": [
        "652800",
        "652900"
      ],
      "location": "新疆 · 塔里木盆地（轮台河段代表点）",
      "coordinates": [
        84.29,
        41.2
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "塔里木河",
      "description": "塔里木河流经干旱盆地，河道周围分布着胡杨等荒漠河岸植被。这里按广域河流记录，以轮台一带河段代表这处目的地。",
      "coordinateMethod": "编辑按巴音郭楞轮台河段作为河流代表点，主要关联巴音郭楞与阿克苏地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "新疆财政厅 · 塔里木河生态输水与胡杨保护",
          "url": "https://czt.xinjiang.gov.cn/xjczt/c115022/202409/24e8617647704b2d9b58743e7cb7eb69.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:tamsui-river",
      "name": "淡水河",
      "nameEn": "Tamsui River",
      "aliases": [
        "淡水河口",
        "Danshui River"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "710000"
      ],
      "regionIds": [
        "tw-65000",
        "tw-63000"
      ],
      "location": "台湾 · 新北市 / 台北市（淡水河口代表点）",
      "coordinates": [
        121.41,
        25.17
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "淡水河",
      "description": "淡水河汇集支流后流向海峡，城市与河口湿地沿水系展开。地图以淡水河口示意，河岸散步或其他到访河段可记入笔记。",
      "coordinateMethod": "编辑按淡水河口作为整条河流的代表点地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "新北市环境保护局 · 淡水河流域",
          "url": "https://www.epd.ntpc.gov.tw/StaticPage/riverpol"
        },
        {
          "title": "环境部门水质网 · 淡水河",
          "url": "https://water.moenv.gov.tw/Public/CHT/River/Tamsui.aspx"
        }
      ]
    },
    {
      "id": "poi:CHN:wucai-bay",
      "name": "五彩湾",
      "nameEn": "Wucai Bay",
      "aliases": [
        "五彩湾地区",
        "五彩灣",
        "Wucaiwan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "650000"
      ],
      "regionIds": [
        "652300",
        "654300"
      ],
      "location": "新疆 · 准噶尔盆地东部（五彩湾片区代表点）",
      "coordinates": [
        89.3,
        44.8
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "五彩湾",
      "description": "五彩湾地区裸露的地层记录着久远的地质历史，也是发现古生物化石的区域。这里按广域地貌目的地记录，实际到访地点可写入笔记。",
      "coordinateMethod": "编辑按准噶尔盆地东部五彩湾片区作为广域代表点，主要关联昌吉与阿勒泰；不对应考古采集点或景区入口地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "中国科学院古脊椎动物与古人类研究所 · 五彩湾地区地层与化石研究",
          "url": "https://ivpp.cas.cn/xwdt/kyjz/201811/t20181103_5155433.html"
        },
        {
          "title": "中国科学院古脊椎动物与古人类研究所 · 五彩湾和将军庙地区科学考察",
          "url": "https://www.ivpp.cas.cn/xwdt/kyjz/201811/t20181103_5155313.html"
        }
      ]
    },
    {
      "id": "poi:CHN:three-parallel-rivers",
      "name": "三江并流",
      "nameEn": "Three Parallel Rivers",
      "aliases": [
        "三江并流保护区",
        "三江並流",
        "Three Parallel Rivers of Yunnan Protected Areas"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "530000"
      ],
      "regionIds": [
        "533300",
        "533400",
        "530700"
      ],
      "location": "云南 · 怒江 / 迪庆 / 丽江",
      "coordinates": [
        98.41,
        27.9
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "三江并流",
      "description": "金沙江、澜沧江与怒江在滇西北高山深谷间大致平行流动。这里代表分布在多处的保护地群，可在笔记中注明具体山谷或行程。",
      "coordinateMethod": "编辑按滇西北三江并流保护地群的示意代表点，不表示各保护地边界地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 云南三江并流保护区",
          "url": "https://whc.unesco.org/en/list/1083/"
        }
      ]
    },
    {
      "id": "poi:CHN:detian-waterfall",
      "name": "德天瀑布",
      "nameEn": "Detian Waterfall",
      "aliases": [
        "德天跨国瀑布",
        "德天—板约瀑布",
        "Detian–Ban Gioc Falls"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN",
        "VNM"
      ],
      "country": "中国",
      "provinceCodes": [
        "450000"
      ],
      "regionIds": [
        "451400"
      ],
      "location": "广西 · 崇左 · 大新",
      "coordinates": [
        106.72,
        22.85
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "德天瀑布",
      "description": "归春河在中越边境形成层叠瀑布，水流与两岸喀斯特山地相映。此条目主要关联中国一侧的旅行记录，也保留跨国景观关联。",
      "coordinateMethod": "编辑按德天瀑布水流片区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "文化和旅游部数据服务 · 德天跨国瀑布景区",
          "url": "https://sjfw.mct.gov.cn/site/dataservice/culdetails?curId=10&id=35021"
        }
      ]
    },
    {
      "id": "poi:CHN:tianya-haijiao",
      "name": "天涯海角",
      "nameEn": "Tianya Haijiao",
      "aliases": [
        "三亚天涯海角",
        "Tianya-Haijiao"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "460000"
      ],
      "regionIds": [
        "460200"
      ],
      "location": "海南 · 三亚 · 天涯海角",
      "coordinates": [
        109.35,
        18.29
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "天涯海角",
      "description": "天涯海角沿海岸分布着沙滩与巨石，题刻为海滨景观增添文化记忆。可把海岸漫步和具体观景地点写入旅行笔记。",
      "coordinateMethod": "编辑按三亚天涯海角海岸片区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "三亚市天涯区人民政府 · 天涯海角景区",
          "url": "https://ty.sanya.gov.cn/tyqsite/jrty/202509/dd81add782f34a9d90524794f94f543e.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:xisha-islands",
      "name": "西沙群岛",
      "nameEn": "Xisha Islands",
      "aliases": [
        "西沙群島",
        "Paracel Islands"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "460000"
      ],
      "regionIds": [
        "460300"
      ],
      "location": "海南 · 三沙（永兴岛代表点）",
      "coordinates": [
        112.34,
        16.84
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "西沙群岛",
      "description": "西沙群岛由南海中的岛礁构成，分布范围广阔。地图以永兴岛示意这一群岛目的地，具体到访的岛屿可在笔记中注明。",
      "coordinateMethod": "编辑按永兴岛作为西沙群岛代表点，不表示群岛边界、航线或可进入范围地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "国防部网站 · 三沙市设区与西沙区驻地",
          "url": "https://www.mod.gov.cn/gfbw/qwfb/4863771.html?big=fan"
        }
      ]
    },
    {
      "id": "poi:CHN:penghu-islands",
      "name": "澎湖列岛",
      "nameEn": "Penghu Islands",
      "aliases": [
        "澎湖群岛",
        "澎湖群島",
        "Pescadores"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "710000"
      ],
      "regionIds": [
        "tw-10016"
      ],
      "location": "台湾 · 澎湖县",
      "coordinates": [
        119.62,
        23.56
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "澎湖列岛",
      "description": "澎湖群岛的海岸可见玄武岩地貌、海蚀洞与海蚀拱等景观。这里按群岛目的地记录，可在笔记中补充实际到访的岛屿。",
      "coordinateMethod": "采用项目台湾县市目录中的澎湖县地图代表点，取两位小数作为群岛示意位置；不是完整岛界、港口或航线导航。",
      "sources": [
        {
          "title": "澎湖风景区管理处 · 地质地形",
          "url": "https://www.penghu-nsa.gov.tw/AboutUs/A01.htm"
        }
      ]
    },
    {
      "id": "poi:CHN:gulangyu",
      "name": "鼓浪屿",
      "nameEn": "Gulangyu",
      "aliases": [
        "鼓浪嶼",
        "Kulangsu"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "350000"
      ],
      "regionIds": [
        "350200"
      ],
      "location": "福建 · 厦门 · 鼓浪屿",
      "coordinates": [
        118.07,
        24.45
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "鼓浪屿",
      "description": "鼓浪屿隔海面对厦门，街巷间保留着多种建筑风格。闽南传统与近代文化交流在这座岛上留下可辨认的痕迹。",
      "coordinateMethod": "编辑按鼓浪屿岛内文化景观片区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 鼓浪屿：历史国际社区",
          "url": "https://whc.unesco.org/en/list/1541/"
        }
      ]
    },
    {
      "id": "poi:CHN:yalong-bay",
      "name": "亚龙湾",
      "nameEn": "Yalong Bay",
      "aliases": [
        "亞龍灣",
        "三亚亚龙湾"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "460000"
      ],
      "regionIds": [
        "460200"
      ],
      "location": "海南 · 三亚 · 亚龙湾",
      "coordinates": [
        109.64,
        18.23
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "亚龙湾",
      "description": "亚龙湾的弧形海岸连接长长沙滩与热带山地。可把海边停留、观景和沿岸活动记入这一目的地。",
      "coordinateMethod": "编辑按亚龙湾海岸中部地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "三亚市旅游发展局 · 亚龙湾",
          "url": "https://www.visitsanya.com/zh/destination/%E4%BA%9A%E9%BE%99%E6%B9%BE-2"
        }
      ]
    },
    {
      "id": "poi:CHN:dongzhai-harbour",
      "name": "东寨港",
      "nameEn": "Dongzhai Harbour",
      "aliases": [
        "东寨港红树林",
        "東寨港",
        "Dongzhaigang"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "460000"
      ],
      "regionIds": [
        "460100"
      ],
      "location": "海南 · 海口 · 东寨港",
      "coordinates": [
        110.57,
        19.95
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "东寨港",
      "description": "东寨港潮汐湿地中生长着红树林，为水鸟等动物提供栖息地。这里以湿地片区示意，可记录实际到访的观察点。",
      "coordinateMethod": "编辑按东寨港红树林湿地片区，不对应保护区入口或游船路线地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "国家林业和草原局 · 东寨港自然保护区",
          "url": "https://www.forestry.gov.cn/c/www/zrzrbhq/559895.jhtml"
        },
        {
          "title": "海口江东新区 · 演丰镇东寨港",
          "url": "https://jdxq.haikou.gov.cn/xinwen/2025/show-8854.html"
        }
      ]
    },
    {
      "id": "poi:CHN:yehliu",
      "name": "野柳",
      "nameEn": "Yehliu",
      "aliases": [
        "野柳地质公园",
        "野柳地質公園",
        "Yehliu Geopark"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "710000"
      ],
      "regionIds": [
        "tw-65000"
      ],
      "location": "台湾 · 新北市 · 万里",
      "coordinates": [
        121.69,
        25.21
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "野柳",
      "description": "野柳海岬的砂岩在海浪、风化等作用下呈现多样形态。沿岸的蕈状岩等地貌，让地质变化直观可见。",
      "coordinateMethod": "采用林业及自然保育署地景资料所列 E121.690106679038、N25.205737，取两位小数作地景示意；不作入口导航。",
      "sources": [
        {
          "title": "林业及自然保育署 · 野柳地景资料",
          "url": "https://landscape.forest.gov.tw/Front/land_search/Landscape.aspx?Sn=114&id=kVsq7hIIvoI%3D"
        }
      ]
    },
    {
      "id": "poi:CHN:qilian-grasslands",
      "name": "祁连山草原",
      "nameEn": "Qilian Mountain Grasslands",
      "aliases": [
        "祁连大草原",
        "祁連山草原",
        "Qilian Grasslands"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "630000",
        "620000"
      ],
      "regionIds": [
        "632200",
        "620700"
      ],
      "location": "青海 · 海北 / 甘肃 · 张掖（祁连县片区代表点）",
      "coordinates": [
        100.25,
        38.18
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "祁连山草原",
      "description": "祁连山草原沿高山与河谷展开，天然牧草地与雪山、林地相邻。地图以祁连县片区示意，甘青两侧的具体到访地点可写入笔记。",
      "coordinateMethod": "编辑按青海祁连县片区作为祁连山草原广域代表点，主要关联海北与张掖地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "国家林业和草原局 · 祁连草原生态研究院与博士工作站成立",
          "url": "https://www.forestry.gov.cn/c/www/kjkjxw/630976.jhtml"
        },
        {
          "title": "张掖市林业和草原局 · 肃南康乐草原",
          "url": "https://www.zhangye.gov.cn/lyj/ztzl/cjwmdw/202608/t20260821_1577412.html"
        }
      ]
    },
    {
      "id": "poi:CHN:fanjingshan",
      "name": "梵净山",
      "nameEn": "Fanjingshan",
      "aliases": [
        "梵淨山",
        "Mount Fanjing"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "520000"
      ],
      "regionIds": [
        "520600"
      ],
      "location": "贵州 · 铜仁 · 梵净山",
      "coordinates": [
        108.69,
        27.91
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "梵净山",
      "description": "梵净山在武陵山区形成突出的山体，森林中保留丰富的生物多样性。独特岩峰与山地生态共同构成这里的自然景观。",
      "coordinateMethod": "编辑按梵净山山体地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 梵净山",
          "url": "https://whc.unesco.org/en/list/1559/"
        }
      ]
    },
    {
      "id": "poi:CHN:bashang-grasslands",
      "name": "坝上草原",
      "nameEn": "Bashang Grasslands",
      "aliases": [
        "壩上草原",
        "丰宁坝上",
        "Bashang"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "130000"
      ],
      "regionIds": [
        "130800",
        "130700"
      ],
      "location": "河北 · 承德 / 张家口（丰宁大滩片区代表点）",
      "coordinates": [
        116.55,
        41.66
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "坝上草原",
      "description": "坝上草原覆盖河北北部的多个片区，起伏草地与河湖、林地相间。地图以丰宁大滩片区示意，可在笔记中注明实际游览地点。",
      "coordinateMethod": "编辑按丰宁大滩片区作为坝上草原广域代表点，主要关联承德与张家口地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "国家林业和草原局 · 丰宁坝上草原保护",
          "url": "https://www.forestry.gov.cn/lyj/1/cybhdt/20260629/678739.html"
        },
        {
          "title": "巨鹿县人民政府 · 张北中都草原介绍",
          "url": "https://www.julu.gov.cn/content/52862.html"
        }
      ]
    },
    {
      "id": "poi:CHN:wulingyuan",
      "name": "武陵源",
      "nameEn": "Wulingyuan",
      "aliases": [
        "武陵源风景名胜区",
        "Wulingyuan Scenic Area"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "430000"
      ],
      "regionIds": [
        "430800"
      ],
      "location": "湖南 · 张家界 · 武陵源",
      "coordinates": [
        110.5,
        29.35
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "武陵源",
      "description": "武陵源的砂岩峰柱密集分布在峡谷与森林间。山峰、溪流和洞穴共同组成多层次的山地风景。",
      "coordinateMethod": "编辑按武陵源峰林片区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 武陵源风景名胜区",
          "url": "https://whc.unesco.org/en/list/640/"
        }
      ]
    },
    {
      "id": "poi:CHN:huanglong",
      "name": "黄龙",
      "nameEn": "Huanglong",
      "aliases": [
        "黄龙风景名胜区",
        "黃龍",
        "Huanglong Scenic Area"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "510000"
      ],
      "regionIds": [
        "513200"
      ],
      "location": "四川 · 阿坝 · 松潘",
      "coordinates": [
        103.82,
        32.75
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "黄龙",
      "description": "黄龙山谷中的钙化池层层排列，水色与周围森林、雪山相互映衬。可把步道途中看到的不同池群写入笔记。",
      "coordinateMethod": "编辑按黄龙沟钙化池群片区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 黄龙风景名胜区",
          "url": "https://whc.unesco.org/en/list/638/"
        }
      ]
    },
    {
      "id": "poi:CHN:temple-of-heaven",
      "name": "天坛",
      "nameEn": "Temple of Heaven",
      "aliases": [
        "北京天坛",
        "天壇",
        "Tiantan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "110000"
      ],
      "regionIds": [
        "110000"
      ],
      "location": "北京 · 天坛",
      "coordinates": [
        116.41,
        39.88
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "天坛",
      "description": "天坛的祭祀建筑、院落与园林共同体现传统礼仪空间的组织方式。开阔轴线与古树让建筑景观具有鲜明的层次。",
      "coordinateMethod": "编辑按天坛建筑群地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 北京皇家祭坛——天坛",
          "url": "https://whc.unesco.org/en/list/881/"
        }
      ]
    },
    {
      "id": "poi:CHN:chengde-mountain-resort",
      "name": "承德避暑山庄",
      "nameEn": "Chengde Mountain Resort",
      "aliases": [
        "避暑山莊",
        "热河行宫",
        "Mountain Resort at Chengde"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "130000"
      ],
      "regionIds": [
        "130800"
      ],
      "location": "河北 · 承德 · 避暑山庄",
      "coordinates": [
        117.94,
        41
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "承德避暑山庄",
      "description": "避暑山庄把宫殿、湖泊、草地和山林组织在同一处皇家园林中。可按自己的游览范围记录宫殿区或山水园景。",
      "coordinateMethod": "编辑按承德避暑山庄园区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 承德避暑山庄及周围寺庙",
          "url": "https://whc.unesco.org/en/list/703/"
        }
      ]
    },
    {
      "id": "poi:CHN:confucius-temple-qufu",
      "name": "曲阜孔庙",
      "nameEn": "Temple of Confucius, Qufu",
      "aliases": [
        "曲阜孔廟",
        "阙里孔庙",
        "Qufu Confucius Temple"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "370000"
      ],
      "regionIds": [
        "370800"
      ],
      "location": "山东 · 济宁 · 曲阜",
      "coordinates": [
        116.99,
        35.59
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "曲阜孔庙",
      "description": "曲阜孔庙是祭祀孔子的建筑群，沿中轴线排列的院落与殿宇记录着历代扩建。它与孔府、孔林分别保存不同的历史功能。",
      "coordinateMethod": "编辑按曲阜孔庙南部入口建筑片区作为孔庙代表点；与孔府、孔林分别记录地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 曲阜的孔庙、孔林、孔府",
          "url": "https://whc.unesco.org/en/list/704/"
        }
      ]
    },
    {
      "id": "poi:CHN:kong-family-mansion-qufu",
      "name": "曲阜孔府",
      "nameEn": "Kong Family Mansion, Qufu",
      "aliases": [
        "曲阜孔府衍圣公府",
        "孔府",
        "Confucius Family Mansion"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "370000"
      ],
      "regionIds": [
        "370800"
      ],
      "location": "山东 · 济宁 · 曲阜",
      "coordinates": [
        116.99,
        35.6
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "曲阜孔府",
      "description": "孔府曾是孔子后裔居住与处理事务的场所，院落中兼有生活与行政空间。此条目独立记录孔府，与孔庙和孔林分开。",
      "coordinateMethod": "编辑按曲阜孔府建筑群；与孔庙、孔林分别记录地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 曲阜的孔庙、孔林、孔府",
          "url": "https://whc.unesco.org/en/list/704/"
        }
      ]
    },
    {
      "id": "poi:CHN:confucius-cemetery-qufu",
      "name": "曲阜孔林",
      "nameEn": "Cemetery of Confucius, Qufu",
      "aliases": [
        "至圣林",
        "孔林",
        "Kong Lin"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "370000"
      ],
      "regionIds": [
        "370800"
      ],
      "location": "山东 · 济宁 · 曲阜",
      "coordinates": [
        116.99,
        35.62
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "曲阜孔林",
      "description": "孔林保存孔子及其后裔的墓葬，林木与碑刻构成独特的人文景观。此条目单独记录孔林到访。",
      "coordinateMethod": "编辑按曲阜孔林南部林区；与孔庙、孔府分别记录地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 曲阜的孔庙、孔林、孔府",
          "url": "https://whc.unesco.org/en/list/704/"
        }
      ]
    },
    {
      "id": "poi:CHN:wudang-ancient-buildings",
      "name": "武当山古建筑",
      "nameEn": "Ancient Building Complex in the Wudang Mountains",
      "aliases": [
        "武当山古建筑群",
        "武當山古建築群",
        "Wudang Mountains"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "420000"
      ],
      "regionIds": [
        "420300"
      ],
      "location": "湖北 · 十堰 · 武当山",
      "coordinates": [
        111.06,
        32.42
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "武当山古建筑",
      "description": "武当山的宫观依山势分布，道教建筑与山林环境相融。地图以紫霄宫一带代表建筑群，其他宫观可补充在笔记中。",
      "coordinateMethod": "编辑按武当山紫霄宫片区作为分散建筑群代表点地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 武当山古建筑群",
          "url": "https://whc.unesco.org/en/list/705/"
        }
      ]
    },
    {
      "id": "poi:CHN:summer-palace",
      "name": "颐和园",
      "nameEn": "Summer Palace",
      "aliases": [
        "頤和園",
        "北京颐和园",
        "Yiheyuan"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "110000"
      ],
      "regionIds": [
        "110000"
      ],
      "location": "北京 · 颐和园",
      "coordinates": [
        116.27,
        40
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "颐和园",
      "description": "颐和园以山水为骨架，将宫殿、寺庙、长廊与桥梁融入园林。沿湖与山间的不同路线展现不同的空间关系。",
      "coordinateMethod": "编辑按颐和园园区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 北京皇家园林——颐和园",
          "url": "https://whc.unesco.org/en/list/880/"
        }
      ]
    },
    {
      "id": "poi:CHN:ming-qing-imperial-tombs",
      "name": "明清皇陵",
      "nameEn": "Imperial Tombs of the Ming and Qing Dynasties",
      "aliases": [
        "明清皇家陵寝",
        "明清皇陵群",
        "Ming and Qing Tombs"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "110000",
        "130000",
        "420000",
        "320000",
        "210000"
      ],
      "regionIds": [
        "110000",
        "130200",
        "130600",
        "420800",
        "320100",
        "210100",
        "210400"
      ],
      "location": "北京 / 河北 / 湖北 / 江苏 / 辽宁（长陵代表点）",
      "coordinates": [
        116.24,
        40.3
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "明清皇陵",
      "description": "明清皇陵是分布在多省市的陵寝群，陵墓建筑、石刻与周围山水共同构成整体。地图以北京长陵代表，实际到访的陵寝可在笔记中注明。",
      "coordinateMethod": "编辑按北京长陵作为跨省系列陵寝的代表点，不表示全部陵寝位置或边界地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 明清皇家陵寝",
          "url": "https://whc.unesco.org/en/list/1004/"
        }
      ]
    },
    {
      "id": "poi:CHN:turpan-karez",
      "name": "坎儿井",
      "nameEn": "Turpan Karez",
      "aliases": [
        "吐鲁番坎儿井",
        "坎兒井",
        "Karez Irrigation System"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "650000"
      ],
      "regionIds": [
        "650400"
      ],
      "location": "新疆 · 吐鲁番（坎儿井民俗园片区代表点）",
      "coordinates": [
        89.13,
        42.93
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "坎儿井",
      "description": "坎儿井通过竖井、暗渠等设施引导水源，是吐鲁番传统用水方式的重要组成。这里按工程群记录，可注明实际参观的井渠或展示地点。",
      "coordinateMethod": "编辑按吐鲁番坎儿井民俗园附近作为分散工程群代表点，不表示全部井渠或入口导航地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "新疆检察机关 · 坎儿井保护与传统灌溉工程",
          "url": "https://www.xj.jcy.gov.cn/ztzl/70zn/202509/t20250920_7147112.shtml"
        },
        {
          "title": "新疆水利厅 · 坎儿井水工程",
          "url": "https://slt.xinjiang.gov.cn/xjslt/c114434/202602/f49b19e07ad84675971f1460bba78135.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:beijing-hangzhou-grand-canal",
      "name": "京杭大运河",
      "nameEn": "Beijing–Hangzhou Grand Canal",
      "aliases": [
        "京杭運河",
        "京杭运河",
        "Jinghang Grand Canal"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "110000",
        "120000",
        "130000",
        "370000",
        "320000",
        "330000"
      ],
      "regionIds": [
        "110000",
        "120000",
        "321000",
        "330100"
      ],
      "location": "北京至浙江 · 京杭运河沿线（杭州拱宸桥代表点）",
      "coordinates": [
        120.14,
        30.32
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "京杭大运河",
      "description": "京杭大运河连接北方与江南的水系，沿线保留桥梁、河岸聚落和水工遗产。地图用杭州拱宸桥附近代表，可在笔记中记录实际到访河段。",
      "coordinateMethod": "编辑按杭州拱宸桥附近作为京杭运河沿线代表点；UNESCO 大运河来源涵盖的遗产范围还包括其他运河段地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 大运河",
          "url": "https://whc.unesco.org/en/list/1443/"
        }
      ]
    },
    {
      "id": "poi:CHN:yuanyang-rice-terraces",
      "name": "元阳梯田",
      "nameEn": "Yuanyang Rice Terraces",
      "aliases": [
        "红河哈尼梯田",
        "元陽梯田",
        "Honghe Hani Rice Terraces"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "530000"
      ],
      "regionIds": [
        "532500"
      ],
      "location": "云南 · 红河 · 元阳",
      "coordinates": [
        102.78,
        23.1
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "元阳梯田",
      "description": "元阳梯田沿哀牢山坡层层展开，森林、水系、村寨与稻田彼此连接。这里记录农耕文化景观，可补充具体观景村寨。",
      "coordinateMethod": "编辑按元阳梯田片区作为分散梯田景观代表点地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 红河哈尼梯田文化景观",
          "url": "https://whc.unesco.org/en/list/1111/"
        }
      ]
    },
    {
      "id": "poi:CHN:tunxi-old-street",
      "name": "屯溪老街",
      "nameEn": "Tunxi Old Street",
      "aliases": [
        "屯溪古街",
        "Tunxi Ancient Street"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "340000"
      ],
      "regionIds": [
        "341000"
      ],
      "location": "安徽 · 黄山 · 屯溪",
      "coordinates": [
        118.3,
        29.71
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "屯溪老街",
      "description": "屯溪老街位于新安江畔，传统商铺与街巷保存着徽州商业生活的痕迹。步行其间，可以记录建筑细节与老城停留。",
      "coordinateMethod": "编辑按屯溪老街街区地理位置选取两位小数示意坐标；用于旅行地图显示，不是边界、入口导航或登顶证明。",
      "sources": [
        {
          "title": "黄山市人民政府 · 屯溪老街",
          "url": "https://www.huangshan.gov.cn/zjhs/sjhs/ghz/gj/8298643.html"
        }
      ]
    },
    {
      "id": "poi:CHN:harbin",
      "name": "哈尔滨",
      "nameEn": "Harbin",
      "aliases": [
        "哈爾濱",
        "Harbin City"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "230000"
      ],
      "regionIds": [
        "230100"
      ],
      "location": "黑龙江 · 哈尔滨",
      "coordinates": [
        126.64,
        45.76
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "哈尔滨",
      "description": "哈尔滨沿松花江展开，街区建筑与北方城市生活构成独特风景。这里按城市目的地记录，可在笔记中注明具体街区与景点。",
      "coordinateMethod": "采用项目 china-prefecture-index.json 中哈尔滨市的地图显示代表点，取两位小数；表示整座城市的旅行目的地，不是政府地址或景区入口。",
      "sources": [
        {
          "title": "黑龙江省直机关党建网 · 哈尔滨城市概况",
          "url": "https://www.ljjgdj.gov.cn/system/202607/131221.html"
        }
      ]
    },
    {
      "id": "poi:CHN:dalian",
      "name": "大连",
      "nameEn": "Dalian",
      "aliases": [
        "大連",
        "Dalian City"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "210000"
      ],
      "regionIds": [
        "210200"
      ],
      "location": "辽宁 · 大连",
      "coordinates": [
        121.62,
        38.91
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "大连",
      "description": "大连位于辽东半岛南端，海湾、港口与城市街区相连。可把不同海岸与城区的到访写入这一城市目的地。",
      "coordinateMethod": "采用项目 china-prefecture-index.json 中大连市的地图显示代表点，取两位小数；表示整座城市的旅行目的地，不是政府地址或景区入口。",
      "sources": [
        {
          "title": "辽宁省人民政府 · 大连城市名片",
          "url": "https://www.ln.gov.cn/web/sqgk/csmp/2025101310551499142/index.shtml"
        },
        {
          "title": "工业和信息化部 · 大连城市介绍",
          "url": "https://www.miit.gov.cn/ztzl/lszt/gjgyyxzdlxcs/csmd/art/2020/art_ae22168e60ab4a5894b00fe88efb756c.html"
        }
      ]
    },
    {
      "id": "poi:CHN:qingdao",
      "name": "青岛",
      "nameEn": "Qingdao",
      "aliases": [
        "青島",
        "Tsingtao"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "370000"
      ],
      "regionIds": [
        "370200"
      ],
      "location": "山东 · 青岛",
      "coordinates": [
        120.36,
        36.08
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "青岛",
      "description": "青岛的老城街巷与海滨空间相接，沿岸和周围山地提供不同的旅行体验。这里按整座城市记录，具体路线可写入笔记。",
      "coordinateMethod": "采用项目 china-prefecture-index.json 中青岛市的地图显示代表点，取两位小数；表示整座城市的旅行目的地，不是政府地址或景区入口。",
      "sources": [
        {
          "title": "青岛市人民政府 · 城市漫游与海滨路线",
          "url": "https://www.qingdao.gov.cn/ywdt/bmdt/202605/t20260513_10592374.shtml"
        }
      ]
    },
    {
      "id": "poi:CHN:shanghai",
      "name": "上海",
      "nameEn": "Shanghai",
      "aliases": [
        "上海市",
        "Shanghai City"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "310000"
      ],
      "regionIds": [
        "310000"
      ],
      "location": "上海",
      "coordinates": [
        121.47,
        31.23
      ],
      "themeIds": [
        "china-most-beautiful-100"
      ],
      "stampLabel": "上海",
      "description": "上海的江岸天际线与石库门街区展现不同年代的城市面貌。可将河畔步行、街巷探索与其他停留写入这座城市的旅行记录。",
      "coordinateMethod": "采用项目 china-prefecture-index.json 中上海市的地图显示代表点，取两位小数；表示整座城市的旅行目的地，不是政府地址或景区入口。",
      "sources": [
        {
          "title": "上海市人民政府 · 城市漫游与历史街区",
          "url": "https://www.shanghai.gov.cn/nw17239/20260617/1c050f98f53e4055a1b8e4dda00872d5.html"
        }
      ]
    },
    {
      "id": "poi:CHN:hong-kong",
      "name": "香港",
      "nameEn": "Hong Kong",
      "aliases": [
        "香港特别行政区",
        "香港特別行政區",
        "Hongkong",
        "HKSAR"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "810000"
      ],
      "regionIds": [
        "810000"
      ],
      "location": "香港",
      "coordinates": [
        114.17,
        22.32
      ],
      "themeIds": [
        "china-most-beautiful-100",
        "world-most-beautiful-100"
      ],
      "stampLabel": "香港",
      "description": "香港的海港、山地与密集街区彼此相邻，渡轮和滨海步道提供观察城市的不同角度。这里按城市目的地记录，可补充具体岛屿与街区。",
      "coordinateMethod": "采用项目 china-prefecture-index.json 中香港特别行政区的地图显示代表点，取两位小数；表示整座城市的旅行目的地，不是政府地址或景区入口。",
      "sources": [
        {
          "title": "香港旅游发展局 · 香港景点与海港风景",
          "url": "https://www.discoverhongkong.com/eng/attractions.html"
        }
      ]
    },
    {
      "id": "poi:NPL:himalayas",
      "name": "喜马拉雅山脉",
      "nameEn": "Himalayas",
      "aliases": [
        "喜馬拉雅山脈",
        "喜马拉雅",
        "Himalayan Range",
        "Himalaya"
      ],
      "countryCode": "NPL",
      "countryCodes": [
        "NPL",
        "CHN",
        "IND",
        "BTN",
        "PAK"
      ],
      "country": "尼泊尔",
      "provinceCodes": [
        "540000"
      ],
      "regionIds": [
        "540200",
        "540400",
        "540500"
      ],
      "location": "亚洲多国（尼泊尔安纳布尔纳代表点）",
      "coordinates": [
        83.82,
        28.6
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "喜马拉雅山脉",
      "description": "喜马拉雅山脉横跨多国，雪峰、冰川与深谷连成广阔山地。地图以尼泊尔安纳布尔纳一带代表山脉，记录范围与单独的珠峰条目不同。",
      "coordinateMethod": "安纳布尔纳山体附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "NASA · 喜马拉雅山脉与青藏高原",
          "url": "https://www.nasa.gov/image-article/himalayas-separate-tibetan-plateau-from-indian-subcontinent/"
        },
        {
          "title": "尼泊尔旅游局 · 安纳布尔纳地区",
          "url": "https://trade.ntb.gov.np/tourist-destination/annapurna-region/"
        }
      ]
    },
    {
      "id": "poi:CHE:alps",
      "name": "阿尔卑斯山脉",
      "nameEn": "Alps",
      "aliases": [
        "阿爾卑斯山脈",
        "阿尔卑斯",
        "Alpine Mountains",
        "European Alps"
      ],
      "countryCode": "CHE",
      "countryCodes": [
        "CHE",
        "AUT",
        "FRA",
        "DEU",
        "ITA",
        "LIE",
        "MCO",
        "SVN"
      ],
      "country": "瑞士",
      "provinceCodes": [],
      "regionIds": [],
      "location": "欧洲多国（瑞士格林德瓦代表点）",
      "coordinates": [
        8.04,
        46.62
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "阿尔卑斯山脉",
      "description": "阿尔卑斯山脉连接欧洲多国，冰川山谷、牧场与高山聚落相伴。地图以瑞士格林德瓦附近代表整条山系，不限定于一个国家。",
      "coordinateMethod": "格林德瓦附近阿尔卑斯山地的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "阿尔卑斯公约 · 山脉与八个成员国",
          "url": "https://www.alpconv.org/en/home"
        }
      ]
    },
    {
      "id": "poi:TZA:kilimanjaro",
      "name": "乞力马扎罗山",
      "nameEn": "Mount Kilimanjaro",
      "aliases": [
        "乞力馬扎羅山",
        "Kilimanjaro",
        "Kibo"
      ],
      "countryCode": "TZA",
      "countryCodes": [
        "TZA"
      ],
      "country": "坦桑尼亚",
      "provinceCodes": [],
      "regionIds": [],
      "location": "坦桑尼亚 · 乞力马扎罗",
      "coordinates": [
        37.35,
        -3.07
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "乞力马扎罗山",
      "description": "乞力马扎罗的火山山体从东非平原上升起，山麓森林与高处冰雪呈现明显的垂直变化。地图记录这一山地景观的到访。",
      "coordinateMethod": "乞力马扎罗基博山体附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 乞力马扎罗国家公园",
          "url": "https://whc.unesco.org/en/list/403/"
        }
      ]
    },
    {
      "id": "poi:ARG:andes",
      "name": "安第斯山脉",
      "nameEn": "Andes",
      "aliases": [
        "安第斯山脈",
        "Andean Mountains",
        "Cordillera de los Andes"
      ],
      "countryCode": "ARG",
      "countryCodes": [
        "ARG",
        "BOL",
        "CHL",
        "COL",
        "ECU",
        "PER",
        "VEN"
      ],
      "country": "阿根廷",
      "provinceCodes": [],
      "regionIds": [],
      "location": "南美洲多国（阿根廷阿空加瓜代表点）",
      "coordinates": [
        -69.98,
        -32.65
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "安第斯山脉",
      "description": "安第斯山脉纵贯南美洲西侧，连结高原、雪山与深谷。地图以阿根廷阿空加瓜一带作为代表，保留跨越多个国家的山系含义。",
      "coordinateMethod": "阿空加瓜山体附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNEP 区域适应项目文件 · 安第斯山脉七国范围",
          "url": "https://www.adaptation-fund.org/wp-content/uploads/2024/01/UNEP_Argentina-Chile-Colombia-Peru.pdf"
        }
      ]
    },
    {
      "id": "poi:CAN:rocky-mountains",
      "name": "落基山脉",
      "nameEn": "Rocky Mountains",
      "aliases": [
        "落基山脈",
        "洛矶山脉",
        "Rockies",
        "Canadian Rockies"
      ],
      "countryCode": "CAN",
      "countryCodes": [
        "CAN",
        "USA"
      ],
      "country": "加拿大",
      "provinceCodes": [],
      "regionIds": [
        "world:CAN:city-1159148849"
      ],
      "location": "加拿大、美国（加拿大班夫代表点）",
      "coordinates": [
        -115.57,
        51.18
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "落基山脉",
      "description": "落基山脉跨越北美西部，山峰、冰川湖与森林构成连续山地景观。地图以加拿大班夫作为代表，记录并不限于班夫国家公园。",
      "coordinateMethod": "沿用本应用已核实的 班夫（镇）（Banff）城市参考点，取两位小数，作为广域目的地的代表；不是全域中心、景点入口或已走遍全域的证明。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 加拿大落基山公园群",
          "url": "https://whc.unesco.org/en/list/304/"
        },
        {
          "title": "美国国家公园管理局 · 落基山国家公园",
          "url": "https://www.nps.gov/romo/index.htm"
        },
        {
          "title": "Natural Earth · 本应用既有城市坐标来源",
          "url": "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places.geojson"
        }
      ]
    },
    {
      "id": "poi:USA:grand-canyon",
      "name": "大峡谷",
      "nameEn": "Grand Canyon",
      "aliases": [
        "大峽谷",
        "科罗拉多大峡谷",
        "Grand Canyon National Park"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-AZ"
      ],
      "location": "美国 · 亚利桑那州",
      "coordinates": [
        -112.11,
        36.06
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "大峡谷",
      "description": "科罗拉多河切穿层层岩石，形成开阔而深邃的大峡谷。不同岩层与台地记录着漫长的地质变化，地图以南缘一带作为代表。",
      "coordinateMethod": "大峡谷南缘附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 大峡谷国家公园",
          "url": "https://whc.unesco.org/en/list/75/"
        }
      ]
    },
    {
      "id": "poi:KEN:east-african-rift",
      "name": "东非大裂谷",
      "nameEn": "East African Rift",
      "aliases": [
        "東非大裂谷",
        "东非裂谷",
        "East African Rift System",
        "Great Rift Valley"
      ],
      "countryCode": "KEN",
      "countryCodes": [
        "KEN",
        "ETH",
        "DJI",
        "ERI",
        "TZA",
        "UGA",
        "RWA",
        "BDI",
        "COD",
        "MWI",
        "MOZ",
        "ZMB"
      ],
      "country": "肯尼亚",
      "provinceCodes": [],
      "regionIds": [],
      "location": "东非多国（肯尼亚奈瓦沙一带代表点）",
      "coordinates": [
        36.32,
        -0.9
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "东非大裂谷",
      "description": "东非裂谷由延伸数千公里的断裂、火山与湖盆组成。地图以肯尼亚奈瓦沙附近代表这个广域地貌，不将单个湖泊等同于整条裂谷。",
      "coordinateMethod": "奈瓦沙附近裂谷地带的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "美国地质调查局 · 东非裂谷地震与地质概况",
          "url": "https://www.usgs.gov/publications/seismicity-earth-1900-2013-east-african-rift"
        }
      ]
    },
    {
      "id": "poi:ZAF:cape-of-good-hope",
      "name": "好望角",
      "nameEn": "Cape of Good Hope",
      "aliases": [
        "好望角岬",
        "Cape Point region",
        "Kaap die Goeie Hoop"
      ],
      "countryCode": "ZAF",
      "countryCodes": [
        "ZAF"
      ],
      "country": "南非",
      "provinceCodes": [],
      "regionIds": [
        "world:ZAF:ZA-WC"
      ],
      "location": "南非 · 西开普省",
      "coordinates": [
        18.47,
        -34.36
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "好望角",
      "description": "好望角位于开普半岛，海浪、岩岸与半岛植被构成鲜明的海角景观。地图以好望角岬附近代表这一目的地。",
      "coordinateMethod": "好望角岬附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "南非国家公园 · 好望角与开普角",
          "url": "https://www.sanparks.org/parks/table-mountain/what-to-do/attractions/cape-of-good-hope-cape-point"
        }
      ]
    },
    {
      "id": "poi:USA:mount-mckinley",
      "name": "麦金利山",
      "nameEn": "Mount McKinley",
      "aliases": [
        "麥金利山",
        "德纳里山",
        "德納里山",
        "Denali",
        "Mount Denali"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-AK"
      ],
      "location": "美国 · 阿拉斯加州",
      "coordinates": [
        -151.01,
        63.07
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "麦金利山",
      "description": "麦金利山也广为人知于德纳里之名，冰雪山体高出阿拉斯加周边山地。这里记录山岳景观的到访，山名别称可同时搜索。",
      "coordinateMethod": "麦金利山山体附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "美国国家公园管理局 · 德纳里国家公园与麦金利山",
          "url": "https://www.nps.gov/dena/index.htm"
        }
      ]
    },
    {
      "id": "poi:USA:arches",
      "name": "阿切斯岩拱",
      "nameEn": "Arches",
      "aliases": [
        "拱门国家公园",
        "阿切斯岩拱群",
        "Arches National Park",
        "Delicate Arch"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-UT"
      ],
      "location": "美国 · 犹他州",
      "coordinates": [
        -109.5,
        38.74
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "阿切斯岩拱",
      "description": "红色砂岩在侵蚀中形成石拱、岩鳍与孤立岩柱。地图以精致拱门附近代表阿切斯的岩拱景观，不限定于某一座石拱。",
      "coordinateMethod": "精致拱门附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "美国国家公园管理局 · 拱门国家公园",
          "url": "https://www.nps.gov/arch/index.htm"
        }
      ]
    },
    {
      "id": "poi:USA:badlands",
      "name": "巴德兰兹劣地",
      "nameEn": "Badlands",
      "aliases": [
        "巴德蘭茲劣地",
        "恶地国家公园",
        "Badlands National Park",
        "South Dakota Badlands"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-SD"
      ],
      "location": "美国 · 南达科他州",
      "coordinates": [
        -102.35,
        43.75
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "巴德兰兹劣地",
      "description": "巴德兰兹的层状沉积岩被水与风塑成尖峭山脊，劣地旁仍延展着草原。地图以国家公园内的典型地貌作为代表。",
      "coordinateMethod": "巴德兰兹国家公园典型劣地片区的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "美国国家公园管理局 · 巴德兰兹国家公园",
          "url": "https://www.nps.gov/badl/index.htm"
        }
      ]
    },
    {
      "id": "poi:MAR:sahara-desert",
      "name": "撒哈拉沙漠",
      "nameEn": "Sahara Desert",
      "aliases": [
        "撒哈拉",
        "Sahara",
        "Erg Chebbi"
      ],
      "countryCode": "MAR",
      "countryCodes": [
        "MAR",
        "SAH",
        "DZA",
        "TUN",
        "LBY",
        "EGY",
        "MRT",
        "MLI",
        "NER",
        "TCD",
        "SDN"
      ],
      "country": "摩洛哥",
      "provinceCodes": [],
      "regionIds": [],
      "location": "北非多国（摩洛哥梅尔祖卡沙丘代表点）",
      "coordinates": [
        -3.98,
        31.1
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "撒哈拉沙漠",
      "description": "撒哈拉横跨北非广大地区，沙丘只是其中一种地貌，还包括岩漠与荒原。地图选择摩洛哥梅尔祖卡附近沙丘作为代表点。",
      "coordinateMethod": "梅尔祖卡附近沙丘的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "联合国环境规划署 · 沙漠生态系统与撒哈拉",
          "url": "https://www.unep.org/interactive/explore-ecosystems/desert/en/index.php"
        }
      ]
    },
    {
      "id": "poi:AUS:uluru",
      "name": "艾尔斯岩",
      "nameEn": "Uluru (Ayers Rock)",
      "aliases": [
        "艾爾斯岩",
        "乌鲁鲁",
        "烏魯魯",
        "Ayers Rock",
        "Uluru"
      ],
      "countryCode": "AUS",
      "countryCodes": [
        "AUS"
      ],
      "country": "澳大利亚",
      "provinceCodes": [],
      "regionIds": [
        "world:AUS:AU-NT"
      ],
      "location": "澳大利亚 · 北领地",
      "coordinates": [
        131.04,
        -25.34
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "艾尔斯岩",
      "description": "乌鲁鲁的巨大砂岩体突出于中澳平原，岩面颜色随光线变化。这里也是阿南古人的文化景观，目录保留原来的艾尔斯岩名称。",
      "coordinateMethod": "乌鲁鲁岩体附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 乌鲁鲁—卡塔丘塔国家公园",
          "url": "https://whc.unesco.org/en/list/447/"
        }
      ]
    },
    {
      "id": "poi:AUS:pinnacles-desert",
      "name": "岩塔沙漠",
      "nameEn": "Pinnacles Desert",
      "aliases": [
        "尖峰石阵",
        "岩塔沙漠石柱",
        "The Pinnacles",
        "Nambung National Park"
      ],
      "countryCode": "AUS",
      "countryCodes": [
        "AUS"
      ],
      "country": "澳大利亚",
      "provinceCodes": [],
      "regionIds": [
        "world:AUS:AU-WA"
      ],
      "location": "澳大利亚 · 西澳大利亚州",
      "coordinates": [
        115.16,
        -30.6
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "岩塔沙漠",
      "description": "南邦国家公园的沙地上分布着形态各异的石灰岩柱。风化留下的岩塔与浅色沙丘构成这里独特的沙漠景观。",
      "coordinateMethod": "尖峰石阵片区的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "西澳州公园管理部门 · 尖峰石阵",
          "url": "https://exploreparks.dbca.wa.gov.au/site/pinnacles-desert-lookout-and-drive"
        }
      ]
    },
    {
      "id": "poi:ITA:mount-etna",
      "name": "埃特纳火山",
      "nameEn": "Mount Etna",
      "aliases": [
        "埃特納火山",
        "Etna",
        "Mongibello"
      ],
      "countryCode": "ITA",
      "countryCodes": [
        "ITA"
      ],
      "country": "意大利",
      "provinceCodes": [],
      "regionIds": [
        "world:ITA:IT-82"
      ],
      "location": "意大利 · 西西里",
      "coordinates": [
        15,
        37.75
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "埃特纳火山",
      "description": "埃特纳耸立于西西里岛东部，熔岩地貌、火山锥与山坡植被相互交织。地图记录整个火山景观，代表点不对应即时喷发位置。",
      "coordinateMethod": "埃特纳火山山体附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 埃特纳火山",
          "url": "https://whc.unesco.org/en/list/1427/"
        }
      ]
    },
    {
      "id": "poi:USA:kilauea",
      "name": "基拉韦厄火山",
      "nameEn": "Kilauea",
      "aliases": [
        "基拉韋厄火山",
        "基拉韦亚",
        "Kīlauea",
        "Halemaumau"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-HI"
      ],
      "location": "美国 · 夏威夷岛",
      "coordinates": [
        -155.29,
        19.42
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "基拉韦厄火山",
      "description": "基拉韦厄是夏威夷岛上的盾状火山，熔岩流不断塑造周边地表。地图以山顶破火山口附近作为代表，不表示当前活动区域。",
      "coordinateMethod": "基拉韦厄山顶破火山口附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "美国国家公园管理局 · 基拉韦厄火山",
          "url": "https://www.nps.gov/havo/learn/nature/kilauea.htm"
        }
      ]
    },
    {
      "id": "poi:NZL:ngauruhoe",
      "name": "瑙鲁霍伊火山",
      "nameEn": "Mount Ngauruhoe",
      "aliases": [
        "瑙魯霍伊火山",
        "瑙鲁赫伊",
        "Ngauruhoe",
        "Ngāuruhoe"
      ],
      "countryCode": "NZL",
      "countryCodes": [
        "NZL"
      ],
      "country": "新西兰",
      "provinceCodes": [],
      "regionIds": [
        "world:NZL:NZ-MWT"
      ],
      "location": "新西兰 · 汤加里罗地区",
      "coordinates": [
        175.63,
        -39.16
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "瑙鲁霍伊火山",
      "description": "瑙鲁霍伊的锥形山体属于汤加里罗火山景观，也是当地毛利文化所珍视的山岳。地图以山体附近代表目的地。",
      "coordinateMethod": "瑙鲁霍伊火山山体附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 汤加里罗国家公园",
          "url": "https://whc.unesco.org/en/list/421/"
        },
        {
          "title": "新西兰保护部 · 汤加里罗与瑙鲁霍伊火山",
          "url": "https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/know-before-you-go/volcanic-risk-in-tongariro-national-park/"
        }
      ]
    },
    {
      "id": "poi:USA:haleakala-crater",
      "name": "哈莱阿卡拉火山口",
      "nameEn": "Haleakala Crater",
      "aliases": [
        "哈萊阿卡拉火山口",
        "哈雷阿卡拉",
        "Haleakalā",
        "Haleakala Summit"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-HI"
      ],
      "location": "美国 · 夏威夷 · 毛伊岛",
      "coordinates": [
        -156.21,
        20.71
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "哈莱阿卡拉火山口",
      "description": "哈莱阿卡拉高处有彩色火山渣锥与开阔谷地。书名沿用火山口这一习称，公园资料说明这片主要凹地实际由侵蚀形成。",
      "coordinateMethod": "哈莱阿卡拉山顶谷地附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "美国国家公园管理局 · 哈莱阿卡拉 Crater’s Edge 地质说明",
          "url": "https://www.nps.gov/places/craters-edge.htm"
        }
      ]
    },
    {
      "id": "poi:CAN:niagara-falls",
      "name": "尼亚加拉瀑布",
      "nameEn": "Niagara Falls",
      "aliases": [
        "尼亞加拉瀑布",
        "马蹄瀑布",
        "Horseshoe Falls",
        "Niagara"
      ],
      "countryCode": "CAN",
      "countryCodes": [
        "CAN",
        "USA"
      ],
      "country": "加拿大",
      "provinceCodes": [],
      "regionIds": [
        "world:CAN:CA-ON",
        "world:USA:US-NY"
      ],
      "location": "加拿大安大略省 / 美国纽约州",
      "coordinates": [
        -79.08,
        43.08
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "尼亚加拉瀑布",
      "description": "尼亚加拉河上的瀑布群位于美加交界，马蹄瀑布与美国一侧瀑布共同构成景观。地图以加拿大岸附近作为代表点。",
      "coordinateMethod": "加拿大岸马蹄瀑布附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "尼亚加拉公园委员会 · 瀑布地质与事实",
          "url": "https://www.niagaraparks.com/visit-niagara-parks/plan-your-visit/niagara-falls-geology-facts-figures/"
        }
      ]
    },
    {
      "id": "poi:ZWE:victoria-falls",
      "name": "维多利亚瀑布",
      "nameEn": "Victoria Falls",
      "aliases": [
        "維多利亞瀑布",
        "莫西奥图尼亚",
        "Mosi-oa-Tunya",
        "Victoria Waterfall"
      ],
      "countryCode": "ZWE",
      "countryCodes": [
        "ZWE",
        "ZMB"
      ],
      "country": "津巴布韦",
      "provinceCodes": [],
      "regionIds": [],
      "location": "津巴布韦 / 赞比亚",
      "coordinates": [
        25.85,
        -17.93
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "维多利亚瀑布",
      "description": "赞比西河在玄武岩峡谷边缘倾泻，激起的水雾成为维多利亚瀑布的标志。瀑布跨越两国，地图以津巴布韦岸附近作为代表。",
      "coordinateMethod": "津巴布韦岸瀑布观景区域附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 莫西奥图尼亚／维多利亚瀑布",
          "url": "https://whc.unesco.org/en/list/509/"
        }
      ]
    },
    {
      "id": "poi:VEN:angel-falls",
      "name": "安赫尔瀑布",
      "nameEn": "Angel Falls",
      "aliases": [
        "安赫爾瀑布",
        "天使瀑布",
        "Salto Ángel",
        "Kerepakupai Merú"
      ],
      "countryCode": "VEN",
      "countryCodes": [
        "VEN"
      ],
      "country": "委内瑞拉",
      "provinceCodes": [],
      "regionIds": [],
      "location": "委内瑞拉 · 卡奈马",
      "coordinates": [
        -62.54,
        5.97
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "安赫尔瀑布",
      "description": "安赫尔瀑布从圭亚那高地的桌状山崖跌落，四周为雨林与台地景观。地图以瀑布所在山崖附近作为代表。",
      "coordinateMethod": "安赫尔瀑布山崖附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 卡奈马国家公园",
          "url": "https://whc.unesco.org/en/list/701/"
        }
      ]
    },
    {
      "id": "poi:ARG:iguazu-falls",
      "name": "伊瓜苏瀑布",
      "nameEn": "Iguazu Falls",
      "aliases": [
        "伊瓜蘇瀑布",
        "Iguazú Falls",
        "Iguaçu Falls",
        "Cataratas del Iguazú"
      ],
      "countryCode": "ARG",
      "countryCodes": [
        "ARG",
        "BRA"
      ],
      "country": "阿根廷",
      "provinceCodes": [],
      "regionIds": [
        "world:BRA:BR-PR"
      ],
      "location": "阿根廷 / 巴西",
      "coordinates": [
        -54.44,
        -25.69
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "伊瓜苏瀑布",
      "description": "伊瓜苏瀑布群沿两国边界的河谷展开，众多水帘与亚热带森林相映。地图以阿根廷一侧瀑布群附近作为代表点。",
      "coordinateMethod": "阿根廷一侧瀑布群附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 伊瓜苏国家公园",
          "url": "https://whc.unesco.org/en/list/303/"
        },
        {
          "title": "UNESCO 世界遗产中心 · 伊瓜苏国家公园（巴西）",
          "url": "https://whc.unesco.org/en/list/355/"
        }
      ]
    },
    {
      "id": "poi:BRA:amazon-rainforest",
      "name": "亚马孙雨林",
      "nameEn": "Amazon Rainforest",
      "aliases": [
        "亞馬孫雨林",
        "亚马逊雨林",
        "Amazonia",
        "Amazon Forest"
      ],
      "countryCode": "BRA",
      "countryCodes": [
        "BRA",
        "BOL",
        "PER",
        "ECU",
        "COL",
        "VEN",
        "GUY",
        "SUR",
        "FRA"
      ],
      "country": "巴西",
      "provinceCodes": [],
      "regionIds": [
        "world:BRA:BR-AM"
      ],
      "location": "南美洲多国及法属圭亚那（巴西亚马孙州代表点）",
      "coordinates": [
        -61.6,
        -2.33
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "亚马孙雨林",
      "description": "亚马孙雨林跨越南美洲多地，森林与河道共同支撑丰富的生命。地图以巴西亚马孙州的森林区域作为代表，法国关联指法属圭亚那。",
      "coordinateMethod": "巴西亚马孙州茹阿乌国家公园附近森林的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 亚马孙河中心综合保护区",
          "url": "https://whc.unesco.org/en/list/998/"
        },
        {
          "title": "世界自然基金会 · 亚马孙地区范围与生态",
          "url": "https://www.worldwildlife.org/resources/facts/what-animals-live-in-the-amazon-and-8-other-amazon-facts/"
        }
      ]
    },
    {
      "id": "poi:AUS:queensland-wet-tropics",
      "name": "昆士兰湿热带雨林",
      "nameEn": "Wet Tropics of Queensland",
      "aliases": [
        "昆士蘭濕熱帶雨林",
        "昆士兰热带雨林",
        "Daintree Rainforest",
        "Queensland Wet Tropics"
      ],
      "countryCode": "AUS",
      "countryCodes": [
        "AUS"
      ],
      "country": "澳大利亚",
      "provinceCodes": [],
      "regionIds": [
        "world:AUS:AU-QLD"
      ],
      "location": "澳大利亚 · 昆士兰州",
      "coordinates": [
        145.41,
        -16.24
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "昆士兰湿热带雨林",
      "description": "昆士兰东北部的湿热带雨林沿海岸山地展开，保存着多样的植物与动物。地图以黛恩树雨林附近作为这一广域雨林带的代表。",
      "coordinateMethod": "黛恩树雨林附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 昆士兰湿热带地区",
          "url": "https://whc.unesco.org/en/list/486/"
        }
      ]
    },
    {
      "id": "poi:ATA:antarctica",
      "name": "南极洲",
      "nameEn": "Antarctica",
      "aliases": [
        "南極洲",
        "南极大陆",
        "Antarctic Continent",
        "Antarctic Peninsula"
      ],
      "countryCode": "ATA",
      "countryCodes": [
        "ATA"
      ],
      "country": "南极洲",
      "provinceCodes": [],
      "regionIds": [],
      "location": "南极洲（南极半岛附近代表点）",
      "coordinates": [
        -64.05,
        -64.77
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "南极洲",
      "description": "南极洲的冰盖、山脉与海岸构成独特的极地环境。地图以南极半岛附近作为大陆旅行目的地的代表，不把这个点视为整个南极。",
      "coordinateMethod": "南极半岛洛克罗伊港附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "澳大利亚南极计划 · 南极洲概况",
          "url": "https://www.antarctica.gov.au/about-antarctica/"
        }
      ]
    },
    {
      "id": "poi:USA:great-plains",
      "name": "大平原",
      "nameEn": "Great Plains",
      "aliases": [
        "北美大平原",
        "北美大草原",
        "North American Great Plains",
        "High Plains"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA",
        "CAN"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-KS"
      ],
      "location": "北美洲（美国堪萨斯州代表点）",
      "coordinates": [
        -100.5,
        39
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "大平原",
      "description": "北美大平原位于落基山脉以东，草地、河谷和农业景观向远处延伸。地图以堪萨斯州的平原区域作为代表，保留广域目的地含义。",
      "coordinateMethod": "堪萨斯州西部平原的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "美国国家公园管理局 · 大平原地貌区",
          "url": "https://www.nps.gov/articles/greatplainsprovince.htm"
        },
        {
          "title": "美国地质调查局 · 大平原的地质故事",
          "url": "https://pubs.usgs.gov/bul/1493/report.pdf"
        }
      ]
    },
    {
      "id": "poi:GBR:giants-causeway",
      "name": "巨人之路",
      "nameEn": "Giant’s Causeway",
      "aliases": [
        "巨人堤道",
        "巨人之堤",
        "Giants Causeway",
        "Causeway Coast"
      ],
      "countryCode": "GBR",
      "countryCodes": [
        "GBR"
      ],
      "country": "英国",
      "provinceCodes": [],
      "regionIds": [
        "world:GBR:GB-NIR"
      ],
      "location": "英国 · 北爱尔兰",
      "coordinates": [
        -6.51,
        55.24
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "巨人之路",
      "description": "北爱尔兰海岸的玄武岩柱紧密相接，在海浪旁形成阶梯般的地貌。巨人传说与古老火山活动的证据在这里交会。",
      "coordinateMethod": "巨人之路海岸岩柱片区的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 巨人之路及其海岸",
          "url": "https://whc.unesco.org/en/list/369/"
        }
      ]
    },
    {
      "id": "poi:TUR:pamukkale",
      "name": "棉花堡",
      "nameEn": "Pamukkale",
      "aliases": [
        "帕穆克卡莱",
        "棉花堡石灰华",
        "Pamukkale Travertines",
        "Hierapolis-Pamukkale"
      ],
      "countryCode": "TUR",
      "countryCodes": [
        "TUR"
      ],
      "country": "土耳其",
      "provinceCodes": [],
      "regionIds": [],
      "location": "土耳其 · 代尼兹利",
      "coordinates": [
        29.12,
        37.92
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "棉花堡",
      "description": "富含矿物的泉水沉积出白色石灰华台地，棉花堡旁还保存着希拉波利斯古城遗迹。地图以主要台地一带作为代表。",
      "coordinateMethod": "棉花堡石灰华台地附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 希拉波利斯—棉花堡",
          "url": "https://whc.unesco.org/en/list/485/"
        }
      ]
    },
    {
      "id": "poi:EGY:nile-river",
      "name": "尼罗河",
      "nameEn": "Nile River",
      "aliases": [
        "尼羅河",
        "白尼罗河",
        "青尼罗河",
        "River Nile",
        "White Nile",
        "Blue Nile"
      ],
      "countryCode": "EGY",
      "countryCodes": [
        "EGY",
        "SDN",
        "SDS",
        "UGA",
        "ETH"
      ],
      "country": "埃及",
      "provinceCodes": [],
      "regionIds": [],
      "location": "非洲多国（埃及卢克索河段代表点）",
      "coordinates": [
        32.63,
        25.7
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "尼罗河",
      "description": "尼罗河与白尼罗河、青尼罗河连接不同的非洲景观，向北穿过干旱地区。地图以埃及卢克索河段代表，国家关联对应主河及两条主要源流。",
      "coordinateMethod": "卢克索附近尼罗河河段的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "尼罗河流域倡议 · 主河与青、白尼罗河概况",
          "url": "https://nilebasin.org/sites/default/files/2023-09/Nile%2520SoB%2520Report%2520Chapter%25209%2520-%2520Summary.pdf"
        }
      ]
    },
    {
      "id": "poi:HUN:danube-river",
      "name": "多瑙河",
      "nameEn": "Danube River",
      "aliases": [
        "多瑙河流域",
        "Donau",
        "Duna",
        "Dunav",
        "Danube"
      ],
      "countryCode": "HUN",
      "countryCodes": [
        "HUN",
        "DEU",
        "AUT",
        "SVK",
        "HRV",
        "SRB",
        "ROU",
        "BGR",
        "MDA",
        "UKR"
      ],
      "country": "匈牙利",
      "provinceCodes": [],
      "regionIds": [],
      "location": "欧洲多国（匈牙利布达佩斯河段代表点）",
      "coordinates": [
        19.05,
        47.5
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "多瑙河",
      "description": "多瑙河把欧洲多个国家的城市、平原与湿地相连。地图以布达佩斯河段作为代表，国家关联采用河流经过或形成边界的国家。",
      "coordinateMethod": "布达佩斯附近多瑙河河段的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "保护多瑙河国际委员会 · 流域国家与概况",
          "url": "https://www.icpdr.org/danube-basin/countries"
        }
      ]
    },
    {
      "id": "poi:USA:mississippi-river",
      "name": "密西西比河",
      "nameEn": "Mississippi River",
      "aliases": [
        "密西西比河干流",
        "Mississippi",
        "Lower Mississippi"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-MN"
      ],
      "location": "美国（明尼苏达州河段代表点）",
      "coordinates": [
        -93.25,
        44.98
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "密西西比河",
      "description": "密西西比河从北方湖区一路流向南方，河岸湿地与水道成为野生动物通道。地图以明尼苏达州的河段代表整条河流。",
      "coordinateMethod": "明尼阿波利斯附近密西西比河河段的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "美国国家公园管理局 · 密西西比河自然环境",
          "url": "https://www.nps.gov/miss/learn/nature/index.htm"
        }
      ]
    },
    {
      "id": "poi:USA:florida-everglades",
      "name": "佛罗里达湿地",
      "nameEn": "Florida Everglades",
      "aliases": [
        "佛羅里達濕地",
        "大沼泽地",
        "大沼泽地国家公园",
        "Everglades",
        "Florida Wetlands"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-FL"
      ],
      "location": "美国 · 佛罗里达州",
      "coordinates": [
        -80.7,
        25.4
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "佛罗里达湿地",
      "description": "佛罗里达南部的浅水湿地连接草泽、红树林与海岸，为鸟类和其他野生动物提供栖息地。地图以大沼泽地国家公园为代表。",
      "coordinateMethod": "大沼泽地国家公园内湿地区域的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 大沼泽地国家公园",
          "url": "https://whc.unesco.org/en/list/76/"
        }
      ]
    },
    {
      "id": "poi:KEN:lake-nakuru",
      "name": "纳库鲁湖",
      "nameEn": "Lake Nakuru",
      "aliases": [
        "納庫魯湖",
        "纳库鲁湖国家公园",
        "Nakuru",
        "Lake Nakuru National Park"
      ],
      "countryCode": "KEN",
      "countryCodes": [
        "KEN"
      ],
      "country": "肯尼亚",
      "provinceCodes": [],
      "regionIds": [],
      "location": "肯尼亚 · 纳库鲁",
      "coordinates": [
        36.09,
        -0.36
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "纳库鲁湖",
      "description": "纳库鲁湖位于肯尼亚裂谷湖区，浅湖和周边生境吸引多种鸟类。地图以湖面附近代表湖泊及其自然景观。",
      "coordinateMethod": "纳库鲁湖湖区的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 肯尼亚大裂谷湖泊系统",
          "url": "https://whc.unesco.org/en/list/1060/"
        }
      ]
    },
    {
      "id": "poi:PER:lake-titicaca",
      "name": "的的喀喀湖",
      "nameEn": "Lake Titicaca",
      "aliases": [
        "的的喀喀",
        "提提卡卡湖",
        "Lago Titicaca",
        "Titicaca"
      ],
      "countryCode": "PER",
      "countryCodes": [
        "PER",
        "BOL"
      ],
      "country": "秘鲁",
      "provinceCodes": [],
      "regionIds": [],
      "location": "秘鲁 / 玻利维亚",
      "coordinates": [
        -69.68,
        -15.77
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "的的喀喀湖",
      "description": "的的喀喀湖位于安第斯高原，湖岸社区与芦苇湿地共同构成高原湖泊景观。地图以秘鲁一侧塔基莱岛附近作为代表。",
      "coordinateMethod": "秘鲁塔基莱岛附近湖区的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产预备名单 · 的的喀喀湖地理资料",
          "url": "https://whc.unesco.org/en/tentativelists/5080/"
        }
      ]
    },
    {
      "id": "poi:AUS:lake-eyre",
      "name": "埃尔湖",
      "nameEn": "Kati Thanda–Lake Eyre",
      "aliases": [
        "埃爾湖",
        "艾尔湖",
        "艾爾湖",
        "Lake Eyre",
        "Kati Thanda"
      ],
      "countryCode": "AUS",
      "countryCodes": [
        "AUS"
      ],
      "country": "澳大利亚",
      "provinceCodes": [],
      "regionIds": [
        "world:AUS:AU-SA"
      ],
      "location": "澳大利亚 · 南澳大利亚州",
      "coordinates": [
        137.3,
        -28.37
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "埃尔湖",
      "description": "埃尔湖位于澳大利亚干旱内陆，盐壳平原在来水后会呈现截然不同的湿地景象。地图以北湖附近作为代表。",
      "coordinateMethod": "卡蒂桑达—埃尔湖北湖附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "南澳国家公园与野生动物管理部门 · 埃尔湖国家公园",
          "url": "https://www.parks.sa.gov.au/parks/kati-thanda-lake-eyre-national-park"
        }
      ]
    },
    {
      "id": "poi:AUS:port-campbell",
      "name": "坎贝尔港",
      "nameEn": "Port Campbell",
      "aliases": [
        "坎貝爾港",
        "坎贝尔港国家公园",
        "十二门徒岩",
        "Port Campbell National Park",
        "Twelve Apostles"
      ],
      "countryCode": "AUS",
      "countryCodes": [
        "AUS"
      ],
      "country": "澳大利亚",
      "provinceCodes": [],
      "regionIds": [
        "world:AUS:AU-VIC"
      ],
      "location": "澳大利亚 · 维多利亚州",
      "coordinates": [
        143.11,
        -38.66
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "坎贝尔港",
      "description": "坎贝尔港沿岸的石灰岩被海浪与风雨塑成峭壁、海蚀拱和离岸石柱。地图以十二门徒岩附近代表这段海岸景观。",
      "coordinateMethod": "十二门徒岩附近海岸的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "维多利亚公园管理局 · 坎贝尔港国家公园游客指南",
          "url": "https://www.parks.vic.gov.au/-/media/project/pv/main/parks/documents/visitor-guides-and-publications/port-campbell-national-park/port-campbell-national-park-and-bay-of-islands-coastal-park-visitor-guide.pdf?rev=628d1bb9c3644837b19a52571bb97c63"
        }
      ]
    },
    {
      "id": "poi:AUS:great-barrier-reef",
      "name": "大堡礁",
      "nameEn": "Great Barrier Reef",
      "aliases": [
        "大堡礁珊瑚礁",
        "GBR",
        "Queensland Coral Reef"
      ],
      "countryCode": "AUS",
      "countryCodes": [
        "AUS"
      ],
      "country": "澳大利亚",
      "provinceCodes": [],
      "regionIds": [
        "world:AUS:AU-QLD"
      ],
      "location": "澳大利亚 · 昆士兰州外海",
      "coordinates": [
        145.97,
        -16.76
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "大堡礁",
      "description": "大堡礁由广阔海域中的珊瑚礁、岛屿与海洋生境组成。地图以凯恩斯外海绿岛附近作为代表，打卡不等于游遍整个礁区。",
      "coordinateMethod": "凯恩斯外海绿岛附近礁区的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 大堡礁",
          "url": "https://whc.unesco.org/en/list/154/"
        }
      ]
    },
    {
      "id": "poi:NZL:rotorua",
      "name": "罗托鲁阿",
      "nameEn": "Rotorua",
      "aliases": [
        "羅托魯阿",
        "罗托鲁瓦",
        "罗托鲁亚",
        "Rotorua Geothermal Region"
      ],
      "countryCode": "NZL",
      "countryCodes": [
        "NZL"
      ],
      "country": "新西兰",
      "provinceCodes": [],
      "regionIds": [
        "world:NZL:city-1159151669"
      ],
      "location": "新西兰 · 普伦蒂湾",
      "coordinates": [
        176.25,
        -38.13
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "罗托鲁阿",
      "description": "罗托鲁阿的地热泉、泥浆池与湖泊景观相伴，也是体验毛利文化的重要地区。地图以城区作为这一目的地的代表点。",
      "coordinateMethod": "沿用本应用已核实的 罗托鲁瓦（Rotorua）城市参考点，取两位小数，作为广域目的地的代表；不是全域中心、景点入口或已走遍全域的证明。",
      "sources": [
        {
          "title": "新西兰旅游局 · 罗托鲁阿",
          "url": "https://www.newzealand.com/int/rotorua/"
        },
        {
          "title": "Natural Earth · 本应用既有城市坐标来源",
          "url": "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places.geojson"
        }
      ]
    },
    {
      "id": "poi:THA:phang-nga-bay",
      "name": "攀牙湾",
      "nameEn": "Phang Nga Bay",
      "aliases": [
        "攀牙灣",
        "攀牙湾国家公园",
        "Ao Phang Nga",
        "Phang-nga Bay"
      ],
      "countryCode": "THA",
      "countryCodes": [
        "THA"
      ],
      "country": "泰国",
      "provinceCodes": [],
      "regionIds": [
        "world:THA:TH-82"
      ],
      "location": "泰国 · 攀牙府",
      "coordinates": [
        98.5,
        8.27
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "攀牙湾",
      "description": "攀牙湾的石灰岩山体从海中升起，岛屿、水洞与红树林交织成海湾景观。地图以湾内考平甘岛附近作为代表。",
      "coordinateMethod": "考平甘岛附近攀牙湾海域的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "泰国国家旅游局 · 攀牙目的地介绍",
          "url": "https://www.tourismthailand.org/Destinations/Provinces/Phang-Nga/348"
        }
      ]
    },
    {
      "id": "poi:ECU:galapagos-islands",
      "name": "加拉帕戈斯群岛",
      "nameEn": "Galapagos Islands",
      "aliases": [
        "加拉帕戈斯群島",
        "科隆群岛",
        "Galápagos Islands",
        "Archipiélago de Colón"
      ],
      "countryCode": "ECU",
      "countryCodes": [
        "ECU"
      ],
      "country": "厄瓜多尔",
      "provinceCodes": [],
      "regionIds": [],
      "location": "厄瓜多尔 · 加拉帕戈斯",
      "coordinates": [
        -90.33,
        -0.74
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "加拉帕戈斯群岛",
      "description": "加拉帕戈斯群岛由火山作用形成，隔离的海岛环境孕育了独特生物。地图以圣克鲁斯岛附近代表群岛，而非某一种动物的观察点。",
      "coordinateMethod": "圣克鲁斯岛南部附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 加拉帕戈斯群岛",
          "url": "https://whc.unesco.org/en/list/1/"
        }
      ]
    },
    {
      "id": "poi:TZA:serengeti",
      "name": "塞伦盖蒂",
      "nameEn": "Serengeti",
      "aliases": [
        "塞倫蓋蒂",
        "塞伦盖蒂国家公园",
        "Serengeti National Park",
        "Serengeti Plains"
      ],
      "countryCode": "TZA",
      "countryCodes": [
        "TZA"
      ],
      "country": "坦桑尼亚",
      "provinceCodes": [],
      "regionIds": [],
      "location": "坦桑尼亚 · 塞伦盖蒂",
      "coordinates": [
        34.83,
        -2.33
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "塞伦盖蒂",
      "description": "塞伦盖蒂的草原、疏林与水源支持大批食草动物及其捕食者。这里以坦桑尼亚塞伦盖蒂国家公园代表书中目的地。",
      "coordinateMethod": "塞伦盖蒂国家公园塞罗内拉附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 塞伦盖蒂国家公园",
          "url": "https://whc.unesco.org/en/list/156/"
        }
      ]
    },
    {
      "id": "poi:USA:yellowstone-national-park",
      "name": "黄石国家公园",
      "nameEn": "Yellowstone National Park",
      "aliases": [
        "黃石國家公園",
        "黄石",
        "Yellowstone"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-WY",
        "world:USA:US-MT",
        "world:USA:US-ID"
      ],
      "location": "美国 · 怀俄明、蒙大拿、爱达荷州",
      "coordinates": [
        -110.59,
        44.56
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "黄石国家公园",
      "description": "黄石把间歇泉、温泉、森林和野生动物栖息地汇在同一片高原。公园涉及三个州，地图以公园内部代表点呈现。",
      "coordinateMethod": "黄石公园内部高原区域的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 黄石国家公园",
          "url": "https://whc.unesco.org/en/list/28/"
        }
      ]
    },
    {
      "id": "poi:TZA:ngorongoro-crater",
      "name": "恩戈罗恩戈罗火山口",
      "nameEn": "Ngorongoro Crater",
      "aliases": [
        "恩戈羅恩戈羅火山口",
        "恩戈罗保护区",
        "Ngorongoro Caldera",
        "Ngorongoro"
      ],
      "countryCode": "TZA",
      "countryCodes": [
        "TZA"
      ],
      "country": "坦桑尼亚",
      "provinceCodes": [],
      "regionIds": [],
      "location": "坦桑尼亚 · 恩戈罗恩戈罗",
      "coordinates": [
        35.59,
        -3.16
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "恩戈罗恩戈罗火山口",
      "description": "恩戈罗恩戈罗的破火山口围合出草原与湖泊，野生动物在其中活动。地图以火山口盆地代表目的地，不扩展为整个保护区所有景点。",
      "coordinateMethod": "恩戈罗恩戈罗破火山口盆地的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 恩戈罗恩戈罗保护区",
          "url": "https://whc.unesco.org/en/list/39/"
        }
      ]
    },
    {
      "id": "poi:FIN:lapland",
      "name": "拉普兰",
      "nameEn": "Lapland",
      "aliases": [
        "拉普蘭",
        "芬兰拉普兰",
        "Finnish Lapland",
        "Lappi"
      ],
      "countryCode": "FIN",
      "countryCodes": [
        "FIN"
      ],
      "country": "芬兰",
      "provinceCodes": [],
      "regionIds": [
        "world:FIN:city-1159150099"
      ],
      "location": "芬兰 · 拉普兰（罗瓦涅米代表点）",
      "coordinates": [
        25.72,
        66.5
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "拉普兰",
      "description": "芬兰拉普兰的森林、丘地与湖泊在不同季节呈现雪地、长昼和秋色。地图以罗瓦涅米作为这一北方旅行区域的代表点。",
      "coordinateMethod": "沿用本应用已核实的 罗瓦涅米（Rovaniemi）城市参考点，取两位小数，作为广域目的地的代表；不是全域中心、景点入口或已走遍全域的证明。",
      "sources": [
        {
          "title": "芬兰国家旅游局 · 芬兰拉普兰",
          "url": "https://www.visitfinland.com/en/places-to-go/lapland/"
        },
        {
          "title": "Natural Earth · 本应用既有城市坐标来源",
          "url": "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places.geojson"
        }
      ]
    },
    {
      "id": "poi:CHE:switzerland",
      "name": "瑞士",
      "nameEn": "Switzerland",
      "aliases": [
        "瑞士全境",
        "Swiss Confederation",
        "Schweiz",
        "Suisse"
      ],
      "countryCode": "CHE",
      "countryCodes": [
        "CHE"
      ],
      "country": "瑞士",
      "provinceCodes": [],
      "regionIds": [
        "world:CHE:city-1159149737"
      ],
      "location": "瑞士（伯尔尼代表点）",
      "coordinates": [
        7.47,
        46.92
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "瑞士",
      "description": "瑞士的山地、湖泊与城镇共同构成多样的旅行景观。本条保留国家级目的地含义，地图选伯尔尼代表，独立于阿尔卑斯山脉条目。",
      "coordinateMethod": "沿用本应用已核实的 伯尔尼（Bern）城市参考点，取两位小数，作为广域目的地的代表；不是全域中心、景点入口或已走遍全域的证明。",
      "sources": [
        {
          "title": "瑞士国家旅游局 · 山岳与冰川",
          "url": "https://www.myswitzerland.com/en-ch/destinations/nature/mountains/"
        },
        {
          "title": "Natural Earth · 本应用既有城市坐标来源",
          "url": "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places.geojson"
        }
      ]
    },
    {
      "id": "poi:ISL:iceland",
      "name": "冰岛",
      "nameEn": "Iceland",
      "aliases": [
        "冰島",
        "冰岛全境",
        "Ísland"
      ],
      "countryCode": "ISL",
      "countryCodes": [
        "ISL"
      ],
      "country": "冰岛",
      "provinceCodes": [],
      "regionIds": [
        "world:ISL:city-1159150587"
      ],
      "location": "冰岛（雷克雅未克代表点）",
      "coordinates": [
        -21.94,
        64.14
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "冰岛",
      "description": "冰岛的火山地貌与冰川并存，海岸、熔岩原和内陆高地各具面貌。地图以雷克雅未克代表这个国家级目的地。",
      "coordinateMethod": "沿用本应用已核实的 雷克雅未克（Reykjavik）城市参考点，取两位小数，作为广域目的地的代表；不是全域中心、景点入口或已走遍全域的证明。",
      "sources": [
        {
          "title": "冰岛官方旅游机构 · 冰岛地理",
          "url": "https://www.visiticeland.com/article/geography-of-iceland_1/"
        },
        {
          "title": "Natural Earth · 本应用既有城市坐标来源",
          "url": "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places.geojson"
        }
      ]
    },
    {
      "id": "poi:GBR:english-lake-district",
      "name": "英格兰湖区",
      "nameEn": "English Lake District",
      "aliases": [
        "英格蘭湖區",
        "英国湖区",
        "Lake District",
        "Cumbria Lakes"
      ],
      "countryCode": "GBR",
      "countryCodes": [
        "GBR"
      ],
      "country": "英国",
      "provinceCodes": [],
      "regionIds": [
        "world:GBR:GB-ENG"
      ],
      "location": "英国 · 英格兰 · 湖区",
      "coordinates": [
        -2.96,
        54.36
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "英格兰湖区",
      "description": "冰川雕刻的山谷与湖泊构成英格兰湖区的底色，牧场和石墙又添上人文层次。地图以温德米尔湖附近代表整个湖区。",
      "coordinateMethod": "温德米尔湖附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 英格兰湖区",
          "url": "https://whc.unesco.org/en/list/422/"
        }
      ]
    },
    {
      "id": "poi:USA:vermont-forests",
      "name": "佛蒙特森林",
      "nameEn": "Vermont Forests",
      "aliases": [
        "佛蒙特州森林",
        "绿山国家森林",
        "Green Mountain National Forest",
        "Vermont Woodland"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-VT"
      ],
      "location": "美国 · 佛蒙特州",
      "coordinates": [
        -72.97,
        43.27
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "佛蒙特森林",
      "description": "佛蒙特的森林覆盖连绵山地，步道穿过林间溪流与不同树种。地图以绿山国家森林为代表，记录不限于某一条步道。",
      "coordinateMethod": "佛蒙特绿山国家森林中部的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "美国林务局 · 绿山与芬格湖国家森林",
          "url": "https://www.fs.usda.gov/r09/gmfl"
        }
      ]
    },
    {
      "id": "poi:CAN:waterton-lakes",
      "name": "沃特顿湖区",
      "nameEn": "Waterton Lakes",
      "aliases": [
        "沃特頓湖區",
        "沃特顿湖",
        "Waterton Lakes National Park",
        "Upper Waterton Lake"
      ],
      "countryCode": "CAN",
      "countryCodes": [
        "CAN",
        "USA"
      ],
      "country": "加拿大",
      "provinceCodes": [],
      "regionIds": [
        "world:CAN:CA-AB",
        "world:USA:US-MT"
      ],
      "location": "加拿大 · 阿尔伯塔 / 美国 · 蒙大拿",
      "coordinates": [
        -113.91,
        49.04
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "沃特顿湖区",
      "description": "沃特顿湖区在草原与山地交接处展开，湖水与雪峰相映，南部与美国冰川地区相连。地图以加拿大一侧湖区作为代表。",
      "coordinateMethod": "沃特顿湖加拿大岸附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 沃特顿—冰川国际和平公园",
          "url": "https://whc.unesco.org/en/list/354/"
        }
      ]
    },
    {
      "id": "poi:USA:mount-rainier",
      "name": "雷尼尔山",
      "nameEn": "Mount Rainier",
      "aliases": [
        "雷尼爾山",
        "瑞尼尔山",
        "Rainier",
        "Tahoma"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-WA"
      ],
      "location": "美国 · 华盛顿州",
      "coordinates": [
        -121.76,
        46.85
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "雷尼尔山",
      "description": "雷尼尔山的冰川覆盖火山山体，较低山坡分布着森林与高山草甸。地图以山体附近代表这一目的地，不表示登顶记录。",
      "coordinateMethod": "雷尼尔山山体附近的近似代表示意点，取两位小数；用于旅行记录，不代表完整边界、精确峰顶或入口导航。",
      "sources": [
        {
          "title": "美国国家公园管理局 · 雷尼尔山国家公园",
          "url": "https://www.nps.gov/mora/index.htm"
        }
      ]
    },
    {
      "id": "poi:NOR:norwegian-coast",
      "name": "挪威海岸",
      "nameEn": "Norwegian Coast",
      "aliases": [
        "Norwegian Coast",
        "挪威峡湾",
        "Norway Coast",
        "Geirangerfjord"
      ],
      "countryCode": "NOR",
      "countryCodes": [
        "NOR"
      ],
      "country": "挪威",
      "provinceCodes": [],
      "regionIds": [
        "world:NOR"
      ],
      "location": "挪威 · 挪威海岸",
      "coordinates": [
        7.2,
        62.1
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "挪威海岸",
      "description": "挪威海岸的峡湾、峭壁与瀑布构成延伸很长的海陆景观。地图以盖朗厄尔峡湾作为代表，记录对象不限于这一段海岸。",
      "coordinateMethod": "本应用选择盖朗厄尔峡湾附近作广域海岸景观的代表点，保留两位小数；不把代表峡湾等同于全部挪威海岸。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 西挪威峡湾：盖朗厄尔峡湾和纳柔依峡湾",
          "url": "https://whc.unesco.org/en/list/1195/"
        }
      ]
    },
    {
      "id": "poi:FRA:provence",
      "name": "普罗旺斯",
      "nameEn": "Provence",
      "aliases": [
        "Provence",
        "普羅旺斯"
      ],
      "countryCode": "FRA",
      "countryCodes": [
        "FRA"
      ],
      "country": "法国",
      "provinceCodes": [],
      "regionIds": [
        "world:FRA:FR-PAC"
      ],
      "location": "法国 · 普罗旺斯（阿维尼翁代表点）",
      "coordinates": [
        4.81,
        43.95
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "普罗旺斯",
      "description": "普罗旺斯的城镇、乡村与地中海风景形成多样的旅行路线。地图选阿维尼翁附近作代表，记录对象是普罗旺斯地区。",
      "coordinateMethod": "选阿维尼翁附近作为普罗旺斯的近似代表点，保留两位小数；不是整个地区的地理中心，也不表示已游遍。",
      "sources": [
        {
          "title": "普罗旺斯—阿尔卑斯—蔚蓝海岸官方旅游局",
          "url": "https://provence-alpes-cotedazur.com/en/"
        }
      ]
    },
    {
      "id": "poi:ITA:tuscany",
      "name": "托斯卡纳",
      "nameEn": "Tuscany",
      "aliases": [
        "Tuscany",
        "托斯卡納",
        "Toscana",
        "Val d’Orcia"
      ],
      "countryCode": "ITA",
      "countryCodes": [
        "ITA"
      ],
      "country": "意大利",
      "provinceCodes": [],
      "regionIds": [
        "world:ITA:IT-52"
      ],
      "location": "意大利 · 托斯卡纳（奥尔恰谷代表点）",
      "coordinates": [
        11.55,
        43.06
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "托斯卡纳",
      "description": "托斯卡纳的丘陵、农田与历史城镇相互交织。地图选奥尔恰谷作为乡村景观代表，记录也可涵盖这一大区的其他目的地。",
      "coordinateMethod": "本应用选奥尔恰谷附近作托斯卡纳广域目的地的近似代表点，保留两位小数；非大区行政中心或完整边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 奥尔恰谷（托斯卡纳乡村景观代表）",
          "url": "https://whc.unesco.org/en/list/1026/"
        }
      ]
    },
    {
      "id": "poi:USA:hawaii",
      "name": "夏威夷",
      "nameEn": "Hawaii",
      "aliases": [
        "Hawaii",
        "夏威夷群岛",
        "Hawaiian Islands"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-HI"
      ],
      "location": "美国 · 夏威夷（檀香山代表点）",
      "coordinates": [
        -157.86,
        21.31
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "夏威夷",
      "description": "夏威夷群岛的海岸、山地与岛屿文化各具面貌。地图以欧胡岛檀香山附近为代表，记录对象可涵盖群岛中的旅行经历。",
      "coordinateMethod": "以欧胡岛檀香山附近选取近似代表点，保留两位小数；表示夏威夷群岛旅行目的地，不代表所有岛屿的共同中心。",
      "sources": [
        {
          "title": "夏威夷官方旅游网站 · 夏威夷群岛",
          "url": "https://www.gohawaii.com/islands"
        }
      ]
    },
    {
      "id": "poi:SYC:seychelles",
      "name": "塞舌尔",
      "nameEn": "Seychelles",
      "aliases": [
        "Seychelles",
        "塞席尔",
        "塞席爾"
      ],
      "countryCode": "SYC",
      "countryCodes": [
        "SYC"
      ],
      "country": "塞舌尔",
      "provinceCodes": [],
      "regionIds": [
        "world:SYC"
      ],
      "location": "塞舌尔 · 普拉兰岛（代表点）",
      "coordinates": [
        55.74,
        -4.33
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "塞舌尔",
      "description": "塞舌尔群岛拥有热带海岛与独特的自然环境。普拉兰岛五月谷的天然棕榈林是其中一处代表，地图选这里承载群岛旅行记录。",
      "coordinateMethod": "本应用以普拉兰岛五月谷附近作群岛的近似代表点，保留两位小数；不把五月谷等同于整个塞舌尔。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 五月谷自然保护区（塞舌尔代表景观）",
          "url": "https://whc.unesco.org/en/list/261/"
        }
      ]
    },
    {
      "id": "poi:GRC:crete",
      "name": "克里特岛",
      "nameEn": "Crete",
      "aliases": [
        "Crete",
        "克里特",
        "Creta"
      ],
      "countryCode": "GRC",
      "countryCodes": [
        "GRC"
      ],
      "country": "希腊",
      "provinceCodes": [],
      "regionIds": [
        "world:GRC"
      ],
      "location": "希腊 · 克里特岛（伊拉克利翁代表点）",
      "coordinates": [
        25.13,
        35.34
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "克里特岛",
      "description": "克里特岛融合山地、海岸与历史遗迹，是希腊的一座大型海岛。地图以伊拉克利翁附近为代表，记录对象覆盖岛上的旅行。",
      "coordinateMethod": "伊拉克利翁市区附近的近似代表示意点，保留两位小数；用于表示整座克里特岛的旅行目的地，不是岛屿中心或景区入口。",
      "sources": [
        {
          "title": "希腊国家旅游组织 · 克里特岛",
          "url": "https://www.visitgreece.gr/en/islands/crete"
        }
      ]
    },
    {
      "id": "poi:AUS:gold-coast",
      "name": "黄金海岸",
      "nameEn": "Gold Coast",
      "aliases": [
        "Gold Coast",
        "黃金海岸"
      ],
      "countryCode": "AUS",
      "countryCodes": [
        "AUS"
      ],
      "country": "澳大利亚",
      "provinceCodes": [],
      "regionIds": [
        "world:AUS:AU-QLD"
      ],
      "location": "澳大利亚 · 昆士兰州 · 黄金海岸",
      "coordinates": [
        153.45,
        -28.08
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "黄金海岸",
      "description": "黄金海岸沿昆士兰州海滨展开，沙滩与城市生活相接，周边还有内陆自然景观。本条记录黄金海岸这座旅行目的地。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "澳大利亚旅游局 · 黄金海岸指南",
          "url": "https://www.australia.com/en/places/gold-coast-and-surrounds/guide-to-the-gold-coast.html"
        }
      ]
    },
    {
      "id": "poi:NZL:queenstown",
      "name": "皇后镇",
      "nameEn": "Queenstown",
      "aliases": [
        "Queenstown",
        "皇后鎮"
      ],
      "countryCode": "NZL",
      "countryCodes": [
        "NZL"
      ],
      "country": "新西兰",
      "provinceCodes": [],
      "regionIds": [
        "world:NZL:NZ-OTA"
      ],
      "location": "新西兰 · 奥塔哥大区 · 皇后镇",
      "coordinates": [
        168.73,
        -45.02
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "皇后镇",
      "description": "皇后镇坐落在瓦卡蒂普湖畔，周围山岭形成醒目的湖山景观。步行、骑行和其他户外活动构成这里的旅行体验。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "新西兰旅游局 · 皇后镇",
          "url": "https://www.newzealand.com/int/queenstown/"
        }
      ]
    },
    {
      "id": "poi:MDV:maldives",
      "name": "马尔代夫",
      "nameEn": "Maldives",
      "aliases": [
        "Maldives",
        "馬爾代夫",
        "馬爾地夫"
      ],
      "countryCode": "MDV",
      "countryCodes": [
        "MDV"
      ],
      "country": "马尔代夫",
      "provinceCodes": [],
      "regionIds": [
        "world:MDV"
      ],
      "location": "马尔代夫（马累代表点）",
      "coordinates": [
        73.51,
        4.17
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "马尔代夫",
      "description": "马尔代夫由分散在印度洋中的珊瑚岛屿组成，潟湖与海岛生活是旅行中的常见景象。地图以马累附近为代表，不限定某一座度假岛。",
      "coordinateMethod": "沿用本应用马尔代夫地图参考点，约为马累附近，坐标取两位小数；不是全部环礁的地理中心或特定酒店。",
      "sources": [
        {
          "title": "马尔代夫官方旅游网站",
          "url": "https://visitmaldives.com/en"
        }
      ]
    },
    {
      "id": "poi:IDN:bali",
      "name": "巴厘岛",
      "nameEn": "Bali",
      "aliases": [
        "Bali",
        "巴厘島",
        "峇里岛",
        "峇里島"
      ],
      "countryCode": "IDN",
      "countryCodes": [
        "IDN"
      ],
      "country": "印度尼西亚",
      "provinceCodes": [],
      "regionIds": [
        "world:IDN:ID-BA"
      ],
      "location": "印度尼西亚 · 巴厘岛",
      "coordinates": [
        115.19,
        -8.44
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "巴厘岛",
      "description": "巴厘岛的寺庙、稻田水利与村落组成富有层次的文化景观。本条记录巴厘岛的旅行经历，地图点只用于示意岛屿位置。",
      "coordinateMethod": "沿用本应用巴厘省地图中心参考坐标并取两位小数；是巴厘岛目的地示意点，不表示到访了苏巴克遗产的全部组成部分。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 巴厘省文化景观：苏巴克灌溉系统",
          "url": "https://whc.unesco.org/en/list/1194/"
        }
      ]
    },
    {
      "id": "poi:PYF:tahiti",
      "name": "塔希提岛",
      "nameEn": "Tahiti",
      "aliases": [
        "Tahiti",
        "大溪地",
        "塔希提",
        "Tahiti Island"
      ],
      "countryCode": "PYF",
      "countryCodes": [
        "PYF"
      ],
      "country": "法属波利尼西亚",
      "provinceCodes": [],
      "regionIds": [
        "world:PYF"
      ],
      "location": "法属波利尼西亚 · 塔希提岛",
      "coordinates": [
        -149.46,
        -17.63
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "塔希提岛",
      "description": "塔希提岛位于法属波利尼西亚，海岸与山地环绕着岛上的聚落。本条专门记录塔希提岛，不把附近其他岛屿的到访自动计入。",
      "coordinateMethod": "沿用本应用位于塔希提岛内的地区参考点并取两位小数；表示塔希提岛本岛，不表示整个法属波利尼西亚群岛。",
      "sources": [
        {
          "title": "塔希提官方旅游局 · 塔希提岛",
          "url": "https://www.tahititourisme.com/islands/tahiti/"
        }
      ]
    },
    {
      "id": "poi:JPN:hokkaido",
      "name": "北海道",
      "nameEn": "Hokkaido",
      "aliases": [
        "Hokkaido",
        "北海道岛",
        "北海道島"
      ],
      "countryCode": "JPN",
      "countryCodes": [
        "JPN"
      ],
      "country": "日本",
      "provinceCodes": [],
      "regionIds": [
        "world:JPN:JP-01"
      ],
      "location": "日本 · 北海道",
      "coordinates": [
        142.81,
        43.37
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "北海道",
      "description": "北海道的山地、湖泊与开阔乡野呈现鲜明的季节变化。本条以北海道为整体旅行目的地，地图选岛内一点作为位置参考。",
      "coordinateMethod": "沿用本应用北海道地图中心参考点并取两位小数；不是某座城市或景点入口，也不表示游遍北海道。",
      "sources": [
        {
          "title": "日本国家旅游局 · 北海道",
          "url": "https://www.japan.travel/en/destinations/hokkaido/hokkaido/"
        }
      ]
    },
    {
      "id": "poi:CHN:tibet",
      "name": "西藏",
      "nameEn": "Tibet",
      "aliases": [
        "Tibet",
        "西藏自治区",
        "西藏自治區",
        "Xizang"
      ],
      "countryCode": "CHN",
      "countryCodes": [
        "CHN"
      ],
      "country": "中国",
      "provinceCodes": [
        "540000"
      ],
      "regionIds": [
        "540100"
      ],
      "location": "中国 · 西藏（拉萨代表点）",
      "coordinates": [
        91.13,
        29.65
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "西藏",
      "description": "西藏的旅行目的地分布在广阔的高原上，拉萨的历史建筑是其中一类代表。地图以拉萨为代表点，本条与单独的布达拉宫记录分别保存。",
      "coordinateMethod": "本应用以拉萨市区附近选取广域目的地的近似代表点，保留两位小数；不把布达拉宫或拉萨等同于整个西藏，也不自动合并其他景点记录。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 拉萨布达拉宫历史建筑群（西藏代表景观）",
          "url": "https://whc.unesco.org/en/list/707/"
        }
      ]
    },
    {
      "id": "poi:GRC:acropolis-athens",
      "name": "雅典卫城",
      "nameEn": "Acropolis of Athens",
      "aliases": [
        "Acropolis of Athens",
        "雅典衛城",
        "Acropolis"
      ],
      "countryCode": "GRC",
      "countryCodes": [
        "GRC"
      ],
      "country": "希腊",
      "provinceCodes": [],
      "regionIds": [
        "world:GRC"
      ],
      "location": "希腊 · 雅典",
      "coordinates": [
        23.73,
        37.97
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "雅典卫城",
      "description": "雅典卫城在城中岩丘上保存着古希腊的神庙建筑。帕特农神庙等遗迹共同构成这一历史建筑群。",
      "coordinateMethod": "雅典卫城山丘的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 雅典卫城",
          "url": "https://whc.unesco.org/en/list/404/"
        }
      ]
    },
    {
      "id": "poi:EGY:great-pyramid-giza",
      "name": "大金字塔",
      "nameEn": "Great Pyramid of Giza",
      "aliases": [
        "Great Pyramid of Giza",
        "胡夫金字塔",
        "吉萨大金字塔",
        "吉薩大金字塔",
        "Pyramid of Khufu"
      ],
      "countryCode": "EGY",
      "countryCodes": [
        "EGY"
      ],
      "country": "埃及",
      "provinceCodes": [],
      "regionIds": [
        "world:EGY"
      ],
      "location": "埃及 · 吉萨",
      "coordinates": [
        31.13,
        29.98
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "大金字塔",
      "description": "吉萨的大金字塔也称胡夫金字塔，是古埃及王陵建筑的重要遗存。本条定位于大金字塔本体，不将整片吉萨墓地视为同一个建筑。",
      "coordinateMethod": "吉萨胡夫金字塔附近的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 孟菲斯及其墓地：从吉萨到代赫舒尔的金字塔区域",
          "url": "https://whc.unesco.org/en/list/86/"
        }
      ]
    },
    {
      "id": "poi:GBR:stonehenge",
      "name": "巨石阵",
      "nameEn": "Stonehenge",
      "aliases": [
        "Stonehenge",
        "巨石陣"
      ],
      "countryCode": "GBR",
      "countryCodes": [
        "GBR"
      ],
      "country": "英国",
      "provinceCodes": [],
      "regionIds": [
        "world:GBR:GB-ENG"
      ],
      "location": "英国 · 英格兰 · 威尔特郡",
      "coordinates": [
        -1.83,
        51.18
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "巨石阵",
      "description": "巨石阵以环状石构成著名的史前遗址，周边还保留着古代景观的痕迹。本条记录巨石阵，不将较远的埃夫伯里到访自动合并。",
      "coordinateMethod": "巨石阵石圈附近的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 巨石阵、埃夫伯里及相关遗址",
          "url": "https://whc.unesco.org/en/list/373/"
        }
      ]
    },
    {
      "id": "poi:VAT:vatican-city",
      "name": "梵蒂冈",
      "nameEn": "Vatican City",
      "aliases": [
        "Vatican City",
        "梵蒂岡",
        "Vatican"
      ],
      "countryCode": "VAT",
      "countryCodes": [
        "VAT"
      ],
      "country": "梵蒂冈",
      "provinceCodes": [],
      "regionIds": [
        "world:VAT"
      ],
      "location": "梵蒂冈",
      "coordinates": [
        12.45,
        41.9
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "梵蒂冈",
      "description": "梵蒂冈的圣彼得大教堂、广场与宫殿收藏汇聚了丰富的建筑和艺术遗产。地图以城内一点记录这一目的地的到访。",
      "coordinateMethod": "沿用本应用梵蒂冈地图中心参考坐标并取两位小数；作为城国目的地示意点，不代表某个展馆入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 梵蒂冈城",
          "url": "https://whc.unesco.org/en/list/286/"
        }
      ]
    },
    {
      "id": "poi:ITA:colosseum",
      "name": "罗马竞技场",
      "nameEn": "Colosseum",
      "aliases": [
        "Colosseum",
        "罗马斗兽场",
        "羅馬競技場",
        "羅馬鬥獸場",
        "Flavian Amphitheatre"
      ],
      "countryCode": "ITA",
      "countryCodes": [
        "ITA"
      ],
      "country": "意大利",
      "provinceCodes": [],
      "regionIds": [
        "world:ITA:IT-62"
      ],
      "location": "意大利 · 罗马",
      "coordinates": [
        12.49,
        41.89
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "罗马竞技场",
      "description": "罗马竞技场的椭圆形看台与层叠拱廊保留了古罗马公共建筑的规模。本条记录这座圆形竞技场遗址。",
      "coordinateMethod": "罗马竞技场建筑附近的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "罗马斗兽场考古公园 · 罗马竞技场",
          "url": "https://colosseo.it/en/area/the-colosseum/"
        }
      ]
    },
    {
      "id": "poi:PSX:jerusalem",
      "name": "耶路撒冷",
      "nameEn": "Jerusalem",
      "aliases": [
        "Jerusalem",
        "耶路撒冷旧城",
        "耶路撒冷舊城",
        "Old City of Jerusalem"
      ],
      "countryCode": "PSX",
      "countryCodes": [
        "PSX",
        "ISR"
      ],
      "country": "耶路撒冷",
      "provinceCodes": [],
      "regionIds": [
        "world:PSX",
        "world:ISR"
      ],
      "location": "耶路撒冷 · 旧城代表点",
      "coordinates": [
        35.23,
        31.78
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "耶路撒冷",
      "description": "耶路撒冷旧城的城墙、街巷与宗教建筑保存着多层历史。这里以旧城作为代表，记录这座城市的旅行经历。",
      "coordinateMethod": "旧城附近的近似代表点，保留两位小数。耶路撒冷地位存在争议；PSX、ISR 是与现有地图一致的国家/地区筛选关联，主编码用于内部存储，不表达对主权归属的判断。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 耶路撒冷旧城及其城墙",
          "url": "https://whc.unesco.org/en/list/148/"
        }
      ]
    },
    {
      "id": "poi:SYR:palmyra",
      "name": "巴尔米拉",
      "nameEn": "Palmyra",
      "aliases": [
        "Palmyra",
        "帕尔米拉",
        "巴爾米拉",
        "Tadmor"
      ],
      "countryCode": "SYR",
      "countryCodes": [
        "SYR"
      ],
      "country": "叙利亚",
      "provinceCodes": [],
      "regionIds": [
        "world:SYR"
      ],
      "location": "叙利亚 · 巴尔米拉",
      "coordinates": [
        38.27,
        34.55
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "巴尔米拉",
      "description": "巴尔米拉位于叙利亚沙漠中的绿洲，古代城市遗迹呈现多种文化交流的痕迹。地图以遗址区作为代表。",
      "coordinateMethod": "巴尔米拉古城遗址的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 巴尔米拉遗址",
          "url": "https://whc.unesco.org/en/list/23/"
        }
      ]
    },
    {
      "id": "poi:JOR:jerash",
      "name": "杰拉什",
      "nameEn": "Jerash",
      "aliases": [
        "Jerash",
        "傑拉什",
        "杰拉施",
        "Gerasa"
      ],
      "countryCode": "JOR",
      "countryCodes": [
        "JOR"
      ],
      "country": "约旦",
      "provinceCodes": [],
      "regionIds": [
        "world:JOR"
      ],
      "location": "约旦 · 杰拉什",
      "coordinates": [
        35.89,
        32.28
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "杰拉什",
      "description": "杰拉什的古城遗址保存着柱廊街道、广场与剧场等建筑。地图以考古遗址区记录这处历史目的地。",
      "coordinateMethod": "杰拉什古城遗址的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "约旦旅游局 · 杰拉什",
          "url": "https://international.visitjordan.com/wheretogo/jerash/"
        }
      ]
    },
    {
      "id": "poi:IRQ:babylon",
      "name": "巴比伦",
      "nameEn": "Babylon",
      "aliases": [
        "Babylon",
        "巴比倫",
        "Babylonia"
      ],
      "countryCode": "IRQ",
      "countryCodes": [
        "IRQ"
      ],
      "country": "伊拉克",
      "provinceCodes": [],
      "regionIds": [
        "world:IRQ"
      ],
      "location": "伊拉克 · 巴比伦遗址",
      "coordinates": [
        44.42,
        32.54
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "巴比伦",
      "description": "巴比伦遗址位于伊拉克，城墙、城门与宫殿遗迹记录着古代都城的历史。地图以古城遗址附近作为位置参考。",
      "coordinateMethod": "巴比伦古城遗址的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 巴比伦",
          "url": "https://whc.unesco.org/en/list/278/"
        }
      ]
    },
    {
      "id": "poi:GTM:maya-sites",
      "name": "玛雅遗址群",
      "nameEn": "Maya Archaeological Sites",
      "aliases": [
        "Maya Archaeological Sites",
        "玛雅",
        "瑪雅",
        "瑪雅遺址群",
        "蒂卡尔",
        "Tikal",
        "Maya"
      ],
      "countryCode": "GTM",
      "countryCodes": [
        "GTM"
      ],
      "country": "危地马拉",
      "provinceCodes": [],
      "regionIds": [
        "world:GTM"
      ],
      "location": "中美洲 · 危地马拉蒂卡尔代表点",
      "coordinates": [
        -89.62,
        17.22
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "玛雅遗址群",
      "description": "玛雅遗址分布于中美洲多地，神庙、宫殿与广场保存着古代城市的痕迹。本应用选危地马拉蒂卡尔作为地图代表点；这是应用的定位选择，不表示原书“玛雅”专指蒂卡尔。",
      "coordinateMethod": "本应用自行选取蒂卡尔遗址附近的近似代表点，保留两位小数，以呈现原目录中宽泛的“玛雅”条目；不声称原书指定蒂卡尔，也不把奇琴伊察重复建成第二条。国家/地区关联仅指代表点。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 蒂卡尔国家公园（本应用选定的玛雅遗址代表）",
          "url": "https://whc.unesco.org/en/list/64/"
        }
      ]
    },
    {
      "id": "poi:PER:machu-picchu",
      "name": "马丘比丘",
      "nameEn": "Machu Picchu",
      "aliases": [
        "Machu Picchu",
        "馬丘比丘"
      ],
      "countryCode": "PER",
      "countryCodes": [
        "PER"
      ],
      "country": "秘鲁",
      "provinceCodes": [],
      "regionIds": [
        "world:PER"
      ],
      "location": "秘鲁 · 库斯科地区",
      "coordinates": [
        -72.55,
        -13.16
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "马丘比丘",
      "description": "马丘比丘的石构建筑与梯田依山展开，周边是安第斯山地与森林景观。地图以主要遗址区记录这一印加历史目的地。",
      "coordinateMethod": "马丘比丘主要遗址区的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 马丘比丘历史保护区",
          "url": "https://whc.unesco.org/en/list/274/"
        }
      ]
    },
    {
      "id": "poi:MEX:chichen-itza",
      "name": "奇琴伊察",
      "nameEn": "Chichen Itza",
      "aliases": [
        "Chichen Itza",
        "奇琴伊查",
        "Chichén Itzá"
      ],
      "countryCode": "MEX",
      "countryCodes": [
        "MEX"
      ],
      "country": "墨西哥",
      "provinceCodes": [],
      "regionIds": [
        "world:MEX"
      ],
      "location": "墨西哥 · 尤卡坦半岛",
      "coordinates": [
        -88.57,
        20.68
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "奇琴伊察",
      "description": "奇琴伊察位于尤卡坦半岛，金字塔、柱廊与其他遗迹呈现玛雅及托尔特克文化的交汇。本条单独记录这座遗址。",
      "coordinateMethod": "奇琴伊察主要遗址区的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 奇琴伊察古城",
          "url": "https://whc.unesco.org/en/list/483/"
        }
      ]
    },
    {
      "id": "poi:JOR:petra",
      "name": "佩特拉",
      "nameEn": "Petra",
      "aliases": [
        "Petra",
        "佩特拉古城"
      ],
      "countryCode": "JOR",
      "countryCodes": [
        "JOR"
      ],
      "country": "约旦",
      "provinceCodes": [],
      "regionIds": [
        "world:JOR"
      ],
      "location": "约旦 · 佩特拉",
      "coordinates": [
        35.44,
        30.33
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "佩特拉",
      "description": "佩特拉的建筑一部分砌建、一部分凿入岩壁，峡谷与山体围合着古城遗迹。这里曾是古代商旅道路上的重要节点。",
      "coordinateMethod": "佩特拉主要遗址区的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 佩特拉",
          "url": "https://whc.unesco.org/en/list/326/"
        }
      ]
    },
    {
      "id": "poi:KHM:angkor",
      "name": "吴哥",
      "nameEn": "Angkor",
      "aliases": [
        "Angkor",
        "吴哥窟",
        "吳哥",
        "吳哥窟",
        "Angkor Wat"
      ],
      "countryCode": "KHM",
      "countryCodes": [
        "KHM"
      ],
      "country": "柬埔寨",
      "provinceCodes": [],
      "regionIds": [
        "world:KHM:KH-17"
      ],
      "location": "柬埔寨 · 暹粒省",
      "coordinates": [
        103.87,
        13.41
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "吴哥",
      "description": "吴哥遗址包括吴哥寺、吴哥通等多处高棉历史建筑，石构建筑与林地共同构成广阔的考古景观。地图以吴哥寺附近作为代表。",
      "coordinateMethod": "以吴哥寺附近选取吴哥遗址群的近似代表点，保留两位小数；不表示已游览吴哥考古区的全部寺庙。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 吴哥",
          "url": "https://whc.unesco.org/en/list/668/"
        }
      ]
    },
    {
      "id": "poi:IND:taj-mahal",
      "name": "泰姬陵",
      "nameEn": "Taj Mahal",
      "aliases": [
        "Taj Mahal",
        "泰姬瑪哈陵"
      ],
      "countryCode": "IND",
      "countryCodes": [
        "IND"
      ],
      "country": "印度",
      "provinceCodes": [],
      "regionIds": [
        "world:IND:IN-UP"
      ],
      "location": "印度 · 北方邦 · 阿格拉",
      "coordinates": [
        78.04,
        27.17
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "泰姬陵",
      "description": "泰姬陵位于阿格拉，以白色大理石陵墓与对称布局著称。建筑、水道与庭园共同组成这一纪念性建筑群。",
      "coordinateMethod": "泰姬陵建筑群附近的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 泰姬陵",
          "url": "https://whc.unesco.org/en/list/252/"
        }
      ]
    },
    {
      "id": "poi:SAU:makkah",
      "name": "麦加",
      "nameEn": "Makkah",
      "aliases": [
        "Makkah",
        "麥加",
        "Mecca"
      ],
      "countryCode": "SAU",
      "countryCodes": [
        "SAU"
      ],
      "country": "沙特阿拉伯",
      "provinceCodes": [],
      "regionIds": [
        "world:SAU"
      ],
      "location": "沙特阿拉伯 · 麦加",
      "coordinates": [
        39.83,
        21.42
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "麦加",
      "description": "麦加是伊斯兰教的重要圣城，禁寺与克尔白处于这座城市的宗教生活中心。地图以城市核心区作为记录点。",
      "coordinateMethod": "麦加城市核心区的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "沙特官方旅游网站 · 麦加",
          "url": "https://www.visitsaudi.com/en/destinations/makkah"
        }
      ]
    },
    {
      "id": "poi:EGY:karnak-temple",
      "name": "卡纳克神庙",
      "nameEn": "Karnak Temple",
      "aliases": [
        "Karnak Temple",
        "卡納克神廟",
        "卡尔纳克神庙",
        "Karnak"
      ],
      "countryCode": "EGY",
      "countryCodes": [
        "EGY"
      ],
      "country": "埃及",
      "provinceCodes": [],
      "regionIds": [
        "world:EGY"
      ],
      "location": "埃及 · 卢克索",
      "coordinates": [
        32.66,
        25.72
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "卡纳克神庙",
      "description": "卡纳克神庙群位于卢克索一带，柱厅、塔门与院落记录了古埃及长期的营建历史。本条专门记录卡纳克神庙群。",
      "coordinateMethod": "卡纳克神庙群内的近似代表点，保留两位小数；不把卢克索神庙或帝王谷的到访自动合并。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 底比斯古城及其墓地（卡纳克部分）",
          "url": "https://whc.unesco.org/en/list/87/"
        }
      ]
    },
    {
      "id": "poi:CHL:easter-island",
      "name": "复活节岛",
      "nameEn": "Easter Island",
      "aliases": [
        "Easter Island",
        "復活節島",
        "拉帕努伊",
        "Rapa Nui"
      ],
      "countryCode": "CHL",
      "countryCodes": [
        "CHL"
      ],
      "country": "智利",
      "provinceCodes": [],
      "regionIds": [
        "world:CHL"
      ],
      "location": "智利 · 拉帕努伊（复活节岛）",
      "coordinates": [
        -109.35,
        -27.12
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "复活节岛",
      "description": "复活节岛又名拉帕努伊，摩艾石像与祭祀遗迹形成独特的岛屿文化景观。地图点仅作为岛上旅行目的地的代表。",
      "coordinateMethod": "拉帕努伊岛内的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 拉帕努伊国家公园",
          "url": "https://whc.unesco.org/en/list/715/"
        }
      ]
    },
    {
      "id": "poi:FRA:paris",
      "name": "巴黎",
      "nameEn": "Paris",
      "aliases": [
        "Paris"
      ],
      "countryCode": "FRA",
      "countryCodes": [
        "FRA"
      ],
      "country": "法国",
      "provinceCodes": [],
      "regionIds": [
        "world:FRA:FR-IDF"
      ],
      "location": "法国 · 法兰西岛大区 · 巴黎",
      "coordinates": [
        2.35,
        48.86
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "巴黎",
      "description": "塞纳河串联巴黎的历史建筑、博物馆与广场，城市街道呈现不同年代的空间风貌。本条以巴黎这座城市作为旅行目的地。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 巴黎塞纳河畔",
          "url": "https://whc.unesco.org/en/list/600/"
        }
      ]
    },
    {
      "id": "poi:ITA:venice",
      "name": "威尼斯",
      "nameEn": "Venice",
      "aliases": [
        "Venice",
        "Venezia"
      ],
      "countryCode": "ITA",
      "countryCodes": [
        "ITA"
      ],
      "country": "意大利",
      "provinceCodes": [],
      "regionIds": [
        "world:ITA:IT-34"
      ],
      "location": "意大利 · 威尼托大区 · 威尼斯",
      "coordinates": [
        12.33,
        45.44
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "威尼斯",
      "description": "威尼斯的街巷、水道与建筑分布在潟湖岛屿之间，记录着这座水城的历史。地图以主城作为城市旅行的代表点。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 威尼斯及其潟湖",
          "url": "https://whc.unesco.org/en/list/394/"
        }
      ]
    },
    {
      "id": "poi:ESP:barcelona",
      "name": "巴塞罗那",
      "nameEn": "Barcelona",
      "aliases": [
        "Barcelona",
        "巴塞羅那"
      ],
      "countryCode": "ESP",
      "countryCodes": [
        "ESP"
      ],
      "country": "西班牙",
      "provinceCodes": [],
      "regionIds": [
        "world:ESP:ES-CT"
      ],
      "location": "西班牙 · 加泰罗尼亚 · 巴塞罗那",
      "coordinates": [
        2.18,
        41.39
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "巴塞罗那",
      "description": "巴塞罗那的城市街区中散布着高迪等建筑师留下的作品，建筑、雕塑与公共空间形成鲜明风貌。本条记录这座城市的到访。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 安东尼·高迪的作品（巴塞罗那及周边代表建筑）",
          "url": "https://whc.unesco.org/en/list/320/"
        }
      ]
    },
    {
      "id": "poi:AUT:salzburg",
      "name": "萨尔茨堡",
      "nameEn": "Salzburg",
      "aliases": [
        "Salzburg",
        "薩爾茨堡"
      ],
      "countryCode": "AUT",
      "countryCodes": [
        "AUT"
      ],
      "country": "奥地利",
      "provinceCodes": [],
      "regionIds": [
        "world:AUT"
      ],
      "location": "奥地利 · 萨尔茨堡",
      "coordinates": [
        13.04,
        47.81
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "萨尔茨堡",
      "description": "萨尔茨堡老城保存着中世纪以来的街道与建筑，巴洛克风貌和莫扎特的音乐记忆相连。本条记录城市旅行经历。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 萨尔茨堡历史中心",
          "url": "https://whc.unesco.org/en/list/784/"
        }
      ]
    },
    {
      "id": "poi:GBR:london",
      "name": "伦敦",
      "nameEn": "London",
      "aliases": [
        "London",
        "倫敦"
      ],
      "countryCode": "GBR",
      "countryCodes": [
        "GBR"
      ],
      "country": "英国",
      "provinceCodes": [],
      "regionIds": [
        "world:GBR:GB-ENG"
      ],
      "location": "英国 · 英格兰 · 伦敦",
      "coordinates": [
        -0.12,
        51.5
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "伦敦",
      "description": "伦敦的历史建筑、博物馆、公园与剧场提供了多样的城市体验。地图以市区参考点记录伦敦的到访。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "伦敦官方旅游指南",
          "url": "https://www.visitlondon.com/"
        }
      ]
    },
    {
      "id": "poi:RUS:saint-petersburg",
      "name": "圣彼得堡",
      "nameEn": "Saint Petersburg",
      "aliases": [
        "Saint Petersburg",
        "聖彼得堡",
        "St Petersburg",
        "St. Petersburg"
      ],
      "countryCode": "RUS",
      "countryCodes": [
        "RUS"
      ],
      "country": "俄罗斯",
      "provinceCodes": [],
      "regionIds": [
        "world:RUS:RU-SPE"
      ],
      "location": "俄罗斯 · 圣彼得堡 · 圣彼得堡",
      "coordinates": [
        30.31,
        59.94
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "圣彼得堡",
      "description": "圣彼得堡的运河、桥梁与宫殿共同构成历史城区，建筑风格涵盖巴洛克与新古典主义。本条记录这座城市。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 圣彼得堡历史中心及相关古迹群",
          "url": "https://whc.unesco.org/en/list/540/"
        }
      ]
    },
    {
      "id": "poi:AUS:sydney",
      "name": "悉尼",
      "nameEn": "Sydney",
      "aliases": [
        "Sydney"
      ],
      "countryCode": "AUS",
      "countryCodes": [
        "AUS"
      ],
      "country": "澳大利亚",
      "provinceCodes": [],
      "regionIds": [
        "world:AUS:AU-NSW"
      ],
      "location": "澳大利亚 · 新南威尔士州 · 悉尼",
      "coordinates": [
        151.21,
        -33.87
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "悉尼",
      "description": "悉尼的海港与城市建筑相互映衬，歌剧院是其中鲜明的代表。本条记录悉尼旅行，地图点采用城市资料而非歌剧院入口。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 悉尼歌剧院（城市代表建筑）",
          "url": "https://whc.unesco.org/en/list/166/"
        }
      ]
    },
    {
      "id": "poi:USA:new-york-city",
      "name": "纽约",
      "nameEn": "New York City",
      "aliases": [
        "New York City",
        "纽约市",
        "紐約",
        "New York",
        "NYC"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-NY"
      ],
      "location": "美国 · 纽约州 · 纽约",
      "coordinates": [
        -74,
        40.72
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "纽约",
      "description": "纽约的不同城区各有街区生活与文化体验，从城市漫步到艺术、餐饮，都可以留下旅行记忆。本条记录纽约市的到访。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "纽约市官方旅游机构 · NYC Tourism + Conventions",
          "url": "https://www.nyctourism.com/"
        }
      ]
    },
    {
      "id": "poi:USA:san-francisco",
      "name": "旧金山",
      "nameEn": "San Francisco",
      "aliases": [
        "San Francisco",
        "舊金山",
        "三藩市"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-CA"
      ],
      "location": "美国 · 加利福尼亚州 · 旧金山",
      "coordinates": [
        -122.4,
        37.78
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "旧金山",
      "description": "旧金山的丘陵街道、有轨缆车与海湾景观形成鲜明的城市面貌。本条以城市为目的地，记录在这里的旅行经历。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "加利福尼亚旅游局 · 旧金山",
          "url": "https://www.visitcalifornia.com/places-to-visit/san-francisco/"
        }
      ]
    },
    {
      "id": "poi:USA:new-orleans",
      "name": "新奥尔良",
      "nameEn": "New Orleans",
      "aliases": [
        "New Orleans",
        "新奧爾良"
      ],
      "countryCode": "USA",
      "countryCodes": [
        "USA"
      ],
      "country": "美国",
      "provinceCodes": [],
      "regionIds": [
        "world:USA:US-LA"
      ],
      "location": "美国 · 路易斯安那州 · 新奥尔良",
      "coordinates": [
        -90.09,
        29.97
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "新奥尔良",
      "description": "新奥尔良的音乐、街区与地方饮食构成丰富的城市体验。地图采用市区参考点，记录这座城市的到访。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "新奥尔良官方旅游网站",
          "url": "https://www.neworleans.com/"
        }
      ]
    },
    {
      "id": "poi:BRA:rio-de-janeiro",
      "name": "里约热内卢",
      "nameEn": "Rio de Janeiro",
      "aliases": [
        "Rio de Janeiro",
        "里約熱內盧",
        "里约",
        "Rio"
      ],
      "countryCode": "BRA",
      "countryCodes": [
        "BRA"
      ],
      "country": "巴西",
      "provinceCodes": [],
      "regionIds": [
        "world:BRA:BR-RJ"
      ],
      "location": "巴西 · 里约热内卢州 · 里约热内卢",
      "coordinates": [
        -43.21,
        -22.91
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "里约热内卢",
      "description": "里约热内卢的山地、海湾与城市海岸紧密相接，自然地形塑造了独特的都市景观。本条记录这座城市的旅行。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 里约热内卢：山海之间的卡里奥卡景观",
          "url": "https://whc.unesco.org/en/list/1100/"
        }
      ]
    },
    {
      "id": "poi:MAR:casablanca",
      "name": "卡萨布兰卡",
      "nameEn": "Casablanca",
      "aliases": [
        "Casablanca",
        "卡薩布蘭卡",
        "达尔贝达",
        "Dar el Beida"
      ],
      "countryCode": "MAR",
      "countryCodes": [
        "MAR"
      ],
      "country": "摩洛哥",
      "provinceCodes": [],
      "regionIds": [
        "world:MAR"
      ],
      "location": "摩洛哥 · 卡萨布兰卡",
      "coordinates": [
        -7.62,
        33.59
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "卡萨布兰卡",
      "description": "卡萨布兰卡的老城、装饰艺术建筑与海滨景观展现多重城市面貌，哈桑二世清真寺是其中一处代表。本条记录城市到访。",
      "coordinateMethod": "卡萨布兰卡中心城区的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "摩洛哥国家旅游局 · 卡萨布兰卡",
          "url": "https://www.visitmorocco.com/en/travel/casablanca"
        }
      ]
    },
    {
      "id": "poi:SYR:damascus",
      "name": "大马士革",
      "nameEn": "Damascus",
      "aliases": [
        "Damascus",
        "大馬士革",
        "Dimashq"
      ],
      "countryCode": "SYR",
      "countryCodes": [
        "SYR"
      ],
      "country": "叙利亚",
      "provinceCodes": [],
      "regionIds": [
        "world:SYR"
      ],
      "location": "叙利亚 · 大马士革",
      "coordinates": [
        36.31,
        33.51
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "大马士革",
      "description": "大马士革古城的街巷与历史建筑保留着多个时期的印记，倭马亚大清真寺是重要代表。地图以古城附近作为城市旅行的代表点。",
      "coordinateMethod": "大马士革古城附近的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 大马士革古城",
          "url": "https://whc.unesco.org/en/list/20/"
        }
      ]
    },
    {
      "id": "poi:TUR:istanbul",
      "name": "伊斯坦布尔",
      "nameEn": "Istanbul",
      "aliases": [
        "Istanbul",
        "伊斯坦堡",
        "伊斯坦布爾",
        "İstanbul"
      ],
      "countryCode": "TUR",
      "countryCodes": [
        "TUR"
      ],
      "country": "土耳其",
      "provinceCodes": [],
      "regionIds": [
        "world:TUR"
      ],
      "location": "土耳其 · 伊斯坦布尔",
      "coordinates": [
        28.97,
        41.02
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "伊斯坦布尔",
      "description": "伊斯坦布尔的历史城区汇聚了不同年代的宗教建筑与公共空间，城市与博斯普鲁斯海峡紧密相连。本条记录城市旅行经历。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 伊斯坦布尔历史区",
          "url": "https://whc.unesco.org/en/list/356/"
        }
      ]
    },
    {
      "id": "poi:NPL:pokhara",
      "name": "博卡拉",
      "nameEn": "Pokhara",
      "aliases": [
        "Pokhara",
        "波卡拉"
      ],
      "countryCode": "NPL",
      "countryCodes": [
        "NPL"
      ],
      "country": "尼泊尔",
      "provinceCodes": [],
      "regionIds": [
        "world:NPL"
      ],
      "location": "尼泊尔 · 博卡拉",
      "coordinates": [
        83.98,
        28.21
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "博卡拉",
      "description": "博卡拉的费瓦湖与周围山地构成醒目的湖山景观，湖畔生活和户外活动是常见的旅行体验。本条记录博卡拉这座城市。",
      "coordinateMethod": "博卡拉费瓦湖东侧市区的近似代表示意点，坐标保留两位小数；不是导航入口或完整景观边界。",
      "sources": [
        {
          "title": "尼泊尔旅游局 · 博卡拉",
          "url": "https://ntb.gov.np/pokhara"
        }
      ]
    },
    {
      "id": "poi:JPN:kyoto",
      "name": "京都",
      "nameEn": "Kyoto",
      "aliases": [
        "Kyoto",
        "京都市",
        "Kyōto"
      ],
      "countryCode": "JPN",
      "countryCodes": [
        "JPN"
      ],
      "country": "日本",
      "provinceCodes": [],
      "regionIds": [
        "world:JPN:JP-26"
      ],
      "location": "日本 · 京都府 · 京都",
      "coordinates": [
        135.75,
        35.03
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "京都",
      "description": "京都的寺院、庭园与传统木构建筑保存着古都的文化脉络。本条以京都市为目的地，不把宇治或大津的到访自动合并。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 古京都历史古迹（京都、宇治和大津城市）",
          "url": "https://whc.unesco.org/en/list/688/"
        }
      ]
    },
    {
      "id": "poi:JPN:nara",
      "name": "奈良",
      "nameEn": "Nara",
      "aliases": [
        "Nara",
        "奈良市",
        "Nara-shi"
      ],
      "countryCode": "JPN",
      "countryCodes": [
        "JPN"
      ],
      "country": "日本",
      "provinceCodes": [],
      "regionIds": [
        "world:JPN:JP-29"
      ],
      "location": "日本 · 奈良县 · 奈良",
      "coordinates": [
        135.8,
        34.69
      ],
      "themeIds": [
        "world-most-beautiful-100"
      ],
      "stampLabel": "奈良",
      "description": "奈良的寺院、神社与宫城遗迹呈现日本早期都城的历史。本条以奈良市作为旅行目的地，记录在古都的到访。",
      "coordinateMethod": "沿用本应用已有城市资料的中心参考坐标，取两位小数；作为城市旅行目的地的示意点，不是某个景点入口。",
      "sources": [
        {
          "title": "UNESCO 世界遗产中心 · 古奈良历史遗迹",
          "url": "https://whc.unesco.org/en/list/870/"
        }
      ]
    }
  ]
};
  root.SHANHE_LANDMARK_CATALOG = data;
  if(typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
