<template>
  <v-flex xs12 class="card" @click="clickEventProcess(router)">
    <v-card>
      <v-layout align-center justify-center fill-height>
        <v-flex xs9>
          <v-card-title>
            <div>
              <div class="title">{{ router.Name }}</div>
              <span class="body-2">{{ router.FromStation }}</span>
              <span class="body-1">  驶往  </span>
              <span class="body-2">{{ router.ToStation }}</span>
            </div>
          </v-card-title>
        </v-flex>
        <v-flex xs3>
          <v-btn icon @click.stop="reverseRouter(router)">
            <v-icon>swap_horiz</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </v-flex>
</template>
<script>
import { mapState, mapActions, mapMutations } from "vuex";
export default {
  props: ["router"],
  data: () => ({}),
  computed: {
    ...mapState(["globalRouters"])
  },
  methods: {
    ...mapActions(["viewConversion"]),
    ...mapMutations(["reverseRouter", "stickyRouter"]),
    clickEventProcess(routerInfo) {
      let opts = {
        handle: "push",
        params: { name: "details", params: routerInfo }
      }
      this.viewConversion(opts);
    }
  }
};
</script>
<style scoped>
.card {
  margin-top: 2.1vh;
}
</style>