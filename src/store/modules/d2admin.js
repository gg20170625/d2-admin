import util from '@/libs/util.js'
import db from '@/libs/db.js'
import themeList from '@/assets/style/theme/list.js'

// 获取项目信息
import packJson from '../../../package.json'

export default {
  state: {
    // 拉取的最新版本信息
    releases: {},
    // D2Admin 版本
    version: packJson.version,
    // 有更新
    update: false,
    // 更新提醒弹窗
    updateNotify: false,
    // 全屏
    isFullScreen: false,
    // 灰度
    isGrayMode: false,
    // 主题
    themeList,
    themeActiveName: themeList[0].name, // 这应该是一个名字 不是对象
    // 可以在多页 tab 模式下显示的页面
    tagPool: [],
    // 当前显示的多页面列表
    pageOpenedList: [
      {
        name: 'index',
        meta: {
          title: '首页',
          requiresAuth: false
        }
      }
    ],
    // 当前页面
    pageCurrent: ''
  },
  getters: {
    /**
     * @description 返回当前的主题信息 不是一个名字 而是所有的主题数据
     * @param {state} state vuex state
     */
    themeActiveSetting (state) {
      return state.themeList.find(theme => theme.name === state.themeActiveName)
    }
  },
  mutations: {
    /**
     * @class 通用工具
     * @description 将 state 中某一项存储到数据库
     * @param {state} state vuex state
     */
    d2adminVuex2DbByUuid (state, key) {
      const setting = db.get(key).find({uuid: util.uuid()})
      if (setting.value()) {
        setting.assign({value: state[key]}).write()
      } else {
        db.get(key).push({
          uuid: util.uuid(),
          value: state[key]
        }).write()
      }
    },
    /**
     * @description 更新远端的版本信息
     * @class releases
     * @param {state} state vuex state
     * @param {object} releases info
     */
    d2adminReleasesSet (state, releases) {
      state.releases = releases
    },
    /**
     * @description 设置是否有更新
     * @class update
     * @param {state} state vuex state
     * @param {boolean} update update value
     */
    d2adminUpdateSet (state, update) {
      state.update = update
    },
    /**
     * @description 设置是否有更新的时候显示弹窗
     * @class updateNotify
     * @param {state} state vuex state
     * @param {boolean} update updateNotify value
     */
    d2adminUpdateNotifySet (state, updateNotify) {
      state.updateNotify = updateNotify
    },
    /**
     * @class pageCurrent
     * @description 设置当前激活的页面 name
     * @param {state} state vuex state
     * @param {string} name new name
     */
    d2adminPageCurrentSet (state, name) {
      state.pageCurrent = name
    },
    /**
     * @class tagPool
     * @description 保存 tagPool (候选池)
     * @param {state} state vuex state
     * @param {Array} tagPool tags
     */
    d2adminTagPoolSet (state, tagPool) {
      state.tagPool = tagPool
    },
    /**
     * @class pageOpenedList
     * @description 更新页面列表上的某一项
     * @param {state} state vuex state
     * @param {info} param1 new page info
     */
    d2adminpageOpenedListUpdateItem (state, { index, argu, query }) {
      // 更新页面列表某一项
      let page = state.pageOpenedList[index]
      page.argu = argu || page.argu
      page.query = query || page.query
      state.pageOpenedList.splice(index, 1, page)
      // 更新设置到数据库
      this.commit('d2adminVuex2DbByUuid', 'pageOpenedList')
    },
    /**
     * @class pageOpenedList
     * @description 新增一个 tag (打开一个页面)
     * @param {state} state vuex state
     * @param {object} param1 new tag info
     */
    d2adminTagIncreate (state, { tag, argu, query }) {
      // 设置新的 tag 在新打开一个以前没打开过的页面时使用
      let newPage = tag
      newPage.argu = argu || newPage.argu
      newPage.query = query || newPage.query
      newPage.argu = argu || newPage.argu
      // 添加进当前显示的页面数组
      state.pageOpenedList.push(newPage)
      // 更新设置到数据库
      this.commit('d2adminVuex2DbByUuid', 'pageOpenedList')
    },
    /**
     * @class pageOpenedList
     * @description 关闭一个 tag (关闭一个页面)
     * @param {state} state vuex state
     * @param {string} name close tag name
     */
    d2adminTagClose (state, name) {
      // 找到这个页面在已经打开的数据里是第几个
      const index = state.pageOpenedList.findIndex(page => page.name === name)
      if (index >= 0) {
        state.pageOpenedList.splice(index, 1)
      }
      // 更新设置到数据库
      this.commit('d2adminVuex2DbByUuid', 'pageOpenedList')
    },
    /**
     * @class pageOpenedList
     * @description 关闭当前标签左边的标签
     * @param {state} state vuex state
     */
    d2adminTagCloseLeft (state) {
      let currentIndex = 0
      state.pageOpenedList.forEach((page, index) => {
        if (page.name === state.pageCurrent) {
          currentIndex = index
        }
      })
      if (currentIndex > 0) {
        state.pageOpenedList.splice(1, currentIndex - 1)
      }
      // 更新设置到数据库
      this.commit('d2adminVuex2DbByUuid', 'pageOpenedList')
    },
    /**
     * @class pageOpenedList
     * @description 关闭当前标签右边的标签
     * @param {state} state vuex state
     */
    d2adminTagCloseRight (state) {
      let currentIndex = 0
      state.pageOpenedList.forEach((page, index) => {
        if (page.name === state.pageCurrent) {
          currentIndex = index
        }
      })
      state.pageOpenedList.splice(currentIndex + 1)
      // 更新设置到数据库
      this.commit('d2adminVuex2DbByUuid', 'pageOpenedList')
    },
    /**
     * @class pageOpenedList
     * @description 关闭当前激活之外的 tag
     * @param {state} state vuex state
     */
    d2adminTagCloseOther (state) {
      let currentIndex = 0
      state.pageOpenedList.forEach((page, index) => {
        if (page.name === state.pageCurrent) {
          currentIndex = index
        }
      })
      if (currentIndex === 0) {
        state.pageOpenedList.splice(1)
      } else {
        state.pageOpenedList.splice(currentIndex + 1)
        state.pageOpenedList.splice(1, currentIndex - 1)
      }
      // 更新设置到数据库
      this.commit('d2adminVuex2DbByUuid', 'pageOpenedList')
    },
    /**
     * @class pageOpenedList
     * @description 关闭所有 tag
     * @param {state} state vuex state
     */
    d2adminTagCloseAll (state) {
      state.pageOpenedList.splice(1)
      // 更新设置到数据库
      this.commit('d2adminVuex2DbByUuid', 'pageOpenedList')
    },
    /**
     * @class isFullScreen
     * @description 切换全屏
     * @param {state} state vuex state
     */
    d2adminFullScreenToggle (state) {
      if (state.isFullScreen) {
        util.exitFullScreen()
        state.isFullScreen = false
      } else {
        util.openFullScreen()
        state.isFullScreen = true
      }
    },
    /**
     * @class isGrayMode
     * @description 切换灰度状态
     * @param {state} state vuex state
     */
    d2adminGrayModeToggle (state) {
      state.isGrayMode = !state.isGrayMode
    },
    /**
     * @class isGrayMode
     * @description 设置灰度模式
     * @param {state} state vuex state
     * @param {boolean} value new value
     */
    d2adminGrayModeSet (state, value) {
      state.isGrayMode = value
    },
    /**
     * @class themeActiveName
     * @description 激活一个主题（应用到dom上）
     * @param {state} state vuex state
     * @param {string} themeValue 需要激活的主题名称
     */
    d2adminThemeSet (state, themeName) {
      // 检查这个主题在主题列表里是否存在
      const theme = state.themeList.find(e => e.name === themeName)
      if (theme) {
        // 设置 state
        state.themeActiveName = themeName
      } else {
        // 设置为列表第一个主题
        state.themeActiveName = state.themeList[0].name
      }
      // 设置 dom
      document.body.className = `theme-${state.themeActiveName}`
      // 保存到数据库
      this.commit('d2adminVuex2DbByUuid', 'themeActiveName')
    },
    /**
     * @class themeActiveName
     * @description 从数据库加载主题设置
     * @param {state} state vuex state
     */
    d2adminThemeLoad (state) {
      const themeActiveName = db.get('themeActiveName').find({uuid: util.uuid()}).value()
      if (themeActiveName) {
        this.commit('d2adminThemeSet', themeActiveName.value)
      } else {
        this.commit('d2adminThemeSet', state.themeList[0].name)
      }
    }
  }
}
