<template>
	  	<v-fade-transition>
<v-app>
	<v-toolbar fixed>
		<v-toolbar-side-icon @click="viewReturn">
			<v-icon>arrow_back</v-icon>
		</v-toolbar-side-icon>
			<div>
				<div class="body-2">{{ routerInfo.Name }}({{ routerInfo.busQuantity }}辆车正在行驶)</div>
					<span class="body-1">{{ routerInfo.FromStation }}</span>
                	<v-icon small class="arrow_forward_icon">arrow_forward</v-icon>
                	<span class="body-1">{{ routerInfo.ToStation }}</span>	
			</div>
			<v-spacer></v-spacer>
			<v-btn icon :loading="loading" >
				<v-fade-transition>
				<v-icon>{{ requestIcon }}</v-icon>
			</v-fade-transition>
			</v-btn>
			<v-btn icon @click="reverseRouter(routerInfo.Id)">
				<v-icon>swap_horiz</v-icon>
			</v-btn>
	</v-toolbar>
	    <v-timeline align-top dense class="timeline_wrap" >
	    	<v-timeline-item fill-dot small v-for="(stop, index) in routerInfo.stops" :key="index">
	    <v-layout pt-3>
          <v-flex xs3 >
          	<v-fade-transition>
            <v-tooltip bottom v-if="stop.busInfo">
              <v-badge small right slot="activator" v-if="stop.busInfo.length && showJudge(stop.Name, stop.busInfo) === 'in'">
                <span slot="badge">{{ stop.busInfo.length }}</span>
                <v-icon>directions_bus</v-icon>
              </v-badge>
            </v-tooltip>
            </v-fade-transition>
          </v-flex>
          <v-fade-transition>
          <v-flex class="driveout_icon_wrapper" v-if="stop.busInfo">
            <v-badge small right v-show="stop.busInfo.length && showJudge(stop.Name, stop.busInfo) === 'out'">
              <span slot="badge">{{ stop.busInfo.length }}</span>
              <v-icon>directions_bus</v-icon>
            </v-badge>
          </v-flex>
          </v-fade-transition>
          <v-flex>
            <strong>{{ stop.Name }}</strong>
          </v-flex>
        </v-layout>
	    </v-timeline-item>
	</v-timeline>
	<v-snackbar  color="error" :timeout="timeout" v-model="error_snackbar">
		{{ errorMsg }}
		<v-btn
        dark
        flat
        @click="error_snackbar = false"
      >
        Close
      </v-btn>
	</v-snackbar>
	</v-app>
	  	</v-fade-transition>

</template>
<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import {requestRealTimeData} from '@/script/request'
export default {
	data: () => ({
		routerInfo: {},
		error_snackbar: false,
		timeout: 3000,
		loading: false,
		requestIcon: 'none',
		errorMsg: "",
		intervalId: ""
	}),
	computed: {
		...mapGetters(["calculatePageOffset"]),
		...mapState(["routers"])
	},
	watch: {
		loading(val) {
			if(!val) {
				this.requestIcon = 'done'
				setTimeout(() => (this.requestIcon = 'none'), 1000)
			}
		},
		routers(val) {
			this.routerInfo = val[0][0]
		}
	},
	methods: {
    ...mapActions(["viewReturn"]),
    ...mapMutations(["updateRealTimeData", "reverseRouter"]),
   	showError(e) {
   		this.errorMsg = e
   		this.error_snackbar = true
   	},
   	update(params) {
   		this.loading = true
   		requestRealTimeData(params)
   		.then(result => {
   			console.log(result.data)
   			this.loading = false
   			this.updateRealTimeData({id: params
   .Id,data: result.data})
   		})
   		.catch(e => (this.showError(e.status)))
   	},
   	showJudge(name, busInfo) {
   		return busInfo[0]["name"] === name ? busInfo[0]["busState"] ? "in" : "out" : false
	},
	},
	mounted() {
		this.intervalId = setInterval((self) => {
			self.update(self.routerInfo);
		}, 4000, this)
	},
	beforeDestroy() {
		clearInterval(this.intervalId)
	}
}
</script>
<style scoped>
.toolbar_titl {
  flex-direction: column;
  justify-content: center;
}
.timeline_wrap {
	margin-top: 55px;
}
.toolbar_titl > span {
  size: 1.5rem;
}
.driveout_icon_wrapper {
  position: absolute;
  top: 45px;
}

</style>