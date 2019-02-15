<template>
<v-fade-transition>
<v-app>
	<v-toolbar fixed>
		<v-toolbar-side-icon @click="viewReturn">
			<v-icon>arrow_back</v-icon>
		</v-toolbar-side-icon>
			<div>
				<div class="body-2">{{ $route.params.Name }}({{ busList.length }}辆车正在行驶)</div>
					<span class="body-1">{{ $route.params.FromStation }}</span>
                	<v-icon small class="arrow_forward_icon">arrow_forward</v-icon>
                	<span class="body-1">{{ $route.params.ToStation }}</span>	
			</div>
			<v-spacer></v-spacer>
			<v-btn icon :loading="loading" >
				<v-fade-transition>
				<v-icon>{{ requestIcon }}</v-icon>
			</v-fade-transition>
			</v-btn>
			<v-btn icon @click="reverse">
				<v-icon>swap_horiz</v-icon>
			</v-btn>
	</v-toolbar>
	    <v-timeline align-top dense class="timeline_wrap" >
	    	<v-timeline-item fill-dot small v-for="(stop, index) in $route.params.stops" :key="index">
	    <v-layout pt-3>
          <v-flex xs3 >
          	<v-fade-transition>
            <v-tooltip bottom v-if="">
              <v-badge small right slot="activator" v-if="busList.length && iconShowJudge(stop.Name, 'in')">
                <span slot="badge">{{ getBusQuantify(stop.Name, true) }}</span>
                <v-icon>directions_bus</v-icon>
              </v-badge>
            </v-tooltip>
            </v-fade-transition>
          </v-flex>
          <v-fade-transition>
          <v-flex class="driveout_icon_wrapper" >
            <v-badge small right v-if="busList.length && iconShowJudge(stop.Name, 'out')">
              <span slot="badge">{{ getBusQuantify(stop.Name, false) }}</span>
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
import { filterObj } from '@/script/utils'
export default {
	data: () => ({
		error_snackbar: false,
		timeout: 3000,
		loading: false,
		requestIcon: 'none',
		errorMsg: "",
		intervalId: "",
		busList: []
	}),
	computed: {
		...mapState(["routers"]),
	},
	watch: {
		loading(val) {
			if(!val) {
				this.requestIcon = 'done'
				setTimeout(() => (this.requestIcon = 'none'), 1000)
			}
		}
	},
	methods: {
    ...mapActions(["viewReturn", "viewConversion"]),
    ...mapMutations(["updateRealTimeData", "reverseRouter"]),
   	showError(e) {
   		this.errorMsg = e
   		this.error_snackbar = true
   	},
   	update(params) {
   		this.loading = true
   		requestRealTimeData(params)
   		.then(result => {
   			this.loading = false
   			this.busList = result.data
   		})
   		.catch(e => (this.showError(e.status)))
   	},
   	iconShowJudge(name, genre) {
   		let result = this.busList.find(info => (info['name'] === name))
   		if(result != null) {
   			return genre === (result["busState"] ? 'in' : 'out')
   		}
   		return false
	},
	getBusQuantify(name, logic) {
		let result = filterObj('busState', logic, (filterObj('name', name, this.busList)))
		return result.length
	},
	reverse() {
		this.reverseRouter(this.$route.params.Id)
		this.viewConversion({
			name: 'details',
			params: this.routers.flat().find(r => r["Name"] === this.$route.params["Name"] && r['Id'] !== this.$route.params["Id"])
		})
	},
	clear() {
		clearInterval(this.intervalId)
	},
	startInterval() {
		this.intervalId = setInterval((self) => {
			if(self.$route.params.hasOwnProperty("Id"))self.update(self.$route.params);
		}, 4000, this)
	}
	},
	mounted() {
		this.update(this.$route.params)
		if(!this.intervalId)this.startInterval();
	},
	beforeRouteUpdate (to, from, next) {
		this.busList = []
		this.update(to.params)
		next()
  },
  	beforeRouteLeave (to, from, next) {
  		this.busList = []
  		next()
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