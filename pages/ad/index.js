const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const {addressList} = require("./data");
const {createUUID} = require("../../utils/uuid");
const APP = getApp()
APP.configLoadOK = () => {

}

Page({
    data: {
        addressList: addressList,
        addressEdit: false,
        cancelBtn: false,

        pickerRegionRange: [],
        pickerSelect: [0, 0, 0],
        showRegionStr: '选择行政地址（省、市、区县）',

        addressData: {}
    },
    // 添加地址
    addAddress: function () {
        this.setData({
            addressEdit: true,
            cancelBtn: true,
            id: null,
            addressData: {}
        })
    },
    // 取消编辑
    editCancel: function () {
        this.setData({
            addressEdit: false,
        })
    },
    // 编辑地址
    async editAddress(e) {
        var id = e.currentTarget.dataset.id
        this.setData({
            addressEdit: true,
            cancelBtn: false,
            id: id,
        })
        if (id) { // 修改初始化数据库数据
            const address = this.data.addressList.find(it => it.id === id)
            if (address) {
                this.setData({
                    id: id,
                    address: address,
                    addressData: address,
                })
            }
        } else {
            this.initRegionPicker()
        }

    },
    // 选中地址
    selectTap: function (e) {
        var id = e.currentTarget.dataset.id;
        WXAPI.updateAddress({
            token: wx.getStorageSync('token'),
            id: id,
            isDefault: 'true'
        }).then(function (res) {
            wx.navigateBack({})
        })
    },
    // 删除地址按钮
    deleteAddress: function (e) {
        const _this = this
        const id = e.currentTarget.dataset.id;
        console.log(id)
        wx.showModal({
            title: '提示',
            content: '确定要删除该收货地址吗？',
            success: function (res) {
                if (res.confirm) {
                    const index = this.data.addressList.findIndex(it => it.id === id)
                    if (index === -1) {
                        this.data.addressList.splice(index, 1)
                        _this.setData({
                            addressEdit: false,
                            cancelBtn: false,
                            addressList
                        })
                    }
                }
            }
        })
    },
    // 获取地址列表
    async initShippingAddress() {
        // todo 接口获取
    },
    nameChange(e) {
        const addressData = this.data.addressData
        addressData.name = e.detail
        this.setData({
            addressData
        })
    },
    mobileChange(e) {
        const addressData = this.data.addressData
        addressData.mobile = e.detail
        this.setData({
            addressData
        })
    },
    addressChange(e) {
        const addressData = this.data.addressData
        addressData.address = e.detail
        this.setData({
            addressData
        })
    },
    // 保存按钮
    async bindSave() {
        const name = this.data.addressData.name
        const address = this.data.addressData.address
        const mobile = this.data.addressData.mobile

        if (!name) {
            wx.showToast({
                title: '请填写用户姓名',
                icon: 'none',
            })
            return
        }
        if (!mobile) {
            wx.showToast({
                title: '请填写手机号码',
                icon: 'none',
            })
            return
        }
        if (!address) {
            wx.showToast({
                title: '请填写详细地址',
                icon: 'none',
            })
            return
        }

        const postData = {
            id: this.data.id,
            name: name,
            address: address,
            mobile: mobile,
            isDefault: false
        }

        const addressList = this.data.addressList
        if (this.data.id) {
            const index = addressList.findIndex(it => it.id === this.data.id)
            if (index !== -1) {
                this.data.addressList.splice(index, 1, postData)
                wx.showToast({
                    title: '编辑成功',
                    icon: 'none'
                })
            }
        } else {
            postData.id = createUUID()
            addressList.push(postData)
            wx.showToast({
                title: '添加成功',
                icon: 'none'
            })
        }
        this.setData({
            addressEdit: false,
            cancelBtn: false,
            addressList
        })


    },
    onLoad: function (e) {
        if (e.id) {
            const address = this.data.addressList.find(it => it.id === e.id)
            address && this.setData({
                id: e.id,
                addressData: address
            })

        }
    },
    onShow: function () {
        // AUTH.checkHasLogined().then(isLogined => {
        //     if (isLogined) {
        this.initShippingAddress();
        //     } else {
        //         wx.showModal({
        //             content: '登陆后才能访问',
        //             showCancel: false,
        //             success: () => {
        //                 wx.navigateBack()
        //             }
        //         })
        //     }
        // })
    },

    // 判断电话号码格式
    setTelModal: function (e) {
        var mobile = /^[1][3,4,5,7,8][0-9]{9}$/;
        var isMobile = mobile.exec(e.detail.value)
        //输入有误的话，弹出模态框提示
        if (!isMobile) {
            wx.showModal({
                title: '错误',
                content: '手机号码格式不正确',
                showCancel: false
            })
        }
    },
    chooseLocation() {
        wx.chooseLocation({
            success: (res) => {
                const addressData = this.data.addressData
                addressData.address = res.address + res.name
                addressData.latitude = res.latitude
                addressData.longitude = res.longitude
                this.setData({
                    addressData
                })
            },
            fail: (e) => {
                console.error(e)
            },
        })
    }
})

