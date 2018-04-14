Page({
  data: {
    oldurl: '',
    urlType: true,
    style: {
      isBtn: true,
      name: '获取验证码'
    },
    inputCont: {
      Tel: '',
      Code: '',
      Name: ''
    },
    userInfo: {
      nickName: '',
      avatarUrl: ''
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
                showCancel:false,
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
    try {
      var oder = options.oldurl.replace('pages', '..')
      console.log(oder)
      if (options.samplemasterid || options.id) {
        var urlstr = '?'
        for (let key in options) {
          if (key !='oldurl'){
            urlstr += key + '=' + options[key] +'&'
          }
        }
        oder = oder+urlstr.substring(0, urlstr.length-1)
        self.setData({
          urlType: false
        })

      } else {
        console.log('没有samplemasterid')
      }
    } catch (e) {
      var oder = '../txl/txl'
    }
    this.data['oldurl'] = oder
  },
  getCode: function (e) {
    var time = 30, self = this, timea = null
    this.Volid(function (res) {
      if (res) {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        wx.request({
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          url: getApp().globalData.getUrl() + '/restful/login/getCode',
          data: {
            phoneNum: self.data.inputCont.Tel
          },
          success: function (res) {

            if (self.data.style.isBtn) {
              self.setData({
                style: {
                  isBtn: false,
                  name: '(' + time + '秒)后重新发送'
                }
              })
              timea = setInterval(function () {
                --time
                if (time) {
                  self.setData({
                    style: {
                      isBtn: false,
                      name: '(' + time + '秒)后重新发送'
                    }
                  })
                } else {
                  clearInterval(timea)
                  self.setData({
                    style: {
                      isBtn: true,
                      name: '获取验证码'
                    }
                  })
                }
              }, 1000)
            }
          },
          fail: function (err) {
            console.log(err)
          },
          complete: function () {
            wx.hideLoading()
          }
        })


      }
    })

  },
  Volid: function (callback) {
    var reg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则
    if (this.data.inputCont.Tel == '') {
      wx.showModal({
        title: '提示',
        content: '请输入手机号'
      })
      callback(false)
    } else if (!reg.test(this.data.inputCont.Tel)) {
      wx.showModal({
        title: '提示',
        content: '手机号格式不正确'
      })
      callback(false)
    } else {
      callback(true)
    }
  },
  InputName: function (e) {
    this.data.inputCont[e.currentTarget.id] = e.detail.value
  },

  loginbtn: function () {
    var self = this
    self.Volid(function (res) {
      if (res) {

        if (self.data.inputCont.Code == '') {
          wx.showModal({
            title: '提示',
            content: '请输入验证码'
          })
          return false
        }


        wx.showLoading({
          title: '加载中',
          mask: true
        })
        wx.login({
          success: function (res) {
            console.log(res.code)
            wx.request({
              method: 'POST',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              url: getApp().globalData.getUrl() + '/restful/wechatApplet/registered',
              //url:'https://www.fantiansmart.com/restful/wechatApplet/registered',
              data: {
                tel: self.data.inputCont.Tel,
                code: self.data.inputCont.Code,
                companyName: self.data.inputCont.Name,
                js_code: res.code,
                headUrl: self.data.userInfo.avatarUrl,
                nickName: self.data.userInfo.nickName
              },
              success: function (res) {
                console.log('1'+self.data.oldurl)
                if (res.data.retCode == 200 || res.data.retCode == 201) {
                  console.log(res.data)
                  wx.setStorageSync("companyName", res.data.companyName)
                  wx.setStorageSync("saId", res.data.saId)
                  wx.setStorageSync("openId", res.data.openId)
                  console.log(res.data.phoneNumber)
                  wx.setStorageSync("tel", res.data.phoneNumber)
                  wx.setStorageSync('token', res.data.account.token)
                  if (self.data.urlType) {
                    console.log('2' + self.data.oldurl)
                    wx.switchTab({
                      url: self.data.oldurl,
                    })
                  } else {
                    console.log('3' + self.data.oldurl)
                    wx.reLaunch({
                      url: self.data.oldurl,
                    })
                  }
                } else if (res.data.retCode == 1005) {
                  wx.showModal({
                    title: '提示',
                    content: '验证码不正确'
                  })
                }else{
                  wx.showModal({
                    title: '提示',
                    content: '登录失败'
                  })
                }
              },
              fail: function (err) {

              },
              complete: function () {
                wx.hideLoading()
              }
            })
          }

        })


      }
    })
  },
  xieyi: function () {
    wx.navigateTo({
      url: '../Agreement/Agreement',
    })
  }
})