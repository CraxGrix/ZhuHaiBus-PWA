<template>
<v-app>
	<router-view name="header">
  		<v-icon slot="side-icon">menu</v-icon>
  		<v-toolbar-title slot>
    	</v-toolbar-title>
  		<v-btn icon slot="action" @click="changeSearchBarState">
  			<v-icon>search</v-icon>
  		</v-btn>
  	  </router-view>
  	<v-fade-transition>
  		<router-view name="searchModal" v-if="searchBarStatus" ></router-view>
  	</v-fade-transition>
      <v-container fulid grid-list-lg>
      <router-view name="Card" v-for="(router, index) in routers" :key="index" :router="router"></router-view>
        </v-container>
</v-app>
</template>
<script>
import { mapState, mapActions, mapMutations} from "vuex";
import { getInfoById } from '@/script/utils';
import WebFontLoader from 'webfontloader';
export default {
	data: () => ({
	}),
  computed: {
    ...mapState(["searchBarStatus", "routers"])
  },
	methods: {
    ...mapActions(["changeSearchBarState"]),
    ...mapMutations(["setRouters"]),
    saveHistory(data) {
      localStorage['history'] = data
    }
	},
  watch: {
    routers(val) {
      this.saveHistory(JSON.stringify(val.map(r => r.map(r => r['Id']))))
    }
  },
  mounted() {
    if(localStorage.history) this.setRouters(JSON.parse(localStorage.history).map(arr => arr.map(id => getInfoById(id))).slice(0, 20));
    WebFontLoader.load({
      google: {
        families: ['Roboto:100,300,400,500,700,900'],
      },
      active: this.setFontLoaded,
    })
  }
}
</script>