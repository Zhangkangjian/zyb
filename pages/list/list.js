Page({
  data: {
    topImg:'',
    InputName: '',
    canvas: false,
    height:'',
    close: false,
    ArrayImg: [],
    sampleList: [],
    pageNumber: 0,
    loader: true,
    loadertext: '正在加载中.....',
    loadBottom: false,
    PageId:'',
    height:'',
    style: {
      width: '100%',
      end: false
    },
    uuid:'',
    sampleList: [],//list
    client:'',
    home:true,
    isearch: false,//判断是否搜索状态
    searchPageNumber: 0//搜索页码
  },
  onShow:function(){
    var self = this
    wx.getSystemInfo({//获取屏幕高度
      success: function (res) {
        self.setData({
          height: res.windowHeight - 10 + 'px'
        })
      }
    })
  },
  getSts: function () {
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
        console.log(res)
        var client = new OSS.Wrapper({
          accessKeyId: res.data.accessKeyId,
          accessKeySecret: res.data.accessKeySecret,
          stsToken: res.data.securityToken,
          endpoint: 'oss-cn-beijing.aliyuncs.com',
          bucket: getApp().globalData.getmpe()
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
  },
  VoildLogin: function () {
    /*验证登录*/
    var self = this
    //this.data['oldurl'] = getApp().globalData.getrouter()
    //if (wx.getStorageSync('saId') == '') {
      getApp().globalData.getLogin(function (res) {
        if (res.data.loginState == '1') {
          wx.setStorageSync("companyName", res.data.companyName)
          wx.setStorageSync("saId", res.data.saId)
          wx.setStorageSync("openId", res.data.openId)
          wx.setStorageSync("tel", res.data.phoneNumber)
          self.getSts()
        } else {
          wx.redirectTo({
            url: '../login/login?oldurl=' + getApp().globalData.getrouter() + '&id=' + self.data.PageId,
          })
        }
      })
    //}
    /*验证登录End*/
  },
  onLoad: function (options) {
    // wx.showModal({
    //   title:'options',
    //   content: JSON.stringify(options)
    // })
    var self = this
    self.setData({
      uuid: getApp().globalData.uuid()
    })
    var res = wx.getSystemInfoSync()
    var userid 

    if (decodeURIComponent(options.q) == 'undefined'){
      userid = options.id
      console.log(options.id)
    }else{
      userid = decodeURIComponent(options.q).split('/')[4] 
      //self.setData({home: true})
    }
    if (options.home){
      self.setData({home: true})
    }

    console.log(userid)


    this.setData({
      PageId: userid
    })

    this.VoildLogin()

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
    wx.navigateTo({
      url: '../info/info?samplemasterid=' + e.currentTarget.dataset.samplemasterid + '&list=true' +
      '&pm=' + e.currentTarget.dataset.pm + '&fm=' + e.currentTarget.dataset.fm
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
      self.ItemList(self.data.PageId)
    }
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
      url: getApp().globalData.getUrl() + '/restful/Sample/getSampleSubscriptionList',
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

      if (!self.data.client) {
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
        url: getApp().globalData.getUrl() + '/restful/wechatApplet/getReleaseSampleBySampleNameOrCompanyName',
        data: {
          //saId: wx.getStorageSync('saId'),//self.data.PageId,//wx.getStorageSync('saId'),
          releaseSaId:self.data.PageId,
          uuid: self.data.uuid,
          sign: getApp().globalData.tokens(self.data.uuid),
          saId: wx.getStorageSync('saId'),
          name: self.data.InputName,
          pageNumber: self.data.pageNumber
        },
        success: function (res) {
          console.log(res)
          if (res.data.retCode == 200) {
            var arr
            if(e){
              arr = res.data.sampleList
            }else{
              arr = self.data.sampleList
              for (var i = 0; i < res.data.sampleList.length; i++) {
                arr.push(res.data.sampleList[i])
              }
            }

            for(var i = 0; i<arr.length;i++){
              arr[i].old = arr[i].galleryUrl
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
              loader: false
            })
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请输入搜索内容'
      })
    }
  },
  ItemList: function (id, client) {
    console.log(id)
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
    console.log('accessSaId:' + self.data.PageId, 'said:' + wx.getStorageSync("saId"), 'pageNumber:' + self.data.pageNumber)
    wx.request({
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      url: getApp().globalData.getUrl() + '/restful/Sample/getSampleByPageNumber',
      data: {
        uuid: self.data.uuid,
        sign: getApp().globalData.tokens(self.data.uuid),
        saId: wx.getStorageSync("saId"),
        accessSaId: self.data.PageId,
        pageNumber: self.data.pageNumber,
        isRelease: 1//正式上线为1
      }, success: function (res) {
        console.log(res)
        if (res.data.enterpriseLogoUrl){
          console.log(self.data.client.signatureUrl(res.data.enterpriseLogoUrl, { expires: 3600, process: "style/enterprise_cover" }))
          self.setData({
            topImg: self.data.client.signatureUrl(res.data.enterpriseLogoUrl, { expires: 3600, process: "style/enterprise_cover" })
          })
        }
        
        if (res.data.retCode == 200 && res.data.sampleListVo != null) {
          var arr = self.data.sampleList
          if (res.data.sampleListVo.length == 0) {
            self.setData({
              loadBottom: true
            })
          }
          for (var i = 0; i < res.data.sampleListVo.length; i++) {
            var UrlImg
            try {
              UrlImg = client.signatureUrl(res.data.sampleListVo[i].galleryUrl, { expires: 3600, process: "style/list" })
            } catch (e) {
              UrlImg = self.data.client.signatureUrl(res.data.sampleListVo[i].galleryUrl, { expires: 3600, process: "style/list" })
            }
            res.data.sampleListVo[i].galleryUrl = UrlImg
            arr.push(res.data.sampleListVo[i])
          }
          console.log(arr)
          self.setData({
            sampleList: arr,
            loader: false
          })
          if (!res.data.sampleListVo) {
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
            loader: false
          })
        }
      }, fail: function (err) {
        self.setData({
          loadertext: '暂无数据'
        })
      }
    })

  },
  scrollLower: function () {
    console.log('aaaaaaaa')
    var self = this
    //if (!this.data.loadBottom) {
      if (!self.data.isearch) {//列表状态
        self.setData({
          pageNumber: ++self.data.pageNumber
        })
        console.log(self.data.pageNumber)
        self.ItemList(self.data.PageId)
      } else {//搜索状态
        self.setData({
          pageNumber: ++self.data.searchPageNumber
        })
        self.searchBtn(true)
      }
    //}
  },
  upHome:function(){
    wx.switchTab({
      url: '../txl/txl',
    })
  }
})