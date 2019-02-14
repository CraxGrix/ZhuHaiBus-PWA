<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <v-layout
          column
          class="index_wrap"
          :class="{serarch_bar_centered: !childSearchTopping, serarch_bar_topping: childSearchTopping}"
        >
          <v-flex align-self-center class="logo_wrap" xs4>
            <v-avatar align-self-center size="80" class="logo">
              <img src="./assets/logo.png" alt="#">
            </v-avatar>
          </v-flex>
          <v-flex class="search_wrap">
            <Search
              name="SearchInput"
              @PostSearchState="updateSearchState"
              @postLineMsg="registerLineComponent"
            ></Search>
          </v-flex>
          <v-flex xs3 v-if="lineDetailsArray.lnegth !== 0">
            <BasicInfoCard
              name="LineCard"
              :msg="items"
              v-for="items of lineDetailsArray"
              :key="items.id"
            ></BasicInfoCard>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>
<script>
import WebFontLoader from 'webfontloader';

export default {
  components: {
    Search: () => import('@/components/Search'),
    BasicInfoCard: () => import('@/components/Card/BasicInfoCard'),
  },
  data: () => ({
    windowHeight: null,
    lineDetailsArray: [],
    childSearchTopping: false,
  }),
  methods: {
    updateSearchState(state) {
      if (!this.lineDetailsArray.length) {
        this.childSearchTopping = state;
      }
    },
    registerLineComponent(lineDetail) {
      if (!this.checkRepeat(lineDetail)) {
        this.lineDetailsArray.unshift({ ...lineDetail, stations: null });
      }
    },
    checkRepeat(n) {
      return this.lineDetailsArray.some(line => line.id === n.id);
    },
    setFontLoaded() {
      this.$emit('font-loaded');
    },
  },
  watch: {
    windowHeight(newHeight) {
     console.log(newHeight)
    }
  },
  
  mounted() {
    WebFontLoader.load({
      google: {
        families: ['Roboto:100,300,400,500,700,900'],
      },
      active: this.setFontLoaded,
    })
    this.$nextTick(() => {
      window.addEventListener('resize', () => {
        this.windowHeight = window.innerHeight
      })})
  },
};
</script>
<style lang="css" scoped>
.index_wrap {
  transition: 0.3s margin cubic-bezier(0.4, 0, 0.2, 1);
}

.logo_wrap {
  margin-bottom: 55px;
}

.serarch_bar_centered {
  margin-top: 20%;
}

.serarch_bar_topping {
  margin-top: -100px;
}
</style>
