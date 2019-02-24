import 'vue-material/dist/theme/default.css';
import 'vue-material/dist/vue-material.min.css';
import Vue from 'vue';
import VueMaterial from 'vue-material';

import Preview from './Preview.vue';

Vue.use(VueMaterial);

const app = new Vue({
  render: h => h(Preview),
});

app.$mount('#preview');
