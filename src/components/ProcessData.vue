<template>
  <div class="process-data">
    <DataView class="data-view" id="previous-data" :data="dataBox.beforeData" />
    <DataView class="data-view" id="preview-data" :data="dataBox.afterData" />
    <TransformEntry id="transform-entry" @update="transformUpdate" @save="transformSave"/>
  </div>
</template>

<script>
import TransformEntry from './TransformEntry.vue'
import DataView from './DataView.vue'

export default {
  name: 'ProcessData',
  components: {
    TransformEntry,
    DataView
  },
  props: ["sourceData"],
  computed: {
    dataBox: function() {
      return {sourceData: this.sourceData,
              beforeData: {type: "text", rows: [[this.sourceData]]},
              afterData: {type: "text", rows: [[this.sourceData]]},
              transforms: [""]}
    }
  },
  methods: {
    transformUpdate: function(transformValue) {
      alert(transformValue);
    },
    transformSave: function(transformValue) {
      alert(transformValue);
    }
  }
}
</script>

<style scoped>
#transform-entry {
  background: rgba(0,0,0,0.4);
  position: absolute;
  width: 100%;
  top: calc(100% - 34px);
  left: 0px;
  height: 34px;
}
.data-view {
  background: rgba(0,0,0,0.4);
  position: absolute;
  width: calc(50% - 3px);
  height: calc(100% - 40px);
}
#previous-data {
  left: 0px;
  top: 0px;
}
#preview-data {
  left: calc(50% + 3px);
  top: 0px;
}
</style>
