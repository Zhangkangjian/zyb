// pages/video/video.js
Page({
  data: {
    videoUrl:''
  },
  onLoad: function (options) {
    //console.log(options.url)
    this.getSts(options.url)
  },
  getSts: function (url) {
    var self = this
    var OSS = require('../modules/ali-oss/dist/aliyun-oss-sdk.js')
    var self = this
    wx.request({
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      url: getApp().globalData.getUrl() + '/restful/util/getFederationToken',//获取STS令牌
      data: {
        uuid: self.data.uuid,
        sign: getApp().globalData.tokens(self.data.uuid),
        saId: wx.getStorageSync('saId') || '1',
        purviewType: '1'
      },
      success: function (res) {
        var client = new OSS.Wrapper({
          accessKeyId: res.data.accessKeyId,
          accessKeySecret: res.data.accessKeySecret,
          stsToken: res.data.securityToken,
          endpoint: 'oss-cn-beijing.aliyuncs.com',
          bucket: getApp().globalData.getmpe()
        });
        
        self.setData({
          videoUrl: client.signatureUrl(url, { expires: 3600 })
        })

      }, fail: function (err) {

      },
      complete: function () {
        wx.hideLoading()
      }
    })
  }
})