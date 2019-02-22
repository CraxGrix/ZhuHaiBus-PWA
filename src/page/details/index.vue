<template>
  <v-app>
    <v-toolbar fixed>
      <v-toolbar-side-icon @click="viewReturn">
        <v-icon>arrow_back</v-icon>
      </v-toolbar-side-icon>
      <div>
        <div class="body-2">{{$route.params.Name }}({{ realtimeData.length }}辆车正在行驶)</div>
        <span class="body-1">{{ $route.params.FromStation }}</span>
        <v-icon small class="arrow_forward_icon">arrow_forward</v-icon>
        <span class="body-1">{{ $route.params.ToStation }}</span>
      </div>
      <v-spacer></v-spacer>
      <v-btn icon :loading="loading">
        <v-fade-transition>
          <v-icon>{{ requestIcon }}</v-icon>
        </v-fade-transition>
      </v-btn>
      <v-btn icon @click="reverse">
        <v-icon>swap_horiz</v-icon>
      </v-btn>
    </v-toolbar>
    <v-timeline align-top dense class="timeline_wrap">
      <v-timeline-item fill-dot small v-for="(stop, index) in $route.params.stops" :key="index">
        <v-layout pt-3>
          <v-flex xs3>
            <v-fade-transition>
              <v-tooltip bottom>
                <v-badge
                  small
                  right
                  slot="activator"
                  v-if="realtimeData.length && iconShowJudge(stop.Name, true)"
                >
                  <span slot="badge">{{ iconShowJudge(stop.Name, true) }}</span>
                  <v-icon>directions_bus</v-icon>
                </v-badge>
              </v-tooltip>
            </v-fade-transition>
          </v-flex>
          <v-fade-transition>
            <v-flex class="driveout_icon_wrapper">
              <v-badge small right v-if="realtimeData.length && iconShowJudge(stop.Name, false)">
                <span slot="badge">{{ iconShowJudge(stop.Name, false) }}</span>
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
    <v-snackbar color="error" :timeout="timeout" v-model="error_snackbar">"Timeout Retry"
      <v-btn dark flat @click="error_snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-app>
</template>
<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { requestRealTimeData } from "@/script/request";
import {
  filterObj,
  queryAnotherRoute,
  isNullObject,
  isNullArray
} from "@/script/utils";
export default {
  data: () => ({
    error_snackbar: false,
    timeout: 3000,
    loading: false,
    requestIcon: "none",
    errorMsg: "Timeout Retry",
    intervalId: "",
    realtimeData: [],
    updateIntervalSecend: 5
  }),
  computed: {
    ...mapState(["globalRouters"]),
    routerInfo() {
      return this.$route.params;
    }
  },
  watch: {
    loading(val) {
      if (!val) {
        this.requestIcon = "done";
        setTimeout(() => (this.requestIcon = "none"), 1000);
      }
    },
    routerInfo(val) {
      this.clearRealtimeData();
      this.updateViewRealtimeData();
    }
  },
  methods: {
    ...mapActions(["viewReturn", "viewConversion"]),
    ...mapMutations(["reverseRouter"]),
    getStopBusQuantity(stopName) {
      return this.realtimeData.filter(info => info.name === stopName);
    },
    checkResponseMatch({ Id }) {
      return this.routerInfo.Id === Id;
    },
    showError(e) {
      this.errorMsg = e;
      this.error_snackbar = true;
    },
    iconShowJudge(name, genre) {
      let busQuantityArray = this.getStopBusQuantity(name);
      if (!isNullArray(busQuantityArray)) {
        return busQuantityArray.filter(busInfo => busInfo.busState === genre)
          .length;
      }
      return false;
    },
    reverse() {
      let params = this.$route.params;
      let anotherRouter = queryAnotherRoute(params);
      if (anotherRouter.length) {
        this.reverseRouter(params);
        let opts = {
          handle: "replace",
          params: {
            name: "details",
            params: anotherRouter[0]
          }
        };
        this.viewConversion(opts);
      }
    },
    createRequest(routerInfo) {
      return requestRealTimeData(routerInfo);
    },
    updateViewRealtimeData() {
      let opts = this.routerInfo;
      if (!isNullObject(opts)) {
        this.loading = true;
        return this.createRequest(opts).then(result => {
          if (this.checkResponseMatch(opts)) {
            this.loading = false;
            this.realtimeData = result.data;
          }
        });
      }
    },
    startInterval() {
      this.intervalId = setInterval(
        self => {
          self.updateViewRealtimeData();
        },
        this.updateIntervalSecend * 1000,
        this
      );
    },
    clearInterval() {
      clearInterval(this.intervalId);
    },
    clearRealtimeData() {
      this.realtimeData = [];
    }
  },
  mounted() {
    this.updateViewRealtimeData();
    this.startInterval();
  },
  beforeDestroy() {
    this.clearInterval();
  }
};
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