Page({
  data: {
    uuid: '',
    oldID: '',
    businesscardsaid: '',
    sctxt: '收藏',
    soucang: {
      isSubscriptionNoCard: '',
      isSubscriptionMyCard: '',
      isSubscriptionCard: '',
      businessCardSaId: ''
    },
    prev: false,
    next: false,
    sampleMasterId: '',
    home: true,
    bossId: '',//名片ID
    pageArray: [],
    oldpageArray: [],
    scrolly: true,
    height: '',
    client: '',
    swipercurrent: '0',
    shareImage: '',
    menu: {
      state: false,
      text: '1',
      textLen: '',
    },
    business: {
      id: '',
      text: '',//按钮显示的文字
      style: '0,100,255,0.7',
      businessBG: false,
      active: false,//是否显示有内容的界面
      buttonType: '',//按钮的分类
      buttonText: '',//按钮的分类
      mycard: '',//自己的名片
      card: '',//别人的名片
      edi: false,
      showState: false,
      showContext: false,
      info: {
        headUrl: '',//头像
        oheadUrl: '',//头像
        name: '',//姓名
        position: '',//职位
        companyName: '',//公司名
        address: '',//地址
        cellPhone: '',//手机号
        fixedTelephone: '',//固话
        fax: '',//传真
        zipCode: '',//邮编
        mailbox: '',//邮箱
        weChatNumber: ''//微信号
      }
    },
    menuBox: false,
    soutxt: '收藏',
    appjson: {
      sampleId: null,
      isRelease: null,
      sharesource: null,
      shareSaId: null
    }
  },
  getSts: function (options) {
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
        var sd = 'business.id'
        var client = new OSS.Wrapper({
          accessKeyId: res.data.accessKeyId,
          accessKeySecret: res.data.accessKeySecret,
          stsToken: res.data.securityToken,
          endpoint: 'oss-cn-beijing.aliyuncs.com',
          bucket: getApp().globalData.getmpe()
        });
        self.setData({
          client: client,
          [sd]: options.card ? options.card : ''
        })
        var cardc = options.card ? options.card : ''
        self.geturls(options, cardc)
      }, fail: function (err) {

      }
    })
  },
  onLoad: function (options) {//onLoad
    var self = this
    this.setData({
      businesscardsaid: options.businesscardsaid ? options.businesscardsaid : ''
    })
    self.VoildLogin(options)
    self.setData({//设置uuid
      uuid: getApp().globalData.uuid(),
    })

    wx.getSystemInfo({//获取屏幕高度
      success: function (res) {
        self.setData({
          height: res.windowHeight - 50 + 'px'
        })
      }
    })
  },
  VoildLogin: function (options) {
    /*验证登录*/
    var self = this
    //if (!wx.getStorageSync('saId')){
    var urlstr = ''
    if (decodeURIComponent(options.q) != 'undefined') {
      var arr = decodeURIComponent(options.q).split('/');
      urlstr = '&samplemasterid=' + arr[4]
      // wx.showModal({
      //   title: '提示',
      //   content: urlstr,
      // })
    } else {
      for (let key in options) {
        var c = '&' + key + '=' + options[key]
        urlstr += c
      }
    }

    this.data['oldurl'] = getApp().globalData.getrouter()
    getApp().globalData.getLogin(function (res) {
      if (res.data.loginState == '1') {
        wx.setStorageSync("companyName", res.data.companyName)
        wx.setStorageSync("saId", res.data.saId)
        wx.setStorageSync("openId", res.data.openId)
        wx.setStorageSync("tel", res.data.phoneNumber)
        wx.setStorageSync("token", res.data.account.token)
        self.QRupload(options)
        //self.getSts(options)
      } else {
        console.log(getApp().globalData.getrouter() + urlstr)
        wx.navigateTo({
          url: '../login/login?oldurl=' + getApp().globalData.getrouter() + urlstr,
        })
      }
    })



  },
  QRupload: function (options) {
    var self = this
    if (options.list) {
      self.setData({
        home: false
      })
    }

    if (options.samplemasterid) {
      self.setData({
        sampleMasterId: options.samplemasterid
      })
    } else if (decodeURIComponent(options.q)) {
      var arr = decodeURIComponent(options.q).split('/');
      self.setData({
        sampleMasterId: arr[4]
      })
    }
    var sampleId = options.sampleId ? options.sampleId : 'null'
    var isRelease = options.isRelease ? options.isRelease : '1'
    var sharesource = options.sharesource ? options.sharesource : 'null'
    var shareSaId = options.shareSaId ? options.shareSaId : 'null'
    self.setData({
      appjson: {
        sampleId: sampleId,
        isRelease: isRelease,
        sharesource: sharesource,
        shareSaId: shareSaId
      }
    })
    self.getSts(options)
  },
  geturls: function (options, c) {
    console.log('接收的ID是:' + c)
    var sc = options.sc ? '删除' : '收藏'
    this.setData({
      sctxt: sc
    })

    var self = this
    console.log(wx.getStorageSync('saId'))
    console.log(self.data.sampleMasterId)

    getApp().globalData.getType(function (cs) {
      wx.request({
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        url: getApp().globalData.getUrl() + '/restful/Sample/getSampleDetail',
        data: {
          uuid: self.data.uuid,
          sign: getApp().globalData.tokens(self.data.uuid),
          saId: wx.getStorageSync('saId'),
          sampleMasterId: self.data.sampleMasterId,
          isRelease: self.data.appjson.isRelease,
          sharesource: self.data.appjson.sharesource,
          sampleId: self.data.appjson.sampleId,
          shareSaId: self.data.appjson.shareSaId,
          businessCardSaId: c,//c
          /**/
          deviceTypeId:cs.m,
          networkTypeId: cs.n,
          channelId:0,
          indntifyCode:'',
          formIndntifyCode:''
        },
        success: function (res) {
          //setTimeout(function(){
          console.log(res.data)
          if (res.data.retCode == 200) {
            self.setData({
              oldID: JSON.parse(res.data.sampleContentJsonString).sample.ownerSaId
            })
            var cardTEXT = 'business.text'
            var cardSTYLE = 'business.style'
            var mycardJSON = 'business.mycard'

            var cardJSON = 'business.card'
            var active = 'business.active'
            var edi = 'business.edi'
            var getInfo = 'business.info'
            var buttonType = 'business.buttonType'
            var buttonText = 'business.buttonText'

            var isSubscriptionNoCard = 'soucang.isSubscriptionNoCard'
            var isSubscriptionMyCard = 'soucang.isSubscriptionMyCard'
            var isSubscriptionCard = 'soucang.isSubscriptionCard'
            var businessCardSaId = 'soucang.businessCardSaId'

            self.setData({
              [cardJSON]: JSON.parse(res.data.businessCardSaIdJsonString),
              [mycardJSON]: JSON.parse(res.data.saIdCardJsonString),
              [isSubscriptionNoCard]: res.data.isSubscriptionNoCard,
              [isSubscriptionCard]: res.data.isSubscriptionCard,
              [isSubscriptionMyCard]: res.data.isSubscriptionMyCard,
              [businessCardSaId]: JSON.parse(res.data.businessCardSaIdJsonString).saId || '-1'
            })

            var mycardid = 'business.id'
            console.log(self.data.business.card.saId)
            self.setData({
              [mycardid]: self.data.business.card.saId//默认分享值
            })




            if (self.data.business.card.name && !self.data.business.mycard.name) {//样本有自己没有
              self.setData({
                [cardTEXT]: '查看名片',
                [cardSTYLE]: '0,100,255,0.7',
                [buttonText]: '替换为我的名片',
                [buttonType]: '替换为我的名片'
              })
            } else if (self.data.business.card.name && self.data.business.mycard.name) {//两个都有
              if (self.data.business.card.name == self.data.business.mycard.name) {//相等
                self.setData({
                  [cardTEXT]: '查看名片',
                  [cardSTYLE]: '0,100,255,0.7',
                  [buttonText]: '解绑我的名片',
                  [buttonType]: '解绑我的名片'
                })
              } else {//不相等
                self.setCardInfo()
                self.setData({
                  [cardTEXT]: '查看名片',
                  [cardSTYLE]: '0,100,255,0.7',
                  [buttonText]: '绑定我的名片',
                  [buttonType]: '绑定我的名片'
                })
              }
            } else {//两个都没有
              self.setData({
                [cardTEXT]: '绑定名片',
                [cardSTYLE]: '255,0,0,0.7',
                [buttonText]: '绑定我的名片',
                [buttonType]: '绑定我的名片'
              })
            }


            var isSubscription = res.data.isSubscriptionCard == '0' ? "收藏" : "取消收藏"

            self.setData({
              soutxt: isSubscription
            })
            var arr = []
            for (let i = 0; i < JSON.parse(res.data.sampleContentJsonString).samplePageList.length; i++) {
              if (JSON.parse(res.data.sampleContentJsonString).samplePageList[i].samplePage.isSection == 1) {
                arr.push(JSON.parse(res.data.sampleContentJsonString).samplePageList[i])
              }
            }
            for (let i = 0; i < arr.length; i++) {
              for (let c = 0; c < arr[i].samplePageGroupList.length; c++) {
                if (arr[i].samplePageGroupList[c].samplePageGroup.samplePageGroupTypeId == 2) {
                  for (let y = 0; y < arr[i].samplePageGroupList[c].samplePageGroupContentList.length; y++) {
                    var types = arr[i].samplePageGroupList[c].samplePageGroupContentList[y].galleryUrl = arr[i].samplePageGroupList[c].samplePageGroupContentList[y].galleryUrl
                    if (types.split('.')[1] == 'mp4') {
                      arr[i].samplePageGroupList[c].samplePageGroupContentList[y].galleryUrls = self.data.client.signatureUrl(arr[i].samplePageGroupList[c].samplePageGroupContentList[y].galleryUrl, { expires: 3600, process: "video/snapshot,t_12500,f_jpg,w_400,h_225" })
                    }
                    else {
                      arr[i].samplePageGroupList[c].samplePageGroupContentList[y].galleryUrl = self.data.client.signatureUrl(arr[i].samplePageGroupList[c].samplePageGroupContentList[y].galleryUrl, { expires: 3600, process: "style/detail" })
                    }

                  }
                }
              }
            }
            self.setData({
              pageArray: JSON.parse(res.data.sampleContentJsonString),
              oldpageArray: JSON.parse(res.data.sampleContentJsonString),
              menu: {
                state: true,
                text: '1',
                textLen: arr.length
              }
            })

            console.log(self.data.pageArray)

            var obj = 'pageArray.samplePageList'
            var fmimg = 'pageArray.sample.coverGalleryUrl'

            self.setData({
              [obj]: arr,
              [fmimg]: self.data.client.signatureUrl(self.data.pageArray.sample.coverGalleryUrl, { expires: 3600, process: "style/detail" })
            })
            console.log(self.data.menu.text > self.data.menu.textLen)
            if (self.data.menu.text < self.data.menu.textLen) {
              self.setData({
                prev: true
              })
            }



          } else {
            console.log(res.data)
          }
          //}, 300)
        },
        error: function (err) {
          console.log(err)
        }
      })
    })
  },
  readyImage: function (e) {
    var self = this
    var arr = []
    for (let i = 0; i < e.currentTarget.dataset.html.length; i++) {
      arr.push(e.currentTarget.dataset.html[i].galleryUrl)
    }

    wx.previewImage({
      current: e.currentTarget.dataset.show.galleryUrl, // 当前显示图片的http链接
      urls: arr
    })
  },
  animateEnd: function (e) {//翻页动画
    var self = this
    var menutext = 'menu.text'
    console.log(self.data.menu.textLen)
    if (self.data.menu.textLen == e.detail.current + 1) {
      self.setData({
        prev: false
      })
      self.setData({
        next: true
      })
    } else if (e.detail.current == 0) {
      self.setData({
        next: false
      })
      self.setData({
        prev: true
      })
    } else {
      self.setData({
        prev: true
      })
      self.setData({
        next: true
      })
    }
    self.setData({
      [menutext]: e.detail.current + 1
    })
  },
  startmenu: function (e) {
    this.setData({
      menuBox: true
    })
  },
  tabarList: function (e) {
    console.log(e.currentTarget.dataset.touch)
    if (e.currentTarget.dataset.touch) {
      this.setData({
        swipercurrent: e.currentTarget.dataset.index - 1
      })
    }
  },
  closemenuArraybg: function () {
    this.setData({
      menuBox: false
    })
  },
  onShareAppMessage: function (res) {
    var self = this
    var sh = self.data.business.id ? self.data.business.id : '-1'
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: self.data.oldpageArray.sample.sampleName,
      path: '/pages/info/info?samplemasterid=' + self.data.sampleMasterId + '&card=' + sh,
      success: function (res) {
        console.log(sh)
      }
    }
  },
  soucangBtn: function (e) {
    var self = this
    console.log()
    if (e.currentTarget.dataset.type == '收藏') {
      wx.request({
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        url: getApp().globalData.getUrl() + '/restful/Sample/sampleSubscriptionStatus',
        data: {
          saId: wx.getStorageSync('saId'),
          uuid: self.data.uuid,
          sign: getApp().globalData.tokens(self.data.uuid),
          sampleMasterId: self.data.sampleMasterId,
          businessCardSaId: self.data.business.id ? self.data.business.id : '',
          isDel: "0"
        },
        success: function (res) {
          if (res.data.retCode == 200) {
            var ac = self.data.business.text == '绑定名片' ? '收藏 样本' : '收藏 样本/名片'
            wx.showToast({
              title: ac,
              icon: 'success',
              duration: 2000
            })
          }
        },
        error: function () {
          wx.showToast({
            title: '收藏失败',
            icon: 'error',
            duration: 2000
          })
        }
      })
    } else {
      wx.request({
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        url: getApp().globalData.getUrl() + '/restful/Sample/sampleSubscriptionStatus',
        data: {
          saId: wx.getStorageSync('saId'),
          uuid: self.data.uuid,
          sign: getApp().globalData.tokens(self.data.uuid),
          sampleMasterId: self.data.sampleMasterId,
          businessCardSaId: self.data.soucang.businessCardSaId,
          isDel: "1"
        },
        success: function (res) {
          if (res.data.retCode == 200) {
            wx.showModal({
              title: '提示',
              content: '是否删除该样本？',
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
        },
        error: function () {
          wx.showToast({
            title: '删除失败',
            icon: 'error',
            duration: 2000
          })
        }
      })
    }
  },
  Homes: function () {
    console.log('aaaaa')
    var self = this
    wx.reLaunch({
      url: '../list/list?id=' + self.data.oldID,
    })
  },
  showEdibusiness: function () {
    //打开编辑页面
    if (this.data.business.showState) {
      console.log('打开编辑页面')
    }
  },
  clickbtn: function (e) {
    var self = this
    var mycardJSON = 'business.mycard'
    var cardJSON = 'business.card'
    switch (e.currentTarget.dataset.type) {
      case '绑定我的名片':
        self.updatas()
        break;
      case '确认更换':
        self.successList()
        break;
      case '替换为我的名片':
        self.tihuan()
        break
      case '解绑我的名片':
        self.jiebang()
        break
    }
  },
  output(e) {
    var self = this
    var name = 'business.info.' + e.target.dataset.name
    this.setData({
      [name]: e.detail.value
    })
    console.log(e)


  },
  updatas: function () {//绑定我的名片
    var self = this
    if (self.data.business.mycard.name) {//如果有我的名片
      self.setmyCardInfo(true)
    } else {//如果没有我的名片
      var edi = 'business.edi'
      var active = 'business.active'
      var showState = 'business.showState'
      self.setData({
        [active]: true,
        [edi]: false,
        [showState]: true
      })
    }
  },
  successList: function () {//点击确定
    var businessBG = 'business.businessBG'
    var card = 'business.card'
    var id = 'business.id'
    var buttonType = 'business.buttonType'
    var buttonText = 'business.buttonText'
    var cardTEXT = 'business.text'
    var cardSTYLE = 'business.style'
    var soutxt = 'soutxt'
    var self = this
    wx.showToast({ title: '名片替换成功', icon: 'success', duration: 2000 })
    self.setData({
      [cardTEXT]: '查看名片',
      [cardSTYLE]: '0,100,255,0.7',
      [businessBG]: false,
      [card]: self.data.business.mycard,
      [id]: self.data.business.mycard.saId
    })
  },
  setCardInfo: function () {
    var self = this
    var info = 'business.info'
    var active = 'business.active'
    self.setData({
      [info]: self.data.business.card,
      [active]: true
    })
  },
  setmyCardInfo: function (state) {
    var self = this
    var info = 'business.info'
    var edi = 'business.edi'
    var active = 'business.active'
    var buttonText = 'business.buttonText'
    var buttonType = 'business.buttonType'
    var businessBG = 'business.businessBG'
    var card = 'business.card'
    var id = 'business.id'
    var buttonType = 'business.buttonType'
    var buttonText = 'business.buttonText'
    var cardTEXT = 'business.text'
    var cardSTYLE = 'business.style'
    var isSubscriptionNoCard = 'soucang.isSubscriptionNoCard'
    var isSubscriptionMyCard = 'soucang.isSubscriptionMyCard'
    var isSubscriptionCard = 'soucang.isSubscriptionCard'
    if (state) {
      console.log('472')
      //绑定
      if (self.data.sctxt && self.data.sctxt != '收藏') {
        wx.request({
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          url: getApp().globalData.getUrl() + '/restful/Sample/sampleSubscriptionStatus',
          data: {
            saId: wx.getStorageSync('saId'),
            uuid: self.data.uuid,
            sign: getApp().globalData.tokens(self.data.uuid),
            sampleMasterId: self.data.sampleMasterId,
            businessCardSaId: self.data.business.mycard.saId,
            isDel: "0"
          },
          success: function (res) {
            if (res.data.retCode == 200) {
              // wx.showToast({
              //   title: '收藏成功',
              //   icon: 'success',
              //   duration: 2000
              // })
            }
          },
          error: function () {
            // wx.showToast({
            //   title: '收藏失败',
            //   icon: 'error',
            //   duration: 2000
            // })
          }
        })
      }
      wx.showToast({ title: '绑定成功', icon: 'success', duration: 2000 })

      var mycardid = 'business.id'
      self.setData({
        [mycardid]: self.data.business.mycard.saId//默认分享值
      })




      self.setData({
        [soutxt]: self.data.soucang.isSubscriptionMyCard == '0' ? '收藏' : '取消收藏'
      })

      wx.request({
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        url: getApp().globalData.getUrl() + '/restful/Sample/bindingCard',
        data: {
          uuid: self.data.uuid,
          sign: getApp().globalData.tokens(self.data.uuid),
          saId: wx.getStorageSync('saId'),
          sampleMasterId: self.data.sampleMasterId,
          isBinding: 1
        },
        success: function (res) {

        },
        error: function () { }
      })
      //wx.navigateBack(-1)
      self.setData({
        [info]: self.data.business.mycard,
        [active]: true,
        [edi]: true,
        [cardTEXT]: '查看名片',
        [cardSTYLE]: '0,100,255,0.7',
        [businessBG]: false,
        [card]: self.data.business.mycard,
        [id]: self.data.business.mycard.saId
      })
    } else {
      //解绑
      console.log("484")
      //解绑
      var mycardid = 'business.id'
      self.setData({
        [mycardid]: '-1'
      })


      //wx.navigateBack(-1)



      var soutxt = 'soutxt'
      self.setData({
        [soutxt]: self.data.soucang.isSubscriptionNoCard == '0' ? '收藏' : '取消收藏'
      })
      self.setData({
        [cardTEXT]: '替换名片'
      })

      self.setData({
        [info]: self.data.business.mycard,
        [active]: true,
        [edi]: true,
        [buttonText]: '确认更换',
        [buttonType]: '确认更换'
      })
    }

  },
  tihuan: function () {
    console.log('执行替换fn')
    var self = this

    var edi = 'business.edi'
    var active = 'business.active'
    var buttonText = 'business.buttonText'
    var buttonType = 'business.buttonType'
    if (self.data.business.mycard.name) {//如果有自己的数据
      self.setmyCardInfo()
    } else {
      var self = this
      var showContext = 'business.showContext'
      var info = 'business.info'
      self.setData({
        [showContext]: true,
        [info]: self.data.business.mycard

      })
    }
  },
  jiebang: function () {
    var self = this
    var cardTEXT = 'business.text'
    var buttonText = 'business.buttonText'
    var buttonType = 'business.buttonType'
    var businessBG = 'business.businessBG'
    var edi = 'business.edi'
    var card = 'business.card'
    var id = 'business.id'
    var cardSTYLE = 'business.style'
    var soutxt = 'soutxt'
    console.log('解绑123456')
    wx.request({
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      url: getApp().globalData.getUrl() + '/restful/Sample/bindingCard',
      data: {
        uuid: self.data.uuid,
        sign: getApp().globalData.tokens(self.data.uuid),
        saId: wx.getStorageSync('saId'),
        sampleMasterId: self.data.sampleMasterId,
        isBinding: 0
      },
      success: function (res) {
        console.log(res)
      },
      error: function () { }
    })
    self.setData({
      [cardTEXT]: '绑定名片',
      [cardSTYLE]: '255,0,0,0.7',
      [buttonText]: '绑定我的名片',
      [buttonType]: '绑定我的名片',
      [edi]: true,
      [id]: '',
      [card]: '',
      [businessBG]: false,
      [soutxt]: self.data.soucang.isSubscriptionNoCard == '0' ? '收藏' : '取消收藏'
    })

    if (self.data.sctxt && self.data.sctxt != '收藏') {
      wx.request({
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        url: getApp().globalData.getUrl() + '/restful/Sample/sampleSubscriptionStatus',
        data: {
          saId: wx.getStorageSync('saId'),
          uuid: self.data.uuid,
          sign: getApp().globalData.tokens(self.data.uuid),
          sampleMasterId: self.data.sampleMasterId,
          businessCardSaId: '',
          isDel: "0"
        },
        success: function (res) {
          if (res.data.retCode == 200) {
            // wx.showToast({
            //   title: '收藏成功',
            //   icon: 'success',
            //   duration: 2000
            // })
          }
        },
        error: function () {
          // wx.showToast({
          //   title: '收藏失败',
          //   icon: 'error',
          //   duration: 2000
          // })
        }
      })
    }


    wx.showToast({ title: '解绑成功', icon: 'success', duration: 2000 })
  },
  send: function () {
    var self = this
    var reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
    if (self.data.business.info.name == '') {
      wx.showModal({ title: '提示', showCancel: false, content: '请输入姓名' })
    } else if (self.data.business.info.companyName == '') {
      wx.showModal({ title: '提示', showCancel: false, content: '请填写公司名称' })
    } else if (self.data.business.info.position == '') {
      wx.showModal({ title: '提示', showCancel: false, content: '请填写职位' })
    } else if (self.data.business.info.address == '') {
      wx.showModal({ title: '提示', showCancel: false, content: '请填写地址', })
    } else if (self.data.business.info.cellPhone == '') {
      wx.showModal({ title: '提示', showCancel: false, content: '请填写手机号' })
    } else if (self.data.business.info.fixedTelephone == '') {
      wx.showModal({ title: '提示', showCancel: false, content: '请填写固定电话' })
    } else if (!reg.test(self.data.business.info.mailbox) && self.data.business.info.mailbox != '') {
      wx.showModal({ title: '提示', showCancel: false, content: '邮箱格式不正确' })
    } else {
      var state = 'business.showContext'
      var active = 'business.active'
      var id = 'business.id'
      var buttonType = 'business.buttonType'
      var buttonText = 'business.buttonText'
      var create = self.data.business.mycard.id ? "updateBusinessCard" : "createBusinessCard"
      var mycard = 'business.mycard'

      this.createMP(function (res) {
        console.log(res)
        self.setData({
          [state]: false,
          [active]: true,
          [mycard]: res,
          [id]: self.data.business.mycard.saId
        })
      }, create)
    }
  },
  closes: function () {
    var self = this
    var state = 'business.showContext'
    var businessBG = 'business.businessBG'
    this.setData({
      [state]: false
    })

    if (this.data.business.card.name || this.data.business.mycard.name) {
      console.log('1')
      if (self.data.business.buttonType == '绑定我的名片') {
        var info = 'business.info'
        self.setData({
          [info]: self.data.business.mycard,
          [active]: true,
          [edi]: true
        })
      } else if (self.data.business.buttonType == '确认更换') {
        var info = 'business.info'
        self.setData({
          [info]: self.data.business.mycard,
          [active]: true,
          [edi]: true
        })
      }
      else {
        this.setCardInfo()
      }

    } else {
      console.log('2')
      self.setData({
        [businessBG]: false
      })
    }

  },
  showContent: function () {
    var self = this
    var showContext = 'business.showContext'
    var info = 'business.info'
    self.setData({
      [showContext]: true,
      [info]: self.data.business.mycard
    })
    console.log(self.data.business.info)
  },
  createMP: function (callback, name) {
    var self = this
    wx.request({
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      url: getApp().globalData.getUrl() + '/restful/wechatApplet/' + name,
      data: {
        uuid: self.data.uuid,
        sign: getApp().globalData.tokens(self.data.uuid),
        saId: wx.getStorageSync('saId'),
        iconUrl: self.data.business.info.headUrl || '',
        name: self.data.business.info.name || '',
        companyName: self.data.business.info.companyName || '',
        position: self.data.business.info.position || '',
        address: self.data.business.info.address || '',
        phoneNum: self.data.business.info.cellPhone || '',
        fixedTelephone: self.data.business.info.fixedTelephone || '',
        fax: self.data.business.info.fax || '',
        postalCode: self.data.business.info.zipCode || '',
        mailbox: self.data.business.info.mailbox || '',
        weChatNumber: self.data.business.info.weChatNumber || ''
      }, success: function (res) {
        var rs = res
        if (name == 'createBusinessCard') {
          callback(rs.data.businessCard)
        } else {
          wx.showModal({
            title: '提示',
            content: '请谨慎修改名片,您分享出去的名片将展示修改后的内容',
            cancelText: '取消保存',
            confirmText: '保存',
            success: function (res) {
              if (res.confirm) {
                callback(rs.data.businessCard)
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }, error: function (err) {
        console.log(err)
      }
    })
  },
  business: function () {//打开bg
    var bg = 'business.businessBG'
    var info = 'business.info'
    var cardTEXT = 'business.text'
    var cardSTYLE = 'business.style'
    var mycardJSON = 'business.mycard'
    var mycardid = 'business.id'
    var cardJSON = 'business.card'
    var active = 'business.active'
    var edi = 'business.edi'
    var buttonType = 'business.buttonType'
    var buttonText = 'business.buttonText'
    var self = this

    if (self.data.business.card.name && !self.data.business.mycard.name) {//样本有自己没有
      console.log('样本有自己没有')
      self.setData({
        [cardTEXT]: '查看名片',
        [cardSTYLE]: '0,100,255,0.7',
        [buttonText]: '替换为我的名片',
        [buttonType]: '替换为我的名片'
      })
      self.setCardInfo()
    } else if (self.data.business.card.name && self.data.business.mycard.name) {//两个都有
      console.log('两个都有')
      if (self.data.business.card.name == self.data.business.mycard.name) {//相等
        self.setmyCardInfo()
        self.setData({
          [cardTEXT]: '查看名片',
          [edi]: true,
          [cardSTYLE]: '0,100,255,0.7',
          [buttonText]: '解绑我的名片',
          [buttonType]: '解绑我的名片'
        })
      } else {//不相等
        self.setCardInfo()
        self.setData({
          [cardTEXT]: '查看名片',
          [cardSTYLE]: '0,100,255,0.7',
          [buttonText]: '替换为我的名片',
          [buttonType]: '替换为我的名片'
        })
      }
    } else if (!self.data.business.mycard.name && !self.data.business.card.name) {//两个都没有
      console.log('两个都没有')
      var showContext = 'business.showContext'
      var showState = 'business.showState'
      self.setData({
        [cardTEXT]: '绑定名片',
        [showState]: true,
        [showContext]: true
      })
    } else {////样本没有自己有
      console.log('样本没有自己有')
      self.setmyCardInfo()
      self.setData({
        [cardTEXT]: '绑定名片',
        [edi]: true,
        [cardSTYLE]: '255,0,0,0.7',
        [buttonText]: '绑定我的名片',
        [buttonType]: '绑定我的名片'
      })
    }


    if (JSON.stringify(self.data.business.card) == JSON.stringify(self.data.business.mycard)) {
      this.setData({ [edi]: true })
    } else if (!self.data.business.card.name) {
      this.setData({ [edi]: true })
    } else {
      this.setData({ [edi]: false })
    }

    this.setData({
      [bg]: true,
      info: self.data.business.card
    })
  },
  touxiangBox: function () {
    var tx = 'business.info.headUrl'
    var self = this
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: 'https://www.fantiansmart.cn/restful/DemandManager/uploadFiles',
          filePath: tempFilePaths[0],
          name: 'file',
          success: function (res) {
            if (res.statusCode == 200) {
              var str = JSON.parse(res.data).filePath[0]
              self.setData({ [tx]: str })
              console.log(self.data.business.info)
            }
          },
          error: function (err) {
            console.log(err)
          }
        })
      }
    })
  },
  closeBG: function () {
    var getInfo = 'business.info'
    var businessBG = 'business.businessBG'
    var text = 'business.text'
    var self = this
    if (self.data.business.text == '替换名片') {
      self.setData({
        [text]: '查看名片',
      })
    }

    if (self.data.business.card.name) {
      console.log('没有确定更换名片')
      console.log(self.data.business.card.saId)
      self.setData({
        [getInfo]: self.data.business.card,
        [businessBG]: false
      })
      var mycardid = 'business.id'
      self.setData({
        [mycardid]: self.data.business.card.saId
      })
    } else {
      console.log('已经确定更换名片了')
      self.setData({
        [businessBG]: false
      })
    }

  },
  stop() {
    console.log('阻止冒泡')
  },
  telphone: function (e) {
    var tel = e.currentTarget.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel //仅为示例，并非真实的电话号码
    })
  },
  html: function (e) {
    wx.navigateTo({
      url: '../video/video?url=' + e.target.dataset.oldurl,
    })
    console.log(e.target.dataset.oldurl)
  },
  ImageZoom: function (e) {
    console.log(e)
    var arr = []
    var str = 'https://www.fantiansmart.cn/' + e.target.dataset.src
    arr.push(str)
    console.log(str)
    console.log(arr)
    wx.previewImage({
      current: str,
      urls: arr
    })
  }
})