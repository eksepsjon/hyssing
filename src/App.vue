<template>
  <div id="app">
    <GetData v-if="!dataOk" msg="Welcome to Your Vue.js App" v-on:data="dataReady"/>
    <ProcessData v-else v-bind:data="data" />
  </div>
</template>

<script>
import GetData from './components/GetData.vue'
import ProcessData from './components/ProcessData.vue'

export default {
  name: 'app',
  components: {
    GetData,
    ProcessData
  },
  data: function() {
    return {data: "", dataOk: false};
  },
  methods: {
    dataReady: function(data) {
      this.data = data;
      this.dataOk = true;
    }
  }
}
</script>

<style>
#app {
  text-align: center;
  margin-top: 60px;
}
</style>
