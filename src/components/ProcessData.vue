<template>
  <div class="process-data">
    <DataView class="data-view" id="previous-data"  :header="'Current'" :data="dataBox.beforeData" />
    <DataView class="data-view" id="preview-data" :header="'Preview'" :data="dataBox.afterData" />
    <TransformEntry id="transform-entry" :validationResult="validationResult" @update="transformUpdate" @save="transformSave"/>
    <div id="validation-result" :class="{ok: validationResult.ok}" v-if="validationResult ">{{ validationResult.ok ? 'Ok' : validationResult.text }}</div>
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
  left: calc(50% + 6px);
  width: calc(50% - 6px);
  top: 0px;
}
#validation-result {
    position: absolute;
    left: 10%;
    width: 80%;
    bottom: 40px;
    text-align: center;
    border: 1px solid #F00;
    border-bottom: 0px solid #FFF;
    background: rgba(128, 0,0, 0.25);
    font-size: 16px;
    font-family: monospace;
    padding: 5px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    transition: transform 0.4s, opacity 0.4s;
}
#validation-result.ok {
  transform: translateY(100px);
  opacity: 0;
}
</style>
