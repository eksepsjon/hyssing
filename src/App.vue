<template>
  <div id="app">
    <DataEntry v-if="!dataOk" v-on:data="dataReady"/>
    <ProcessData v-else :sourceData="sourceData" />
  </div>
</template>

<script>
import DataEntry from './components/DataEntry.vue'
import ProcessData from './components/ProcessData.vue'

export default {
  name: 'app',
  components: {
    DataEntry,
    ProcessData
  },
  data: function() {
    return {sourceData: "", dataOk: false};
  },
  methods: {
    dataReady: function(sourceData) {
      this.sourceData = sourceData;
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
