<template>
  <div class="process-data">
    <DataView class="data-view" id="previous-data" :data="dataBox.beforeData" />
    <DataView class="data-view" id="preview-data" :data="dataBox.afterData" />
    <TransformEntry id="transform-entry" :validationResult="validationResult" @update="transformUpdate" @save="transformSave"/>
  </div>
</template>

<script>
import TransformEntry from './TransformEntry.vue'
import DataView from './DataView.vue'
import TransformService from './../services/TransformService';

const transformService = new TransformService();

export default {
  name: 'ProcessData',
  components: {
    TransformEntry,
    DataView
  },
  props: ["sourceData"],
  data: function() {
    return {validationResult: null};
  },
  computed: {
    dataBox: function() {
      return transformService.createInitialData(this.sourceData);
    }
  },
  methods: {
    transformUpdate: function(transformValue) {
      this.validationResult = transformService.validateTransformOp(this.dataBox, transformValue);
      if (transformService.validateTransformOp(this.dataBox, transformValue).ok) {
        transformService.preview(this.dataBox, transformValue);
      }
    },
    transformSave: function(transformValue) {
      if (transformService.validateTransformOp(this.dataBox, transformValue).ok) {
        transformService.append(this.dataBox, transformValue);
      }
    }
  }
}
</script>

<style scoped>
#transform-entry {
  position: absolute;
  width: 100%;
  top: calc(100% - 40px);
  left: 0px;
  height: 34px;
  border-top: 1px solid #474A4F;
}
.data-view {
  position: absolute;
  width: calc(50%);
  height: calc(100% - 40px);
}
#previous-data {
  left: 0px;
  top: 0px;
  border-right: 1px solid #474A4F;
}
#preview-data {
  left: calc(50%);
  top: 0px;
}
</style>
