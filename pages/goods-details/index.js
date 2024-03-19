const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')
const {goodsDetail} = require("../index/data");

Page({
    data: {
        goodsDetail: {},
    },
    onLoad(e) {
        this.data.goodsId = e.id
        this.data.kjJoinUid = e.kjJoinUid
        this.getGoodsDetailInfo(this.data.goodsId)
        this.shippingCartInfo()
    },
    async shippingCartInfo() {
        const number = await TOOLS.showTabBarBadge(true)
        this.setData({
            shopNum: number
        })
    },
    onShow() {
        AUTH.checkHasLogined().then(isLogin => {
            if (isLogin) {
                AUTH.bindSeller()
            } else {
                AUTH.authorize().then(res => {
                    AUTH.bindSeller()
                })
            }
        })
    },
    // 获取商品详情
    async getGoodsDetailInfo(goodsId) {
        // todo 模拟数据
        const token = wx.getStorageSync('token')
        const that = this;
        const details = goodsDetail
        let _data = {
            goodsDetail: details,
            buyNumber: details.stores > 0 ? 1 : 0
        }
        that.setData(_data)
    },
    stepChange(event) {
        this.setData({
            buyNumber: event.detail
        })
    },
    /**
     * 加入购物车
     */
    async addShopCar() {
        const orderList = wx.getStorageSync('orderList') || []
        const order = orderList.find(it => it.goodsId === this.data.goodsDetail.id)
        // 有相同商品订单，则进行数量的增减，否则新增订单
        if (order) {
            order.number += this.data.buyNumber
        } else {
            orderList.push({
                goodsId: this.data.goodsDetail.id,
                number: this.data.buyNumber
            })
        }
        wx.setStorageSync('orderList', orderList)
        wx.showToast({
            title: '已加入购物车',
            icon: 'success'
        })
    },
    goIndex() {
        wx.switchTab({
            url: '/pages/index/index',
        });
    }
})

