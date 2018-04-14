Page({
  data: {
    unitname:'',
    booler:false,
    uuid:''
  },
  onLoad: function (options) {
    var self = this
    self.setData({
      uuid: getApp().globalData.uuid()
    })
    try{
      this.setData({
        unitname: options.name
      })
    }catch(e){}
  },
  onUnload: function () {
    var self = this
    if (this.data.booler){
      var page = getCurrentPages();
      var pageBack = page[page.length - 2]
      pageBack.setData({
        unit: self.data.unitname
      })
    }
  },
  setUnit:function(e){
    this.setData({
      unitname: e.detail.value
    })
  },
  saveUnit:function(e){
    var self = this;
    self.setData({
      booler:true
    })
    wx.request({
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      url: getApp().globalData.getUrl() +'/restful/wechatApplet/updateCompanyName',
      data:{
        uuid: self.data.uuid,
        sign: getApp().globalData.tokens(self.data.uuid),
        saId: wx.getStorageSync('saId'),
        newCompanyName: self.data.unitname
      },
      success:function(res){
        console.log(res)
        if(res.data.retCode==200){
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 2000
          })
          wx.setStorageSync("companyName", self.data.unitname)
          setTimeout(function(){
            wx.navigateBack()
          },2000)
        }
      },
      fail:function(err){
        wx.showToast({
          title: '修改失败',
          icon: 'error',
          duration: 2000
        })
      } 
    })
  }
})