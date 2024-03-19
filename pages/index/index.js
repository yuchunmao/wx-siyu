const APP = getApp()
const AUTH = require('../../utils/auth')
const WXAPI = require('apifm-wxapi')
const {categorizeList, bannerList, goodsList, goodsDetail} = require("./data");

Page({
    data: {
        page: 1,
        showGoodsDetailPOP: false, // 是否显示商品详情
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
        const refreshIndex = wx.getStorageSync('refreshIndex')
        if (refreshIndex) {
            // this.getshopInfo()
            wx.removeStorageSync('refreshIndex')
        }
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
    // 从商品列表直接添加购物车
    async addCartByList(e) {
        // todo 暂时使用本地存储存储数据，等待后端
        const token = wx.getStorageSync('token')
        const index = e.currentTarget.dataset.idx
        const good = this.data.goods[index]
        wx.showLoading({
            title: '',
        })
        let number = good.minBuyNumber // 加入购物车的数量
        const orderList = wx.getStorageSync('orderList') || []
        const order = orderList.find(it => it.goodsId === good.id)
        if (order) {
            order.number += number
        } else {
            orderList.push({
                goodsId: good.id,
                number
            })
        }
        wx.setStorageSync('orderList', orderList)
        wx.hideLoading()
        wx.showToast({
            title: '已加入购物车',
            icon: 'success'
        })
    },
    // 加入购物车通过选取规格页
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
        wx.showToast({
            title: '已加入购物车',
            icon: 'success'
        })
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
    // 展示选取规格页
    async showGoodsDetailPOP(e) {
        const index = e.currentTarget.dataset.idx
        const goodsId = this.data.goods[index].id
        this._showGoodsDetailPOP(goodsId)
    },
    async _showGoodsDetailPOP(goodsId) {
        wx.hideTabBar()
        const _data = {
            curGoodsMap: {
                number: 1,
                totalPrice: goodsDetail.price,
                goodsDetail
            }
        }
        _data.showGoodsDetailPOP = true
        this.setData(_data)

        const res = await WXAPI.goodsDetail(goodsId)
    },
    // 隐藏选取规则页
    hideGoodsDetailPOP() {
        this.setData({
            showGoodsDetailPOP: false
        })
        wx.showTabBar()
    },
    // 获取首页条幅
    async getTitle() {
        // y可以通过接口获取
        this.setData({
            title: '条幅，随便写点什么'
        })

    },
    // 跳转公告详情页
    goNotice(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/notice/detail?id=' + id,
        })
    },
    // 首页轮播图
    async banners() {
        const res = bannerList
        if (res.code === 0) {
            this.setData({
                banners: res.data
            })
        }
    },
    // 轮播图点击事件
    tapBanner(e) {
        const url = e.currentTarget.dataset.url
        if (url) {
            wx.navigateTo({
                url
            })
        }
    },
    // 跳转商品详情页
    goGoodsDetail(e) {
        const index = e.currentTarget.dataset.idx
        const goodsId = this.data.goods[index].id
        wx.navigateTo({
            url: '/pages/goods-details/index?id=' + goodsId,
        })
    }
})
