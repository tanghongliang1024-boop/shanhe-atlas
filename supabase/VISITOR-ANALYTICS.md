# 匿名访问统计

先部署 `migrations/20261101134448_shanhe_anonymous_visits.sql`，再发布网页的 `visitor-analytics.js`、`index.html`、`cloud-ui.js` 和 `style.css`。不修改账号、认证配置、家庭成员或旅行存档。

## 口径

- PV：每次打开或刷新网页一次；前台切地图、编辑记录及登录不新增 PV。重试用同一个事件编号去重，每个浏览器每天最多 120 次。
- UV：选定统计期间内随机浏览器编号去重。不同设备、浏览器、清除网站数据或关闭后重新开启统计会形成新的编号，因此不是实际人数。
- 未登录访客：一次访问首次确认会话时未登录的浏览器。不能据此判断是否曾注册；同一浏览器在不同访问中可能既属于未登录访客，也属于已登录访客，这两类 UV 不应直接相加。
- 状态尚未确认的访问独立列出，不算作未登录。首次确认之后的登录/退出不会追溯改变本次访问的分类。
- 日期来自服务器，按北京时间划分；跨天补充状态仍归到原来的访问日期。多日 UV 直接在整个区间去重，不累加每日 UV。
- 从上线开始积累，不补推历史访问。隐私保护、关闭统计、被拦截的请求、未等到延迟发送就离开等均可能不计数；Origin 检查和 UUID 限额不保证过滤所有自动化或伪造请求。

## 隐私与权限

统计只保存 `event_id`、`visitor_id`、`visited_at`、`visited_day`、`status`，没有账号 ID、邮箱、IP、User-Agent、页面 URL、笔记或足迹。客户端不发送登录凭据、来源页或页面参数。托管平台的常规运行日志独立于这张统计表。

页脚“访问统计”提供说明和关闭开关。关闭停止后续请求并移除该浏览器的统计编号，不删除已记录的汇总依据，不影响地图或存档。重新开启在下次打开或刷新网页生效。DNT=1、GPC=true、存储不可用或安全随机数不可用时不发送统计。

只允许生产 GitHub Pages 网页上报，本地预览、其他域名和 Android App 不上报。统计请求延后发出，失败静默且最多重试一次，地图和登录不等待它。

数据存储在 `shanhe_analytics_private.visits`，RLS 开启，客户端没有查询或直接写表权限。不要把该 schema 加到 Data API 的 exposed schemas。客户端只调用不返回数据的 `public.shanhe_record_visit`；管理员在 Supabase SQL Editor 执行下列查询。没有公开统计查看接口。

## 管理员查询

### 累计数据

```sql
select count(*) as page_views,
       count(distinct visitor_id) as unique_browsers,
       count(distinct visitor_id) filter (where status = 1) as guest_browsers,
       count(distinct visitor_id) filter (where status = 2) as signed_in_browsers,
       count(*) filter (where status = 0) as unresolved_page_views,
       min(visited_at) as first_recorded_at
from shanhe_analytics_private.visits;
```

### 最近 30 天逐日数据

```sql
select visited_day,
       count(*) as page_views,
       count(distinct visitor_id) as unique_browsers,
       count(distinct visitor_id) filter (where status = 1) as guest_browsers,
       count(distinct visitor_id) filter (where status = 2) as signed_in_browsers,
       count(*) filter (where status = 0) as unresolved_page_views
from shanhe_analytics_private.visits
where visited_day >= (current_timestamp at time zone 'Asia/Shanghai')::date - 29
group by visited_day order by visited_day desc;
```

### 最近 7 天去重访客

```sql
select count(*) as page_views,
       count(distinct visitor_id) as unique_browsers,
       count(distinct visitor_id) filter (where status = 1) as guest_browsers
from shanhe_analytics_private.visits
where visited_day >= (current_timestamp at time zone 'Asia/Shanghai')::date - 6;
```

## 验证

`tests/anonymous-visits.test.mjs` 在隔离 PostgreSQL 中验证权限、去重、分类冻结、北京时间跨日、非法输入、120 次限额及已有表不变；前端 `tests/visitor-analytics.test.cjs` 与 `tests/cloud-ui.test.cjs` 验证隐私控制、重试、环境隔离及登录不受统计影响。真实接口验收另以事务回滚避免留下合成访问，网页发布后检查实际页面访问。
