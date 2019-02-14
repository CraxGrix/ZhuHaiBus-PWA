import Vue from 'vue'
import VueRouter from 'vue-router'
import index from '@/page/index/index.vue'
import HeaderBar from '@/components/HeaderBar'
import SearchModal from '@/components/SearchModal'
import details from '@/page/details/index.vue'
import Card from '@/components/Card'
Vue.use(VueRouter)

export default new VueRouter({
	base: '/',
	mode: 'history',
	routes: [
		{
			path: '/',
			component: index,
			children: [
				{
					path: '',
					components: {
						header: HeaderBar,
						searchModal: SearchModal,
						Card: Card
					}
				}
			],
			prop: true
		},
		{
			path: '/details/:LineNumber',
			name: 'details',
			component: details
			
		}
	]
})
