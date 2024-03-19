const CONFIG = require('../../config.js')
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const APP = getApp()
APP.configLoadOK = () => {

}

Page({
    data: {
        showTelephone: false,
        myBg: 'https://dcdn.it120.cc/2020/08/01/252f429e-1a7f-4bc6-9e06-92b210c437b4.png',
        userInfo: {
            id: 12,
            name: 'yucm',
            photo: 'https://img.yzcdn.cn/vant/cat.jpeg',
        }
    },
    onLoad() {
        const order_hx_uids = wx.getStorageSync('order_hx_uids')
        this.setData({
            version: CONFIG.version,
            order_hx_uids,
            customerServiceType: CONFIG.customerServiceType
        })
    },
    onShow() {
        AUTH.checkHasLogined().then(isLogined => {
            if (isLogined) {
                this.getUserApiInfo()
            } else {
                AUTH.authorize().then(res => {
                    AUTH.bindSeller()
                })
            }
        })
    },
    // 用户信息获取
    async getUserApiInfo() {
        // todo
    },
    clearStorage() {
        wx.clearStorageSync()
        wx.reLaunch({
            url: '/pages/index/index',
        })
    },
    // 微信获取用户头像名称
    async onChooseAvatar(e) {
        // const avatarUrl = e.detail.avatarUrl
        // let res = await WXAPI.uploadFileV2(wx.getStorageSync('token'), avatarUrl)
        // if (res.code != 0) {
        //     wx.showToast({
        //         title: res.msg,
        //         icon: 'none'
        //     })
        //     return
        // }
        // res = await WXAPI.modifyUserInfo({
        //     token: wx.getStorageSync('token'),
        //     avatarUrl: res.data.url,
        // })
        // if (res.code != 0) {
        //     wx.showToast({
        //         title: res.msg,
        //         icon: 'none'
        //     })
        //     return
        // }
        // wx.showToast({
        //     title: '设置成功',
        // })
        // this.getUserApiInfo()
    },
    openTel() {
        this.setData({
            showTelephone: true
        })
    },
    closeTel() {
        this.setData({
            showTelephone: false
        })
    },
})
