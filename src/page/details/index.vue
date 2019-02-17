<template>
    <v-app v-if="viewRouterInfo != null">
      <v-toolbar fixed>
        <v-toolbar-side-icon @click="viewReturn">
          <v-icon>arrow_back</v-icon>
        </v-toolbar-side-icon>
        <div>
          <div class="body-2">{{ viewRouterInfo.Name }}({{ busList.length }}辆车正在行驶)</div>
          <span class="body-1">{{ viewRouterInfo.FromStation }}</span>
          <v-icon small class="arrow_forward_icon">arrow_forward</v-icon>
          <span class="body-1">{{ viewRouterInfo.ToStation }}</span>
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
        <v-timeline-item fill-dot small v-for="(stop, index) in viewRouterInfo.stops" :key="index">
          <v-layout pt-3>
            <v-flex xs3>
              <v-fade-transition>
                <v-tooltip bottom>
                  <v-badge
                    small
                    right
                    slot="activator"
                    v-if="busList.length && iconShowJudge(stop.Name, 'in')"
                  >
                    <span slot="badge">{{ getBusQuantify(stop.Name, true) }}</span>
                    <v-icon>directions_bus</v-icon>
                  </v-badge>
                </v-tooltip>
              </v-fade-transition>
            </v-flex>
            <v-fade-transition>
              <v-flex class="driveout_icon_wrapper">
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
      <v-snackbar color="error" :timeout="timeout" v-model="error_snackbar">
        "Timeout Retry"
        <v-btn dark flat @click="error_snackbar = false">Close</v-btn>
      </v-snackbar>
    </v-app>
</template>
<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { requestRealTimeData } from "@/script/request";
import { filterObj, queryAnotherRoute } from "@/script/utils";
export default {
  data: () => ({
    error_snackbar: false,
    timeout: 3000,
    loading: false,
    requestIcon: "none",
    errorMsg: "Timeout Retry",
    intervalId: "",
    busList: []
  }),
  computed: {
    ...mapState(["globalRouters"]),
    viewRouterInfo() {
      return this.globalRouters.find(router => router.Id === this.$route.params.Id)
    }
  },
  watch: {
    loading(val) {
      if (!val) {
        this.requestIcon = "done";
        setTimeout(() => (this.requestIcon = "none"), 1000);
      }
    }
  },
  methods: {
    ...mapActions(["viewReturn", "viewConversion"]),
    ...mapMutations([ "reverseRouter"]),
    showError(e) {
      this.errorMsg = e;
      this.error_snackbar = true;
    },
    iconShowJudge(name, genre) {
      let result = this.busList.find(info => info["name"] === name);
      if (result != null) {
        return genre === (result["busState"] ? "in" : "out");
      }
      return false;
    },
    reverse() {
      let params = this.$route.params
      let anotherRouter = queryAnotherRoute(params)
      if (anotherRouter.length) {
        this.reverseRouter(params)
        let opts = {
          handle: "replace",
          params: {
        name: "details",
        params: anotherRouter[0]
      }
        }
        this.viewConversion(opts)
      }
    },
  },
  mounted() {

  },
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