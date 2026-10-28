(function(root){
  'use strict';
  // Representative points for a travel journal, not entrances or summit certificates.
  const data = {
    version: 1,
    coordinateNote: '地图上的点表示景区的大致位置，不作为入口导航或登顶证明。',
    themes: [{
      id: 'wuyue',
      name: '五岳',
      description: '从东岳到西岳，收集属于自己的五岳旅行印章。',
      badgeName: '五岳足迹',
      placeIds: ['poi:CHN:taishan', 'poi:CHN:huashan', 'poi:CHN:hengshan-hunan', 'poi:CHN:hengshan-shanxi', 'poi:CHN:songshan']
    }],
    places: [
      {
        id: 'poi:CHN:taishan', name: '泰山', nameEn: 'Mount Tai',
        aliases: ['东岳', '東岳', '岱宗', 'Taishan', 'Tai Shan'],
        countryCode: 'CHN', countryCodes: ['CHN'], country: '中国',
        provinceCodes: ['370000'], regionIds: ['370902'],
        location: '山东 · 泰安', coordinates: [117.1, 36.27],
        themeIds: ['wuyue'], stampLabel: '东岳',
        description: '山路连接古建、石刻与层叠山峦。泰山把悠久的人文记忆留在了自然风景之中。',
        coordinateMethod: 'UNESCO 遗产参考坐标，四舍五入至小数点后两位。',
        sources: [{title: 'UNESCO 世界遗产中心 · 泰山', url: 'https://whc.unesco.org/en/list/437/'}]
      },
      {
        id: 'poi:CHN:huashan', name: '华山', nameEn: 'Mount Hua',
        aliases: ['西岳', '西嶽', '華山', '太华山', 'Huashan', 'Hua Shan'],
        countryCode: 'CHN', countryCodes: ['CHN'], country: '中国',
        provinceCodes: ['610000'], regionIds: ['610582'],
        location: '陕西 · 渭南 · 华阴', coordinates: [110.09, 34.52],
        themeIds: ['wuyue'], stampLabel: '西岳',
        description: '花岗岩山体塑造出陡峭的峰峦。沿途的古道、道观与摩崖石刻，记录着华山的山岳文化。',
        coordinateMethod: '官方公开资料所列核心景区经纬度范围的中点，四舍五入至小数点后两位。',
        sources: [
          {title: '文化和旅游部 · 渭南市华山风景区', url: 'https://sjfw.mct.gov.cn/site/dataservice/culdetails?curId=10&id=35093'},
          {title: '陕西省生态环境厅公开环评 · 华山风景名胜区范围（正文第 134 页）', url: 'https://sthjt.shaanxi.gov.cn/sy/gs/202203/P020241011591564756796.pdf'}
        ]
      },
      {
        id: 'poi:CHN:hengshan-hunan', name: '衡山', nameEn: 'Mount Heng (Hunan)',
        aliases: ['南岳', '南嶽', '南岳衡山', '祝融峰', 'Hengshan Hunan'],
        countryCode: 'CHN', countryCodes: ['CHN'], country: '中国',
        provinceCodes: ['430000'], regionIds: ['430412'],
        location: '湖南 · 衡阳 · 南岳区', coordinates: [112.67, 27.27],
        themeIds: ['wuyue'], stampLabel: '南岳',
        description: '南岳衡山位于湖南，祝融峰周围群峰与森林相依。山地湿润的气候，孕育了丰富的植物景观。',
        coordinateMethod: '湖南省林业局所列南岳衡山自然保护区经纬度范围的中点，四舍五入至小数点后两位。',
        sources: [{title: '湖南省林业局 · 湖南省南岳衡山自然保护区', url: 'https://lyj.hunan.gov.cn/lyj/ztzl/gdzt/zrbhq/201512/t20151227_2587456.html'}]
      },
      {
        id: 'poi:CHN:hengshan-shanxi', name: '恒山', nameEn: 'Mount Heng (Shanxi)',
        aliases: ['北岳', '北嶽', '恆山', '北岳恒山', '天峰岭', 'Hengshan Shanxi'],
        countryCode: 'CHN', countryCodes: ['CHN'], country: '中国',
        provinceCodes: ['140000'], regionIds: ['140225'],
        location: '山西 · 大同 · 浑源', coordinates: [113.72, 39.68],
        themeIds: ['wuyue'], stampLabel: '北岳',
        description: '北岳恒山位于山西浑源，主峰为天峰岭。依山而建的古建筑与峭壁，一起构成了这里的山岳风景。',
        coordinateMethod: '景区内公开野外调查记录坐标，四舍五入至小数点后两位；不是主峰或入口坐标。',
        sources: [
          {title: '浑源县人民政府 · 恒山', url: 'https://www.hunyuan.gov.cn/hyxrmzfz/sqgllssy/202307/073531f44aa04840853ca5c6219bb2d7.shtml'},
          {title: '植物资源与环境学报 · 山西省植物新记录（2026，35(2)：121–124）', url: 'https://zwzy.jib.ac.cn/ClientFile/UploadFile/01cbdc21-5f0b-40e2-81d5-451e268fd92f/File/15%E6%AE%B5%E8%BF%8E%E6%B8%AF.pdf'}
        ]
      },
      {
        id: 'poi:CHN:songshan', name: '嵩山', nameEn: 'Mount Song',
        aliases: ['中岳', '中嶽', '太室山', '少室山', 'Songshan', 'Song Shan'],
        countryCode: 'CHN', countryCodes: ['CHN'], country: '中国',
        provinceCodes: ['410000'], regionIds: ['410185'],
        location: '河南 · 郑州 · 登封', coordinates: [113.06, 34.5],
        themeIds: ['wuyue'], stampLabel: '中岳',
        description: '太室山与少室山构成了嵩山的主体。山间的岩层与人文遗迹，让一次旅行同时遇见地质与历史。',
        coordinateMethod: '登封市政府所列嵩山世界地质公园经纬度范围的中点，四舍五入至小数点后两位。',
        sources: [{title: '登封市人民政府 · 嵩山地质文化', url: 'https://www.dengfeng.gov.cn/dzwh/5263183.jhtml'}]
      }
    ]
  };
  root.SHANHE_LANDMARK_CATALOG = data;
  if(typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
