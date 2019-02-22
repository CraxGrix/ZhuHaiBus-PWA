<template>
  <v-app>
    <router-view name="header">
      <v-icon slot="side-icon">menu</v-icon>
      <v-toolbar-title slot></v-toolbar-title>
      <v-btn icon slot="action" @click="changeSearchBarState">
        <v-icon>search</v-icon>
      </v-btn>
    </router-view>
    <v-fade-transition>
      <router-view name="searchModal" v-if="searchBarStatus"></router-view>
    </v-fade-transition>
    <v-container fulid grid-list-lg>
      <router-view
        name="Card"
        v-for="(router, index) in globalRouters"
        :key="index"
        :router="router"
      ></router-view>
    </v-container>
  </v-app>
</template>
<script>
import { mapState, mapActions, mapMutations } from "vuex";
import { getInfoById } from "@/script/utils";
import WebFontLoader from "webfontloader";
export default {
  data: () => ({}),
  computed: {
    ...mapState(["searchBarStatus", "globalRouters"])
  },
  methods: {
    ...mapActions(["changeSearchBarState"]),
    ...mapMutations(["setGlobalRouters"]),
    saveHistory(data) {
      localStorage["history"] = data;
    },
    getLocalHistory() {
      return JSON.parse(localStorage.history).map(id => getInfoById(id));
    },
    formatRoutersInfo(routers) {
      return JSON.stringify(routers.map(({ Id }) => Id));
    },
    existHistory() {
      return localStorage.history == null;
    }
  },
  watch: {
    globalRouters(newVal) {
      let data = this.formatRoutersInfo(newVal);
      this.saveHistory(data);
    }
  },
  mounted() {
    if (!this.existHistory()) {
      this.setGlobalRouters(this.getLocalHistory());
    }
    WebFontLoader.load({
      google: {
        families: ["Roboto:100,300,400,500,700,900"]
      },
      active: this.setFontLoaded
    });
  }
};
</script>