import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import App from './index.vue'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vuetify/src/stylus/app.styl'
import store from './store/index'
import router from './router/index'
const dataLayer = window.dataLayer || []
Vue.use(Vuetify)
Vue.config.productionTip = false
Vue.config.debug = true 
new Vue({
	el: '#app',
	store,
	router,
	template: '<App/>',
	components: {
		App
	}
})
function gtag() {
	dataLayer.push(arguments)
}
gtag('js', new Date())
gtag('config', 'UA-75255026-1')