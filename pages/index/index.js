const APP = getApp()
const AUTH = require('../../utils/auth')
const WXAPI = require('apifm-wxapi')
const {categorizeList, bannerList, goodsList, goodsDetail} = require("./data");

Page({
    data: {
        page: 1,
        showCartPop: false, // 是否显示购物车列表
        showGoodsDetailPOP: false, // 是否显示商品详情
        showCouponPop: false, // 是否弹出优惠券领取提示
        shopIsOpened: false, // 是否营业

        share_goods_id: undefined,
        share_pingtuan_open_id: undefined,
        lijipingtuanbuy: false,
        pingtuan_open_id: undefined
    },
    onLoad: function (e) {
        AUTH.checkHasLogined().then(isLogin => {
            if (isLogin) {
                AUTH.bindSeller()
            } else {
                AUTH.authorize().then(res => {
                    AUTH.bindSeller()
                })
            }
        })
        // 获取商品分类
        this.categories()
        // 获取首页条幅
        this.getTitle()
        // 获取首页轮播图
        this.banners()
    },
    onShow: function () {
        this.shippingCarInfo()
        const refreshIndex = wx.getStorageSync('refreshIndex')
        if (refreshIndex) {
            // this.getshopInfo()
            wx.removeStorageSync('refreshIndex')
        }
    },
    async cyTableToken(tableId, key) {
        const res = await WXAPI.cyTableToken(tableId, key)
        if (res.code != 0) {
            wx.showModal({
                title: '桌码异常',
                content: res.msg,
                showCancel: false
            })
            return
        }
        wx.hideTabBar()
        wx.setStorageSync('uid', res.data.uid)
        wx.setStorageSync('token', res.data.token)
    },
    async fetchShops(latitude, longitude, kw) {
        const res = await WXAPI.fetchShops({
            curlatitude: latitude,
            curlongitude: longitude,
            nameLike: kw,
            pageSize: 1
        })
        if (res.code == 0) {
            res.data.forEach(ele => {
                ele.distance = ele.distance.toFixed(1) // 距离保留3位小数
            })
            this.setData({
                shopInfo: res.data[0],
                shopIsOpened: this.checkIsOpened(res.data[0].openingHours)
            })
            wx.setStorageSync('shopInfo', res.data[0])
            await this.getGoodsList()
        }
    },
    async _showCouponPop() {
        const a = wx.getStorageSync('has_pop_coupons')
        if (a) {
            return
        }
        // 检测是否需要弹出优惠券的福袋
        const res = await WXAPI.coupons({
            token: wx.getStorageSync('token')
        })
        if (res.code == 0) {
            this.data.showCouponPop = true
            wx.setStorageSync('has_pop_coupons', true)
        } else {
            this.data.showCouponPop = false
        }
        this.setData({
            showCouponPop: this.data.showCouponPop
        })
    },
    // 获取分类
    async categories() {
        const res = categorizeList
        if (res.code !== 0) {
            wx.showToast({
                title: res.msg,
                icon: 'none'
            })
            return
        }
        this.setData({
            page: 1,
            categories: res.data,
            categorySelected: res.data[0]
        })
        await this.getGoodsList()
    },
    // 通过所选分类获取商品列表
    async getGoodsList() {
        wx.showLoading({
            title: '',
        })
        const list = goodsList.filter(it => it.categoryId === this.data.categorySelected.id)
        wx.hideLoading()
        list.forEach(ele => {
            if (!ele.characteristic) {
                ele.characteristic = '清凉一夏' // 給一个默认的商品特色描述
            }
        })
        if (this.data.page === 1) {
            this.setData({
                goods: list
            })
        } else {
            // todo 分页加载
            this.setData({
                goods: list.concat([])
            })
        }
    },
    // 滚动到最底部，加载商品列表
    _onReachBottom() {
        this.data.page++
        this.getGoodsList()
    },
    categoryClick(e) {
        const index = e.currentTarget.dataset.idx
        const categorySelected = this.data.categories[index]
        this.setData({
            page: 1,
            categorySelected,
            scrolltop: 0
        })
        this.getGoodsList()
    },
    showCartPop() {
        if (this.data.scanDining) {
            // 扫码点餐，前往购物车页面
            wx.navigateTo({
                url: '/pages/cart/index',
            })
        } else {
            this.setData({
                showCartPop: !this.data.showCartPop
            })
        }
    },
    hideCartPop() {
        this.setData({
            showCartPop: false
        })
    },
    async addCart1(e) {
        const token = wx.getStorageSync('token')
        const index = e.currentTarget.dataset.idx
        const item = this.data.goods[index]
        wx.showLoading({
            title: '',
        })
        let number = item.minBuyNumber // 加入购物车的数量
        if (this.data.shippingCarInfo && this.data.shippingCarInfo.items) {
            const goods = this.data.shippingCarInfo.items.find(ele => {
                return ele.goodsId == item.id
            })
            console.log(goods);
            if (goods) {
                number = 1
            }
        }
        const res = await WXAPI.shippingCarInfoAddItem(token, item.id, number, [])
        wx.hideLoading()
        if (res.code == 2000) {
            AUTH.login(this)
            return
        }
        if (res.code != 0) {
            wx.showToast({
                title: res.msg,
                icon: 'none'
            })
            return
        }
        this.shippingCarInfo()
    },
    async skuClick(e) {
        const index1 = e.currentTarget.dataset.idx1
        const index2 = e.currentTarget.dataset.idx2
        const curGoodsMap = this.data.curGoodsMap
        curGoodsMap.properties[index1].childsCurGoods.forEach(ele => {
            ele.selected = false
        })
        curGoodsMap.properties[index1].childsCurGoods[index2].selected = true
        this.setData({
            curGoodsMap
        })
        this.calculateGoodsPrice()
    },
    async calculateGoodsPrice() {
        const curGoodsMap = this.data.curGoodsMap
        // 计算最终的商品价格
        let price = curGoodsMap.basicInfo.minPrice
        let originalPrice = curGoodsMap.basicInfo.originalPrice
        let totalScoreToPay = curGoodsMap.basicInfo.minScore
        let buyNumMax = curGoodsMap.basicInfo.stores
        let buyNumber = curGoodsMap.basicInfo.minBuyNumber
        if (this.data.shopType == 'toPingtuan') {
            price = curGoodsMap.basicInfo.pingtuanPrice
        }
        // 计算 sku 价格
        const canSubmit = this.skuCanSubmit()
        if (canSubmit) {
            let propertyChildIds = "";
            if (curGoodsMap.properties) {
                curGoodsMap.properties.forEach(big => {
                    const small = big.childsCurGoods.find(ele => {
                        return ele.selected
                    })
                    propertyChildIds = propertyChildIds + big.id + ":" + small.id + ","
                })
            }
            const res = await WXAPI.goodsPrice(curGoodsMap.basicInfo.id, propertyChildIds)
            if (res.code == 0) {
                price = res.data.price
                if (this.data.shopType == 'toPingtuan') {
                    price = res.data.pingtuanPrice
                }
                originalPrice = res.data.originalPrice
                totalScoreToPay = res.data.score
                buyNumMax = res.data.stores
            }
        }
        // 计算时段定价的价格
        if (this.data.goodsTimesSchedule) {
            const a = this.data.goodsTimesSchedule.find(ele => ele.active)
            if (a) {
                const b = a.items.find(ele => ele.active)
                if (b) {
                    price = b.price
                    buyNumMax = b.stores
                }
            }
        }
        // 计算配件价格
        if (this.data.goodsAddition) {
            this.data.goodsAddition.forEach(big => {
                big.items.forEach(small => {
                    if (small.active) {
                        price = (price * 100 + small.price * 100) / 100
                    }
                })
            })
        }
        curGoodsMap.price = price
        this.setData({
            curGoodsMap,
            buyNumMax
        });
    },
    async skuClick2(e) {
        const propertyindex = e.currentTarget.dataset.idx1
        const propertychildindex = e.currentTarget.dataset.idx2

        const goodsAddition = this.data.goodsAddition
        const property = goodsAddition[propertyindex]
        const child = property.items[propertychildindex]
        if (child.active) {
            // 该操作为取消选择
            child.active = false
            this.setData({
                goodsAddition
            })
            this.calculateGoodsPrice()
            return
        }
        // 单选配件取消所有子栏目选中状态
        if (property.type == 0) {
            property.items.forEach(child => {
                child.active = false
            })
        }
        // 设置当前选中状态
        child.active = true
        this.setData({
            goodsAddition
        })
        this.calculateGoodsPrice()
    },
    skuCanSubmit() {
        const curGoodsMap = this.data.curGoodsMap
        let canSubmit = true
        if (curGoodsMap.properties) {
            curGoodsMap.properties.forEach(big => {
                const small = big.childsCurGoods.find(ele => {
                    return ele.selected
                })
                if (!small) {
                    canSubmit = false
                }
            })
        }
        if (this.data.goodsTimesSchedule) {
            const a = this.data.goodsTimesSchedule.find(ele => ele.active)
            if (!a) {
                canSubmit = false
            } else {
                const b = a.items.find(ele => ele.active)
                if (!b) {
                    canSubmit = false
                }
            }
        }
        return canSubmit
    },
    additionCanSubmit() {
        const curGoodsMap = this.data.curGoodsMap
        let canSubmit = true
        if (curGoodsMap.basicInfo.hasAddition) {
            this.data.goodsAddition.forEach(ele => {
                if (ele.required) {
                    const a = ele.items.find(item => {
                        return item.active
                    })
                    if (!a) {
                        canSubmit = false
                    }
                }
            })
        }
        return canSubmit
    },
    // 加入购物车
    async addCartByDetail() {
        // todo 暂时使用本地存储存储数据，等待后端
        const token = wx.getStorageSync('token')
        const curGoodsMap = this.data.curGoodsMap
        wx.showLoading({
            title: '',
        })
        const orderList = wx.getStorageSync('orderList') || []
        const order = orderList.find(it => it.goodsId === curGoodsMap.goodsDetail.id)
        // 有相同商品订单，则进行数量的增减，否则新增订单
        if (order) {
            order.number += curGoodsMap.number
        } else {
            orderList.push({
                goodsId: curGoodsMap.goodsDetail.id,
                number: curGoodsMap.number
            })
        }
        wx.setStorageSync('orderList', orderList)
        wx.hideLoading()
        this.hideGoodsDetailPOP()
    },
    async cartStepChange(e) {
        const token = wx.getStorageSync('token')
        const index = e.currentTarget.dataset.idx
        const item = this.data.shippingCarInfo.items[index]
        if (e.detail < 1) {
            // 删除商品
            wx.showLoading({
                title: '',
            })
            const res = await WXAPI.shippingCarInfoRemoveItem(token, item.key)
            wx.hideLoading()
            if (res.code == 700) {
                this.setData({
                    shippingCarInfo: null,
                    showCartPop: false
                })
            } else if (res.code == 0) {
                this.setData({
                    shippingCarInfo: res.data
                })
            } else {
                this.setData({
                    shippingCarInfo: null,
                    showCartPop: false
                })
            }
        } else {
            // 修改数量
            wx.showLoading({
                title: '',
            })
            const res = await WXAPI.shippingCarInfoModifyNumber(token, item.key, e.detail)
            wx.hideLoading()
            if (res.code != 0) {
                wx.showToast({
                    title: res.msg,
                    icon: 'none'
                })
                return
            }
            this.shippingCarInfo()
        }
    },
    // 选择商品数量
    goodsStepChange(e) {
        const curGoodsMap = this.data.curGoodsMap
        curGoodsMap.number = e.detail
        curGoodsMap.totalPrice = curGoodsMap.goodsDetail.price * e.detail
        this.setData({
            curGoodsMap
        })
    },
    async clearCart() {
        wx.showLoading({
            title: '',
        })
        const res = await WXAPI.shippingCarInfoRemoveAll(wx.getStorageSync('token'))
        wx.hideLoading()
        if (res.code != 0) {
            wx.showToast({
                title: res.msg,
                icon: 'none'
            })
            return
        }
        this.shippingCarInfo()
    },
    async showGoodsDetailPOP(e) {
        const index = e.currentTarget.dataset.idx
        const goodsId = this.data.goods[index].id
        this._showGoodsDetailPOP(goodsId)
        this.goodsAddition(goodsId)
        this._goodsTimesSchedule(goodsId)
    },
    async _showGoodsDetailPOP(goodsId) {
        wx.hideTabBar()
        const _data = {
            curGoodsMap: {
                number: 1,
                totalPrice: goodsDetail.price,
                goodsDetail
            },
            lijipingtuanbuy: false
        }
        _data.showGoodsDetailPOP = true
        this.setData(_data)

        // const token = wx.getStorageSync('token')
        const res = await WXAPI.goodsDetail(goodsId)
        // if (res.code != 0) {
        //     wx.showToast({
        //         title: res.msg,
        //         icon: 'none'
        //     })
        //     return
        // }
        // wx.hideTabBar()
        // res.data.price = res.data.basicInfo.minPrice
        // res.data.number = res.data.basicInfo.minBuyNumber
        // const _data = {
        //     curGoodsMap: res.data,
        //     pingtuan_open_id: null,
        //     lijipingtuanbuy: false
        // }
        // _data.showGoodsDetailPOP = true
        //
        // this.setData(_data)
    },
    hideGoodsDetailPOP() {
        this.setData({
            showGoodsDetailPOP: false
        })
        wx.showTabBar()
    },
    goPay() {
        if (this.data.scanDining) {
            // 扫码点餐，前往购物车
            wx.navigateTo({
                url: '/pages/cart/index',
            })
        } else {
            wx.navigateTo({
                url: '/pages/pay/index',
            })
        }
    },
    onShareAppMessage: function () {
        let uid = wx.getStorageSync('uid')
        if (!uid) {
            uid = ''
        }
        let path = '/pages/index/index?inviter_id=' + uid
        if (this.data.pingtuan_open_id) {
            path = path + '&share_goods_id=' + this.data.curGoodsMap.basicInfo.id + '&share_pingtuan_open_id=' + this.data.pingtuan_open_id
        }
        return {
            title: '"' + wx.getStorageSync('mallName') + '" ' + wx.getStorageSync('share_profile'),
            path
        }
    },
    couponOverlayClick() {
        this.setData({
            showCouponPop: false
        })
    },
    couponImageClick() {
        wx.navigateTo({
            url: '/pages/coupons/index',
        })
    },
    // 获取首页条幅
    async getTitle() {
        this.setData({
            title: '条幅，随便写点什么'
        })

    },
    goNotice(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/notice/detail?id=' + id,
        })
    },
    async banners() {
        const res = bannerList
        if (res.code === 0) {
            this.setData({
                banners: res.data
            })
        }
    },
    tapBanner(e) {
        const url = e.currentTarget.dataset.url
        if (url) {
            wx.navigateTo({
                url
            })
        }
    },
    checkIsOpened(openingHours) {
        if (!openingHours) {
            return true
        }
        const date = new Date();
        const startTime = openingHours.split('-')[0]
        const endTime = openingHours.split('-')[1]
        const dangqian = date.toLocaleTimeString('chinese', {hour12: false})

        const dq = dangqian.split(":")
        const a = startTime.split(":")
        const b = endTime.split(":")

        const dqdq = date.setHours(dq[0], dq[1])
        const aa = date.setHours(a[0], a[1])
        const bb = date.setHours(b[0], b[1])

        if (a[0] * 1 > b[0] * 1) {
            // 说明是到第二天
            return !this.checkIsOpened(endTime + '-' + startTime)
        }
        return aa < dqdq && dqdq < bb
    },
    yuanjiagoumai() {
        this.setData({
            showGoodsDetailPOP: true
        })
    },
    _lijipingtuanbuy() {
        const curGoodsMap = this.data.curGoodsMap
        curGoodsMap.price = curGoodsMap.basicInfo.pingtuanPrice
        this.setData({
            curGoodsMap,
            showGoodsDetailPOP: true,
            lijipingtuanbuy: true
        })
    },
    pingtuanbuy() {
        // 加入 storage 里
        const curGoodsMap = this.data.curGoodsMap
        const canSubmit = this.skuCanSubmit()
        const additionCanSubmit = this.additionCanSubmit()
        if (!canSubmit || !additionCanSubmit) {
            wx.showToast({
                title: '请选择规格',
                icon: 'none'
            })
            return
        }
        const sku = []
        if (curGoodsMap.properties) {
            curGoodsMap.properties.forEach(big => {
                const small = big.childsCurGoods.find(ele => {
                    return ele.selected
                })
                sku.push({
                    optionId: big.id,
                    optionValueId: small.id,
                    optionName: big.name,
                    optionValueName: small.name
                })
            })
        }
        const additions = []
        if (curGoodsMap.basicInfo.hasAddition) {
            this.data.goodsAddition.forEach(ele => {
                ele.items.forEach(item => {
                    if (item.active) {
                        additions.push({
                            id: item.id,
                            pid: item.pid,
                            pname: ele.name,
                            name: item.name
                        })
                    }
                })
            })
        }
        const pingtuanGoodsList = []
        pingtuanGoodsList.push({
            goodsId: curGoodsMap.basicInfo.id,
            number: curGoodsMap.number,
            categoryId: curGoodsMap.basicInfo.categoryId,
            shopId: curGoodsMap.basicInfo.shopId,
            price: curGoodsMap.price,
            score: curGoodsMap.basicInfo.score,
            pic: curGoodsMap.basicInfo.pic,
            name: curGoodsMap.basicInfo.name,
            minBuyNumber: curGoodsMap.basicInfo.minBuyNumber,
            logisticsId: curGoodsMap.basicInfo.logisticsId,
            sku,
            additions
        })
        wx.setStorageSync('pingtuanGoodsList', pingtuanGoodsList)
        // 跳转
        wx.navigateTo({
            url: '/pages/pay/index?orderType=buyNow&pingtuanOpenId=' + this.data.pingtuan_open_id,
        })
    },
    _lijipingtuanbuy2() {
        this.data.share_pingtuan_open_id = null
        this._showGoodsDetailPOP(this.data.curGoodsMap.basicInfo.id)
    },
    async goodsAddition(goodsId) {
        const res = await WXAPI.goodsAddition(goodsId)
        if (res.code === 0) {
            this.setData({
                goodsAddition: res.data
            })
        } else {
            this.setData({
                goodsAddition: null
            })
        }
    },
    tabbarChange(e) {
        if (e.detail === 1) {
            wx.navigateTo({
                url: '/pages/cart/index',
            })
        }
        if (e.detail === 2) {
            wx.navigateTo({
                url: '/pages/cart/order',
            })
        }
    },
    selectshop() {
        wx.navigateTo({
            url: '/pages/shop/select?type=index',
        })
    },
    goGoodsDetail(e) {
        const index = e.currentTarget.dataset.idx
        const goodsId = this.data.goods[index].id
        wx.navigateTo({
            url: '/pages/goods-details/index?id=' + goodsId,
        })
    },
    async _goodsTimesSchedule(goodsId) {
        const res = await WXAPI.goodsTimesSchedule(goodsId, '') // todo sku
        if (res.code == 0) {
            const goodsTimesSchedule = res.data
            res.data.forEach(ele => {
                ele.active = false
            })
            goodsTimesSchedule[0].active = true
            goodsTimesSchedule[0].items[0].active = true
            this.setData({
                goodsTimesSchedule
            })
            this.calculateGoodsPrice()
        } else {
            this.setData({
                goodsTimesSchedule: null
            })
        }
    },
    async skuClick3(e) {
        const propertyindex = e.currentTarget.dataset.idx1
        const propertychildindex = e.currentTarget.dataset.idx2

        const goodsTimesSchedule = this.data.goodsTimesSchedule
        const property = goodsTimesSchedule[propertyindex]
        const child = property.items[propertychildindex]
        if (child.stores <= 0) {
            wx.showToast({
                title: '已售罄',
                icon: 'none'
            })
            return
        }
        goodsTimesSchedule.forEach(a => {
            a.active = false
            a.items.forEach(b => {
                b.active = false
            })
        })
        property.active = true
        child.active = true
        this.setData({
            goodsTimesSchedule
        })
        this.calculateGoodsPrice()
    },
})
