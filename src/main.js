import Vue from "vue";
import Vuetify from "vuetify/lib";
import App from "./index.vue";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "vuetify/src/stylus/app.styl";
import store from "./store/index";
import router from "./router/index";
import { register } from "register-service-worker";
const dataLayer = window.dataLayer || [];
Vue.use(Vuetify);
Vue.config.productionTip = false;
new Vue({
  el: "#app",
  store,
  router,
  template: "<App/>",
  components: {
    App
  }
});
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "UA-75255026-1");

/* eslint-disable no-console */

console.log("regiter Run");
register(`${process.env.BASE_URL}service-worker.js`, {
  ready() {
    console.log(
      "App is being served from cache by a service worker.\n" +
        "For more details, visit https://goo.gl/AFskqB"
    );
  },
  registered() {
    console.log("Service worker has been registered.");
  },
  cached() {
    console.log("Content has been cached for offline use.");
  },
  updatefound() {
    console.log("New content is downloading.");
  },
  updated() {
    console.log("New content is available; please refresh.");
  },
  offline() {
    console.log(
      "No internet connection found. App is running in offline mode."
    );
  },
  error(error) {
    console.error("Error during service worker registration:", error);
  }
});
