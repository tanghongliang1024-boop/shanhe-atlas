# 台湾县市地图数据

本应用将台湾细分为 22 个县市，分别保存插旗、着色、首次到访日期和旅行记忆。包含澎湖县、金门县、连江县。

## 来源与授权

- 原始提供者：內政部／內政部國土測繪中心。
- 原始数据：[直轄市、縣市界線（TWD97 經緯度）](https://data.gov.tw/dataset/7442)，版本 COUNTY_MOI_1140318，日期 2025-03-18。
- 网页简化数据：[plotdb/pdmaptw v2.4.0](https://github.com/plotdb/pdmaptw/tree/v2.4.0)。
- 下载：[county-2025-03-18.geojson](https://github.com/plotdb/pdmaptw/releases/download/v2.4.0/county-2025-03-18.geojson)。
- 授权：[政府資料開放授權條款－第 1 版](https://data.gov.tw/license)。

署名：內政部／內政部國土測繪中心；边界简化与格式转换来自 plotdb/pdmaptw；山河足迹适配网页显示和旅行记录。

## 网页处理

保留实际经纬度位置，显示简体名称并支持繁体名称搜索。边界与合并外轮廓打包在 taiwan-counties.json 中。小旗位置选在每个县市的主要多边形内部。tw- 开头的 ID 仅用于应用记录。

此版本为网页显示简化数据，部分极小岛屿可能省略，不能用于精密边界测量。
