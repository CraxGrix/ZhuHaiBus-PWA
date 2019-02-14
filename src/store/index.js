import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router/index'
import characterMatchRoute from '@/script/utils'
Vue.use(Vuex)
function delayTrigger(handle, args, target, complete) {
	setTimeout(() => {
		target[handle](args)
		complete()
	}, 150,)
}
export default new Vuex.Store({
	state: {
		searchBarStatus: false,
		screenHeight: null,
		routers: []
	},
	getters: {
		calculatePageOffset: state => {
			return Math.floor((state.screenHeight / 65.5) * 0.5) * 65.5
		}
	},
	mutations: {
		_changeSearchBarStatus(state) {
			state.searchBarStatus = !state.searchBarStatus
		},
		setScreenHeight(state, height) {
			state.screenHeight = height
		},
		addRouters(state, payloadArray) {
			state.routers.unshift(payloadArray)
		},
		stickyRouters(state, id) {
			state.routers.sort(router => (router.every(r => r['Id'] !== id) ? 0 : -1))
		},
		updateRealTimeData(state, params) {
			let id = params.id
			let data = params.data
			let busQuantity = data.length
			state.routers = state.routers.map(router => router.map(r => (r['Id'] === id ? ((r['stops'] = r['stops'].map(stop => ({...stop, busInfo: data.filter(s => s['name'] === stop['Name'])}))) && (r['busQuantity'] = busQuantity)) && r : r)))
		},
		reverseRouter(state, id) {
			let index = state.routers.findIndex(el => el.some(e => e['Id'] === id))
			if(index !== -1) state.routers[index].reverse()
		},
		setRouters(state, routers) {
			state.routers = routers
		}
	},
	actions: {
		changeSearchBarState(context) {
			return new Promise((resolve, reject) => {
				delayTrigger('commit', '_changeSearchBarStatus', context, resolve)
    		})
		},
		viewConversion({ state, commit }, id) {
			return new Promise((resolve, reject) => {
				let params = state.routers.flat().find(r => r['Id'] === id)
				delayTrigger('push', {name: 'details', params}, router, resolve)
    		}).then(() => (commit('stickyRouters', id)))
		},
		viewReturn() {
			return new Promise((resolve, reject) => (delayTrigger('back',undefined,router, resolve)))
		},
	}
	
})
