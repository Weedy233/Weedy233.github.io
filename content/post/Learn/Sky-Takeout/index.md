---
title: 从苍穹外卖的 SSM 架构笔记，以及开发杂谈
date: 2025-11-10
image: logo.jpg
categories:
  - 后端
  - 就业
---
## 前言

最近正式开始学习后端开发，因为在 61b 里面已经有了 java 语法基础，所以直接开了苍穹外卖来上手

有一说一，因为这个项目的知名度过高，以至于每年各公司的 HR 都会收到上百份写着**编写过苍穹外卖项目**的简历，几乎成了扣分项

但是也侧面印证黑马这个课程的含金量， ~~以及高校计算机教育的拉胯，~~ 作为一个后端程序员初步项目还是不错的

所以这里会记载一些个人在学习过程中的感悟总结，风格会比较散 ~~（梦到哪句说哪句）~~

我的后端代码实现都上传到了[这个仓库中](https://github.com/Weedy233/Sky-Takeout-Backend)

## 技术栈

- 核心： Spring Boot
- 持久层：MySQL, MyBatis
- 中间件/工具： Redis, Nginx(反代), WebSocket(消息推送), OpenAPI/Knife4j
- 配套框架：Vue(管理端前端), 微信小程序(用户端前端)
- 开发环境：JDK 17 (Windows 11 x64), VSCode, Maven

## 项目内容

### 项目分词结构图

```goat
    +---------------+
    |    Client     |
    | (Web/Applet)  |
    +-------+-------+
            |
            | HTTP Request
            v
    +-------+-------+
    |  Controller   | <-- 1. Receive Request & Parse DTO
    +-------+-------+
            |
            v
    +-------+-------+     +-------------+
    |    Service    | <-> |    Redis    |
    +-------+-------+     +-------------+
    | Business Logic|      (Cache Layer)
    +-------+-------+
            |
            v
    +-------+-------+
    |    Mapper     | <-- 2. Data Access (MyBatis)
    +-------+-------+
            |
            | SQL
            v
    +-------+-------+
    |     MySQL     | <-- 3. Persistent Storage
    +---------------+
```

该项目涉及到的处理流程：

1. 管理端/用户端通过 Http 请求向 SpringBoot 的 Controller 层发起请求
2. Interceptor 拦截请求，当请求为动态方法，且 url 不在排除列表中(eg: 如员工/顾客登录接口，营业状态查询接口)，检验 token。校验成功则放行，否则返回 401
3. 请求以 Query, Path Variables 或 Request Body 的方式传值进来，由 Controller 层接收
4. Controller 在后端控制台记录日志，并调用 Service 层，
5. Service 层处理主要逻辑，并在需要时调用 Redis 模板以及 Mapper 层，最后将结果返回至 Controller 层
6. Controller 层使用 `Result.success(...)` 统一返回成功结果

### Maven 结构

整个后端使用 maven 作为构建系统，由三个部分组成：

- `sky-common`: 工具，异常，常量定义等通用资源
- `sky-pojo`: 实体以及相关的 VO，DTO
- `sky-server`: 项目的逻辑部分，负责相应请求，与数据库交互等

每个子项目有独立的 `pom.xml`，用于配置依赖
主项目的 `pom.xml` 负责将子项目组合成整体，编译打包

## 开发历程

### 课程安排

1. day1: 介绍，设置管理端前端，导入接口文档
2. day2: 开发员管理端工管理、商品分类管理部分
3. day3: 开发菜品部分，利用 AOP 完成公共字段填充
4. day4: 开发套餐部分
5. day5: 上手 Redis 使用，用其存储店铺营业状态
6. day6: 上手微信小程序开发，设置用户端前端，完善微信用户登录功能
7. day7: 使用 Spring Cache 优化菜品数据访问，开发用户端购物车部分
8. day8: 开发用户端地址薄，下单功能
9. day9: 开发管理端用户端订单操作部分
10. day10: 使用 Spring Task 配置定时任务，自动处理超时/未完成订单。使用 WebSocket 实现来单和催单提醒
11. day11: 开发管理端数据统计功能
12. day12: 开发管理端数据统计导出 excel 功能

### 个人体验

黑马给课程的后端安排了 12 天的课时，个人感受如果每天能投入 8-10 个小时全力开发（不借助 AI 填代码）应该能在这个时间内完成。
但是由于学校以及个人事务，前后总共花了三十多天才全部写完，sad...

![金句](image/index/1764688425673.png)

## 问题与解决

### 工程/代码相关

#### 依赖注入

太长不看（AI生成版）：Spring 容器基于反射机制（Reflection）与控制反转（IoC）原理，全权接管了 Bean 的生命周期管理与依赖关系的动态装配，实现了组件间的彻底解耦。

- 问题：传统上需要使用Service, Mapper 等对象时，必须每次手动 new, 浪费资源且麻烦
- 解决：Spring 通过两个手段来解决：
  1. IoC (Inversion of Control，控制反转)：创建对象的控制权从程序员手里交给了 Spring 容器。你不再 new 对象，而是由容器在启动时统一创建并管理这些对象（Bean），在这个项目中，我们通常使用 `@Autowired` 注解来实现
  2. DI (Dependency Injection，依赖注入)：这是 IoC 的具体实现方式。当 Controller 声明“我需要一个 Service”时，Spring 容器会自动把已经在内存里创建好的 Service 对象“注入”（赋值）到 Controller 的变量中

#### 公共字段填充

- 问题：公共字段 `create_time/user...` 赋值代码重复繁琐
- 解决：
  1. 通过编写 `AutoFill.java` 使用反射获取 Setter 方法，
  2. 在需要使用的 Mapper 接口加上 `@AutoFill(value = OperationType.<INSERT/UPDATE>)` 注解，
  3. 调用时自动实现公共字段自动填充

#### 声明式事务

- 问题：当遇到需要操作多个表的任务时，如用户下单时先往 `orders` 表插入一条数据，然后往 `order_detail` 中插入多条数据。这时如果操作在第二步遇到错误，无法完成，会导致数据“缺胳膊少腿”
- 解决：利用事务注解 `@Transactional` 将操作原子化，使之不可分割。当在操作中途遇到错误时，会回滚到操作开始前的状态。

#### 微信支付 mock

- 问题：个人认证小程序无法使用支付功能，故无法完成需要订单提交功能的软件测试
- 解决：
  编写 mock 逻辑，当在小程序端点击付款，且配置的微信支付相关 token 为 *** 时，自动触发支付回调方法，完成订单付款
  我的代码实现可见[此处](https://github.com/Weedy233/Sky-Takeout-Backend/blob/706cd78afa75535203f670e6fc24bc6e3a1c905e/sky-common/src/main/java/com/sky/utils/WeChatPayUtil.java#L236)

### 业务相关

#### 菜品缓存优化

- 问题：微信用户端查询分类下菜品时需频繁调用 Mapper 查询数据库，造成性能瓶颈
- 解决：
  1. 在 `config\` 中注册 redis 模板对象，并在 `SkyApplication.java` 中添加 `@EnableCaching` 注解
  2. 对查询方法使用 `@Cacheable` 注解，对修改或删除方法使用 `@CacheEvict` 注解
  3. 在方法中添加完成对 redis 的获取或更新删除操作
  4. （可选）配置 redis 序列化器

- 思考：课程中的默认方案是

```java
@Bean
public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
    log.info("开始创建 redis 模板对象...");
    RedisTemplate<String, Object> redisTemplate = new RedisTemplate<String, Object>();

    redisTemplate.setConnectionFactory(redisConnectionFactory);

    redisTemplate.setKeySerializer(new StringRedisSerializer());
    return redisTemplate;
}
```

这种方法非常简单粗暴，虽然不会报错和产生读取问题，但是使得存入 redis 的对象以 java 二进制形式呈现，不便于查看与跨平台。应该为每个类配置单独的序列化器以 json 形式存入

以及项目提供的 Windows Redis 实在是太远古了，已经多年没有维护，严重跟不上时代。建议使用 WSL 搭配 Valkey / Redis 提供缓存服务

![Valkey 的 Systemctl status](image/index/1764426204977.png)

#### 订单自动任务

- 问题：当用户端下单但迟迟不付款时，应当自动取消。以及当每天有积压的已派送但未完成的订单应统一处理
- 解决：
  1. 在 `SkyApplication.java` 中添加 `@EnableScheduling` 注解
  2. 创建 `com.sky.task` 包，创建 `OrderTask` 类，一个任务对应一个方法
  3. 对方法使用 `@Scheduled(cron = "0 * * * * ?")` 注解（可以在 [这个网站](https://cron.qqe2.com/)可视化编辑 cron 表达式）
     项目中选择每分钟检查一次超时未付款订单，并将其取消。每天凌晨 1 点将已派送但未完成订单统一完成，代码实现可见 [OrderTask.java](https://github.com/Weedy233/Sky-Takeout-Backend/blob/706cd78afa75535203f670e6fc24bc6e3a1c905e/sky-server/src/main/java/com/sky/task/OrderTask.java#L22)
