Page({
  data: {
    InputName: '',
    canvas: false,
    close: false,
    ArrayImg: [],
    height:'',
    pageNumber: 0,
    loader: true,
    loadertext: '正在加载中.....',
    loadBottom: false,
    style: {
      width: '100%',
      end: false
    },
    uuid:'',
    sampleList: [],//list
    client: '',
    isearch: false,//判断是否搜索状态
    searchPageNumber: 0//搜索页码
  },
  VoildLogin: function () {
    /*验证登录*/
    var self = this
    this.data['oldurl'] = getApp().globalData.getrouter()
    //if (wx.getStorageSync('saId') == '') {
      getApp().globalData.getLogin(function (res) {
        if (res.data.loginState == '1') {
          wx.setStorageSync("companyName", res.data.companyName)
          wx.setStorageSync("saId", res.data.saId)
          wx.setStorageSync("openId", res.data.openId)
          wx.setStorageSync("tel", res.data.phoneNumber)
        } else {
          wx.redirectTo({
            url: '../login/login?oldurl=' + self.data.oldurl,
          })
        }
      })
    //}
    /*验证登录End*/
  },
  onShow: function (options) {
    wx.getSystemInfo({//获取屏幕高度
      success: function (res) {
        self.setData({
          height: res.windowHeight - 10 + 'px'
        })
      }
    })
    this.setData({
      sampleList:[]
    })
    var res = wx.getSystemInfoSync()
    this.VoildLogin()
    var self = this
    self.setData({
      uuid: getApp().globalData.uuid()
    })
    var OSS = require('../modules/ali-oss/dist/aliyun-oss-sdk.js')
    wx.request({
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uuid: self.data.uuid,
        sign: getApp().globalData.tokens(self.data.uuid),
        saId: wx.getStorageSync('saId'),
        purviewType: '1'
      },
      url: getApp().globalData.getUrl()+'/restful/util/getFederationToken',
      success: function (res) {
        var client = new OSS.Wrapper({
          accessKeyId: res.data.accessKeyId,
          accessKeySecret: res.data.accessKeySecret,
          stsToken: res.data.securityToken,
          endpoint: 'oss-cn-beijing.aliyuncs.com',
          bucket: 'mep-sample-prd'
        });
        self.setData({
          client: client
        })
        self.ItemList(client)
      }, fail: function (err) {

      },
      complete: function () {
        wx.hideLoading()
      }
    })
    //this.ItemList()
  },
  searchEnd: function (e) {
    if (this.data.InputName) {
      this.setData({
        close: true
      })
    }
    this.setData({
      style: {
        width: '72%',
        end: true
      }
    })
  },
  searchTxt: function (e) {
    var self = this
    self.setData({
      InputName: e.detail.value
    })
    if (e.detail.value) {
      self.setData({
        close: true
      })
    } else {
      self.setData({
        close: false
      })
    }
  },
  emy: function () {
    this.setData({
      InputName: '',
      close: false
    })
  },
  ewm: function (e) {//生成二维码
    console.log(e.currentTarget.dataset.samplemasterid)
    var arr = JSON.stringify(['samplemasterid', e.currentTarget.dataset.samplemasterid])
    var self = this
    console.log(e.currentTarget.dataset)
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      url: getApp().globalData.getUrl() + '/restful/wechatApplet/getAppletCode',
      data: {
        uuid: self.data.uuid,
        sign: getApp().globalData.tokens(self.data.uuid),
        saId: wx.getStorageSync('saId'),
        QRCodeParameter: arr
      },
      success: function (res) {
        var str = res.data.appletCodeUrl
        console.log(str)
        if (res.data.retCode == 200) {
          wx.getImageInfo({
            src: str,
            success: function (files) {
              getApp().globalData.canvasDraw(e.currentTarget.dataset.samplename, e.currentTarget.dataset.companyname, files.path, function (Imgurl) {
                self.data['ArrayImg'][0] = Imgurl
                wx.hideLoading()
                wx.previewImage({
                  urls: self.data.ArrayImg
                })
              })
            }
          })
        } else {
          console.log('错误：' + res.data.retMessage)
          wx.hideLoading()
        }
      },
      fail: function (err) {
        wx.showModal({
          title: '提示',
          content: '网络异常'
        })
        wx.hideLoading()
      }
    })
  },
  ToInfo: function (e) {
    console.log(e.target.dataset.businesscardsaid)
    wx.navigateTo({
      url: '../info/info?samplemasterid=' + e.currentTarget.dataset.samplemasterid + '&list=true' +
      '&pm=' + e.currentTarget.dataset.pm + '&card='+e.target.dataset.businesscardsaid + '&sc=true'
    })
  },
  binderrorimg: function (e) {
    var errImg = e.target.dataset.errorimg
    var imgObj = 'sampleList[' + errImg + '].galleryUrl'
    this.setData({
      [imgObj]: '../img/ybimg.png'
    })
  },
  wxsubscription: function (e) {
    var self = this
    var start = !e.currentTarget.dataset.start
    var index = e.currentTarget.dataset.index
    var s = e.currentTarget.dataset.s
    wx.request({
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      url: getApp().globalData.getUrl() + '/restful/wechatApplet/favoriteSample',
      data: {
        uuid: self.data.uuid,
        sign: getApp().globalData.tokens(self.data.uuid),
        saId: wx.getStorageSync('saId'),
        sampleMasterId: s,
        isFavorite: start
      }, success: function (res) {
        if (res.data.retCode == 200) {
          if (start) {
            wx.showToast({
              title: '收藏成功',
              icon: 'success',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: '取消收藏',
              icon: 'success',
              duration: 2000
            })
          }
          var objwxsubscription = 'sampleList[' + index + '].wxsubscription'
          self.setData({
            [objwxsubscription]: start
          })
          console.log(self.data['sampleList'][index].wxsubscription)
        }
      }, fail: function (err) {
        console.log(err)
      }
    })
  },
  searchClose: function (e) {
    var self = this
    this.setData({
      close: false,
      style: {
        width: '100%',
        end: false
      }
    })
    if (self.data.isearch) {
      self.ItemList()
    }
  },
  searchBtn: function (e) {
    var self = this
    if (self.data.InputName != '') {
      self.setData({
        loadBottom: false,
        loader: true
      })
      if (!self.data.isearch) {
        self.setData({
          pageNumber: 0,
          searchPageNumber: 0,
          isearch: true,
          sampleList: []
        })
      }
      if (!self.data.client){
        wx.showToast({
          title: '正在初始化',
          icon: 'error',
          duration: 2000
        })
        return false
      }
      wx.request({
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        url: getApp().globalData.getUrl() + '/restful/wechatApplet/getFavoriteSampleBySampleNameOrCompanyName',
        data: {
          uuid: self.data.uuid,
          sign: getApp().globalData.tokens(self.data.uuid),
          saId: wx.getStorageSync('saId'),
          name: self.data.InputName,
          pageNumber: self.data.pageNumber
        },
        success: function (res) {
          console.log(res)
          if (res.data.retCode == 200 && res.data.sampleList) {
            var arr
            if (e) {
              arr = res.data.sampleList
            } else {
              arr = self.data.sampleList
              for (var i = 0; i < res.data.sampleList.length; i++) {
                arr.push(res.data.sampleList[i])
              }
            }
            console.log(arr.length)
            for(var i=0;i<arr.length;i++){
              arr[i].galleryUrl = self.data.client.signatureUrl(arr[i].galleryUrl, { expires: 3600, process: "style/list" })
            }

            self.setData({
              sampleList: arr,
              loader: false
            })
            if (!res.data.sampleList) {
              self.setData({
                loadertext: '暂无数据'
              })
            }
            if (self.data.pageNumber == Math.floor(res.data.listSize / 20)) {
              self.setData({
                loadBottom: true
              })
            }
          } else {
            self.setData({
              loadBottom: true,
              loader: false,
              webView:true
            })
          }
        },
        fail:function(err){
          console.log(err)
        },
        complete:function(){
          console.log('read')
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请输入搜索内容'
      })
    }
  },
  ItemList: function (client) {
    var self = this
    if (self.data.isearch) {
      self.setData({
        pageNumber: 0,
        searchPageNumber: 0,
        sampleList: [],
        isearch: false//关闭搜索状态
      })
    }
    self.setData({
      loadBottom: false,
      loader: true
    })
    wx.request({
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      url: getApp().globalData.getUrl() + '/restful/Sample/getSampleSubscriptionList',
      data: {
        uuid: self.data.uuid,
        sign: getApp().globalData.tokens(self.data.uuid),
        saId: wx.getStorageSync('saId'),
        pageNumber: self.data.pageNumber
      }, success: function (res) {
        console.log(res)
        if (res.data.retCode == 200 && res.data.sampleList != null) {
          var arr = self.data.sampleList
          for (var i = 0; i < res.data.sampleList.length; i++) {
            var UrlImg
            try {
              UrlImg = client.signatureUrl(res.data.sampleList[i].galleryUrl, { expires: 3600, process: "style/list" })
            } catch (e) {
              UrlImg = self.data.client.signatureUrl(res.data.sampleList[i].galleryUrl, { expires: 3600, process: "style/list" })
            }
            res.data.sampleList[i].galleryUrl = UrlImg
            arr.push(res.data.sampleList[i])
          }
          self.setData({
            sampleList: arr,
            loader: false
          })
          if (!res.data.sampleList) {
            self.setData({
              loadertext: '暂无数据'
            })
          }
          if (self.data.pageNumber == Math.floor(res.data.listSize / 20)) {
            self.setData({
              loadBottom: true
            })
          }
        } else {
          console.log('a')
          self.setData({
            loadBottom: true,
            loader: false,
            webView:true
          })
        }
      }, fail: function (err) {
        console.log(err)
        self.setData({
          loadertext: '暂无数据'
        })
      },
      complete:function(){
        console.log('read')
      }
    })
  },
  scrollLower: function () {
    var self = this
    if (!this.data.loadBottom) {
      if (!self.data.isearch) {//列表状态
        self.setData({
          pageNumber: ++self.data.pageNumber
        })
        self.ItemList()
      } else {//搜索状态
        self.setData({
          pageNumber: ++self.data.searchPageNumber
        })
        self.searchBtn(true)
      }
    }
  },
  bindewm:function(){
    wx.scanCode({
      success: (res) => {
        console.log(res)
      }
    })
  },
  binds:function(e){
    console.log(e)
  }
})