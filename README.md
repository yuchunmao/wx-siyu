# 思雨花卉小程序——线上商城

思雨花卉小程序——线上商城 基于开源项目bee进行修改，感谢原作者的开源分享。


# 本项目使用了下面的组件，在此鸣谢

- [vant-UI库](https://youzan.github.io/vant-weapp/)

- [小程序在线接口-SDK](https://github.com/gooking/apifm-wxapi)

- [api工厂](https://admin.it120.cc)

- [FMUI-轻松活泼-icon](https://www.iconfont.cn/collections/detail?spm=a313x.7781069.0.da5a778a4&cid=17041)

- [小程序HTML解析组件](https://github.com/jin-yufeng/Parser)

- [生成条码和二维码](https://github.com/alsey/wxbarcode)

# 其他优秀开源模板推荐
- [天使童装](https://github.com/EastWorld/wechat-app-mall)   /  [码云镜像](https://gitee.com/javazj/wechat-app-mall)
- [天使童装（uni-app版本）](https://github.com/gooking/uni-app-mall)  /   [码云镜像](https://gitee.com/javazj/uni-app-mall)
- [简约精品商城（uni-app版本）](https://github.com/gooking/uni-app--mini-mall)  /   [码云镜像](https://gitee.com/javazj/uni-app--mini-mall)
- [舔果果小铺（升级版）](https://github.com/gooking/TianguoguoXiaopu)
- [面馆风格小程序](https://gitee.com/javazj/noodle_shop_procedures)
- [AI名片](https://github.com/gooking/visitingCard)
- [仿海底捞订座排队 (uni-app)](https://github.com/gooking/dingzuopaidui)  /   [码云镜像](https://gitee.com/javazj/dingzuopaidui)
- [H5版本商城/餐饮](https://github.com/gooking/vueMinishop)  /  [码云镜像](https://gitee.com/javazj/vueMinishop)
- [餐饮点餐](https://github.com/woniudiancang/bee)  / [码云镜像](https://gitee.com/woniudiancang/bee)
- [企业微展](https://github.com/gooking/qiyeweizan)  / [码云镜像](https://gitee.com/javazj/qiyeweizan)
- [无人棋牌室](https://github.com/gooking/wurenqipai)  / [码云镜像](https://gitee.com/javazj/wurenqipai)
- [酒店客房服务小程序](https://github.com/gooking/hotelRoomService)  / [码云镜像](https://gitee.com/javazj/hotelRoomService)

# 使用教程
## 注册开通小程序账号
https://mp.weixin.qq.com/
根据自己的实际情况选择 “企业”、“个体工商户”身份，注册小程序账号，商城类小程序不支持个人用户上线，所以一定要选择企业或者个体户，获得你自己小程序的 appid 和 secret 信息，保存好，下面会用到：
- [如何查看小程序的AppID和AppSecret](https://jingyan.baidu.com/article/642c9d340305e3644a46f795.html)
你需要设置小程序的合法域名，否则开发工具上运行正常，手机访问的时候将看不到数据
- [设置合法服务器域名](https://www.yuque.com/apifm/doc/tvpou9)
## 注册开通后台账号
https://admin.it120.cc/
免费注册开通新后台后登录，登录后的首页，请记下你的专属域名，后面会用到
左侧菜单 “工厂设置” --> “数据克隆” --> “将别人的数据克隆给我”
对方商户ID填写 27
点击 “立即克隆”，克隆成功后，F5 刷新一下后台
## 配置小程序APPID/SECRET
左侧菜单，微信设置，填写配置上一步获得的 appid 和 secret
这一步很重要！！！
如果没有正确配置，下面步骤中打开小程序将无法连接你的后台
## 配置微信支付
左侧菜单，系统设置 -->  在线支付配置，填写您自己的微信支付的信息
## 下载安装开发工具
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
## 运行小程序看效果
双击运行第一步安装的小程序开发工具，打开看效果：

<img src="https://dcdn.it120.cc/yuque/0/2019/png/572726/1575349127431-00ff2059-dd5e-4e4b-99a7-e1d605db02c7.png?x-oss-process=image%2Fresize%2Cw_1500 " width="200px">

导入项目这里，目录选择你 “第二步” 中下载并加压的小程序代码所在目录

APPID 务必要改成你自己的小程序的 APPID
APPID 务必要改成你自己的小程序的 APPID
APPID 务必要改成你自己的小程序的 APPID

然后点击导入按钮

- [如何查看小程序的AppID和AppSecret](https://jingyan.baidu.com/article/642c9d340305e3644a46f795.html)

## 配置对接你自己的后台
在开发工具中 config.js 中的subDomain 改成你自己专属域名， ctrl + s 保存

<img src="https://dcdn.it120.cc/yuque/0/2020/png/572726/1581236703094-ce5c7f32-c60d-4e1b-bacb-21439e1d2721.png?x-oss-process=image%2Fresize%2Cw_1500 " width="200px">

- [如何查看自己的subDomain](https://www.yuque.com/apifm/doc/qr6l4m)

# 配置说明

## 如何修改小程序首页标题

登录后台，左侧菜单 “系统设置” --> “系统参数” ，添加一个文本类型的参数： mallName （注意大小写），小程序即可显示你后台填的名称

## 根据选择的不同门店，区分显示商品（只显示当前门店的商品）

登录后台，左侧菜单 “系统设置” --> “系统参数” ，添加一个开关类型的参数： shop_goods_split，开启为区分，关闭为不区分

## 如何设置服务范围（多少公里）

后台 “商场管理” --> “门店管理” ，编辑门店，服务距离处，填写你希望配送的距离即可

## 如何显示销量

商品列表接口、商品详情接口，都会返回商品的销量数据，分别是 numberOrders 和 numberSells 两个字段，你可以在界面上任何希望显示销量的地方，进行展示即可

- numberOrders 订单数量
- numberSells 商品数量

假如说用户下了一个订单一次性购买10份这个商品，那么 numberOrders = 1 ，numberSells = 10

## 如何区分门店显示商品

后台左侧菜单“系统设置” -> “系统参数”，增加一个开关类型的参数: shop_goods_split

开启则只会显示当前门店的商品，关闭则显示所有门店的商品

## 在线订座如何配置

1. 左侧菜单 “预约报名” --> “项目设置” ，添加一个项目，添加完以后会得到一个编号
2. 左侧菜单 “系统设置” --> “系统参数”， 修改编号为 `zxdz` 的参数，将你的编号填进去即可

## 配置达达配送

1. [如何对接达达配送，先按这个教程完成配置](https://www.yuque.com/apifm/doc/gxk08t)
2. 后台 “商城管理” --> “门店管理”， 编辑，门店编号填写你达达对应的门店编号，生鲜配送输入框填写 `dada`

# 常见问题

## 无法登陆 / 无法获取 openid

1. 请检查 config.js 文件中的 subDomain 是否已经修改成你自己的专属域名了
    
    [如何查看自己的subDomain](https://www.yuque.com/apifm/doc/qr6l4m)

2. 确保下面3个地方的 appID 你填的是一样的

    - 登录你的小程序商户后台（https://mp.weixin.qq.com）左侧菜单 “开发” --> “开发设置” 中的 appid
    - 点击你的小程序开发工具 右上角 的“详情” --> “基本信息” 中的 appid
    - 登录你的 api工厂 后台（https://admin.it120.cc），左侧菜单微信设置中的 appid

## 获取手机号码失败，提示没权限

https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html

官方文档有说明，获取手机号码的前提条件是：非个人开发者，且完成了认证的小程序开放（不包含海外主体）

## wx.getLocation 改为 wx.getFuzzyLocation (getLocation的接口权限太难申请了)

微信申请 getLocation 接口的审核比较严格，可能比较难申请到这个接口，可以用 wx.getFuzzyLocation 来代替： https://developers.weixin.qq.com/miniprogram/dev/api/location/wx.getFuzzyLocation.html


开发工具，全局替换以下代码：

需要替换3次

`scope.userLocation` 替换为 `scope.userFuzzyLocation`

如图：


<img src="https://dcdn.it120.cc/yuque/0/2023/png/572726/1680937230066-f31f9661-7c15-4ffe-86b1-9d70ce5a6062.png">


再全局替换代码：

`wx.getLocation` 替换为 `wx.getFuzzyLocation`

再全局替换代码：

`"getLocation"` 替换为 `"getFuzzyLocation"`

## 小程序订单中心path 怎么填

请填写 `pages/all-orders/index`

## 微信支付MA授权(appid和mch_id不匹配)

[微信支付MA授权(appid和mch_id不匹配)](https://www.yuque.com/apifm/doc/zrui8q)
