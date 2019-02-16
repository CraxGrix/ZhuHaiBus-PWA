<template>
  <div class="modal-backdrop">
    <v-card class="search_modal_wrap">
      <v-card flat class="search_bar">
        <v-btn icon>
          <v-icon>search</v-icon>
        </v-btn>
        <v-text-field lable="Search" v-model="inputValue" single-line autofocus></v-text-field>
        <v-btn icon @click="changeSearchBarState">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card>
      <v-divider></v-divider>
      <v-card v-if="inputValue" class="search_result_wrap">
        <v-list two-line>
          <v-card
            ripple
            v-for="(router, index) in matchedRouters"
            :key="index"
            @click="createRouterCard(router.Id)"
          >
            <v-card-title>
              <v-layout>
                <v-flex>
                  <div class="title">{{ router.Name }}</div>
                  <span class="body-2">{{ router.FromStation }}</span>
                  <v-icon small class="arrow_forward_icon">arrow_forward</v-icon>
                  <span class="body-2">{{ router.ToStation }}</span>
                </v-flex>
                <v-flex>
                  <div class="caption">最早班次:{{ router.BeginTime }}</div>
                  <div class="caption">最后班次:{{ router.EndTime }}</div>
                  <div class="caption">班次间隔:{{ router.Interval }}min</div>
                </v-flex>
              </v-layout>
            </v-card-title>
            <v-divider></v-divider>
          </v-card>
        </v-list>
      </v-card>
    </v-card>
  </div>
</template>
<script>
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import { characterMatchRoute } from "@/script/utils";
export default {
  data: () => {
    return {
      inputValue: null,
      matchedRouters: []
    };
  },
  computed: {
    ...mapState(["searchBarStatus", "routers"])
  },
  watch: {
    inputValue(val) {
      this.matchedRouters = characterMatchRoute(`${val}路`);
    }
  },
  methods: {
    ...mapActions(["changeSearchBarState", "viewConversion"]),
    ...mapMutations(["addRouters", "stickyRouters"]),
    createRouterCard(id) {
      this.changeSearchBarState();
      this.sortRouters(id);
      if (this.check(id)) {
        this.stickyRouters(id);
      } else {
        this.addRouters(this.matchedRouters);
      }
      this.viewConversion({
        name: "details",
        params: this.matchedRouters.find(r => r["Id"] === id)
      });
    },
    sortRouters(id) {
      this.matchedRouters =
        this.matchedRouters[0]["Id"] === id
          ? this.matchedRouters
          : this.matchedRouters.reverse();
    },
    check(id) {
      return this.routers.flat().some(info => info["Id"] === id);
    }
  }
};
</script>
<style>
.modal-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
}
.search_modal_wrap {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 2.09vh;
  left: 2.09vh;
  right: 2.09vh;
}
.v-list {
  padding: 0;
}
.v-text-field {
  padding-top: 5px;
}
.search_bar {
  display: flex;
}
.search_result_wrap {
  height: 6.53vh;
}
.arrow_forward_icon {
  position: relative;
  bottom: 0.32vh;
}

.router_time_info_container {
}
</style>

