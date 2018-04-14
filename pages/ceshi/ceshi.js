Page({
  data: {
    unit:'公司名称',
    untel:'',
    oldurl:'',
    uuid:'',
    userInfo:{
      nickName:'',
      avatarUrl:''
    }
  },
  onShow: function () {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userInfo']) {
          console.log('未授权')
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              console.log('授权成功')
            },
            fail(err) {
              wx.showModal({
                title: '提示',
                content: '如需正常使用功能，请按确定并在授权管理中选中"用户信息"，然后点击确定。最后再重新进入小程序即可正常使用。',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (res) => {
                        res.authSetting = {
                          "scope.userInfo": true,
                          "scope.userLocation": true
                        }
                      }
                    })
                  }
                }
              })

            }
          })
        }
      }
    })
  },
  onLoad: function (options) {
    var self = this
    self.setData({
      uuid: getApp().globalData.uuid()
    })
    this.setData({
      untel: wx.getStorageSync('tel'),
      unit: wx.getStorageSync('companyName'),
    })
    this.data['oldurl'] = getApp().globalData.getrouter()
    wx.getUserInfo({
      success:function(res){
        self.setData({
          userInfo:{
            nickName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl
          }
        })
      },
      error:function(err){
        console.log('s')
      }
    })
  },
  VoildLogin: function () {
    /*验证登录*/
    var self = this
    this.data['oldurl'] = getApp().globalData.getrouter()
    //if (!wx.getStorageSync('saId')) {
      getApp().globalData.getLogin(function (res) {
        if (res.data.loginState == '1') {
          wx.setStorageSync("companyName", res.data.companyName)
          wx.setStorageSync("saId", res.data.saId)
          wx.setStorageSync("openId", res.data.openId)
          wx.setStorageSync("tel", res.data.phoneNumber)
        } else {
          wx.redirectTo({
            url: '../login/login?oldurl=' + getApp().globalData.getrouter(),
          })
        }
      })
    //}
    /*验证登录End*/
  },
  unit:function(e){
    wx.navigateTo({
      url: '../unit/unit?name=' + this.data.unit,
    })
  },
  outLogin:function () {
    var self = this
    wx.showModal({
      title: '提示',
      content: '是否切换账号',
      success:function(res){
        if(res.confirm){
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          wx.request({
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            url: getApp().globalData.getUrl() + '/restful/wechatApplet/accountCancellation',
            data:{
              uuid: self.data.uuid,
              sign: getApp().globalData.tokens(self.data.uuid),
              openId: wx.getStorageSync('openId'), 
              saId: wx.getStorageSync('saId')
            },
            success: function (res) {
                try {
                  wx.clearStorageSync()
                } catch (e) {
                  console.log(e)
                  // Do something when catch error
                }
                setTimeout(function(){
                  wx.redirectTo({
                    url: '../login/login?oldurl=' + self.data.oldurl,
                  })
                },100)
                
            },
            fail: function (err) {
              console.log(err)
            },
            complete: function () {
              wx.hideLoading()
            }
          })
        }
      },
      fail:function(){
        console.log('取消')
      }
    })
  },
  kf:function(e){
    console.log(e)
  },
  myyb:function(){
    wx.navigateTo({
      url: '../myyb/myyb',
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '我向您推荐"找样本"',
      path: '/pages/txl/txl?saId='+ wx.getStorageSync('saId'),
      success: function (res) {
        console.log(res)
        // 转发成功r
      },
      fail: function (res) {
        console.log(res)
        // 转发失败
      }
    }
  },
  Bindtel:function(){
    wx.makePhoneCall({
      phoneNumber: '4006021868'
    })
  },
  merberLit:function(e){
    var index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '../info/info?samplemasterid=' + index + '&list=true' + '&titlename=' + e.currentTarget.dataset.titlename
    })
  }
})