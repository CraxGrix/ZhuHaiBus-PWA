import Vue from "vue";
import Vuex from "vuex";
import router from "@/router/index";
import { characterMatchRoute, queryAnotherRoute } from "@/script/utils";
import  { requestRealTimeData }  from "@/script/request"
Vue.use(Vuex);
const REQUEST_OFFEST = 2;
function delayTrigger(handle, args, target, complete) {
  setTimeout(() => {
    target[handle](args);
    complete();
  }, 150);
}
export default new Vuex.Store({
  state: {
    searchBarStatus: false,
    screenHeight: null,
    globalRouters: [],
    requestTaskPool: []
  },
  getters: {
    calculatePageOffset: state => {
      return Math.floor((state.screenHeight / 65.5) * 0.5) * 65.5;
    }
  },
  mutations: {
    _changeSearchBarStatus(state) {
      state.searchBarStatus = !state.searchBarStatus;
    },
    setScreenHeight(state, height) {
      state.screenHeight = height;
    },
    addRouters(state, routerInfo) {
      state.globalRouters.unshift(routerInfo);
    },
    stickyRouter(state, { Id }) {
      state.globalRouters.sort(routerInfo => (routerInfo.Id === Id ? -1 : 0))
    },
    reverseRouter(state, { Id }) {
      let index = state.globalRouters.findIndex(route => route.Id === Id)
      let anotherRouter = queryAnotherRoute(state.globalRouters[index])
      if(anotherRouter.length) state.globalRouters.splice(index, 1, anotherRouter[0]);   
    },
    setGlobalRouters(state, routers) {
      state.globalRouters = routers;
    }
  },
  actions: {
    changeSearchBarState(context) {
      return new Promise((resolve, reject) => {
        delayTrigger("commit", "_changeSearchBarStatus", context, resolve);
      });
    },
    viewConversion({ state, commit }, opts) {
      return new Promise((resolve, reject) => {
        let handle = opts.handle
        let params = opts.params
        delayTrigger(handle, params, router, resolve);
      }).then(() => commit("stickyRouter", opts.params.params));
    },
    viewReturn({}, numberOfEntries) {
      return new Promise((resolve, reject) =>
        delayTrigger("back", "", router, resolve)
      );
    },
    requestRealTimeData({}, opts) {
      return requestRealTimeData(opts)
    }
    /*updateRealTimeData({ dispatch }, opts) {
      return dispatch("requestRealTimeData", opts)
              .then(result => (commit("mergaRealtimeToRouterInfo", {
                  id: routerInfo.Id,
                  realtimeData: result.data})))
              .catch(error => (dispatch.requestRealTimeData(routerInfo)))
    },*/
    // 用户的乘车选择大部分情况下不止一辆，所以根据用户的浏览记录前三个车辆进行请求。
    /*updateRealtimeDataByOffectRecentlyViewedRouter({ dispatch, commit, getters }) {
      getters.offsetRecentlyViewedRoute.forEach(routerInfo => {
        dispatch("updateRealTimeData", routerInfo)
      })
    }*/
  }
})

