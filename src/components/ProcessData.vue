<template>
  <div class="process-data">
    <div id="toolbar" :class="{dataentry: !dataOk}">
      <span v-if="!dataOk">☕ hyssing ☕</span>
      <TransformEntry v-if="dataOk" id="transform-entry" :validationResult="validationResult" @update="transformUpdate" @save="transformSave"/>
    </div>
    <DataEntry v-if="!dataOk" v-on:data="dataReady"/>
    <div v-if="dataOk">
      <div id="previous-data"><DataView :header="'Current'" :data="dataBox.beforeData" /></div>
      <div id="preview-data" v-if="(transformValue.trim() !== '' && validationResult && validationResult.ok)"><DataView :header="'Preview'" :data="dataBox.afterData" /></div>
      
      <div id="validation-result" :class="{ok: (transformValue.trim() === '' || !validationResult || validationResult.ok), unknown: (!validationResult || validationResult.unknownCommand)}">
        <p>{{(!validationResult || validationResult.ok) ? 'Ok' : validationResult.text }}</p>
        <table id="command-help">
          <tr>
            <th>Command</th>
            <th>Arguments</th>
            <th>Description</th>
            <th>Applicable</th>
          </tr>
          <tr v-for="cmd in commands" :key="cmd.command.prefix">
            <td>
              {{cmd.command.prefix}}
            </td>
            <td>
              {{cmd.command.arguments}}
            </td>
            <td>
              {{cmd.command.text}}
            </td>
            <td>
              {{cmd.command.applicable.join(", ")}}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import DataEntry from './DataEntry.vue'
import TransformEntry from './TransformEntry.vue'
import DataView from './DataView.vue'
import TransformService from './../services/TransformService';

const transformService = new TransformService();

export default {
  name: 'ProcessData',
  components: {
    TransformEntry,
    DataView,
    DataEntry
  },
  data: function() {
    return {sourceData: "", dataOk: false, transformValue: '', validationResult: {ok: false, unknownCommand: true, text: ""}, commands: transformService.commands};
  },
  computed: {
    dataBox: function() {
      return transformService.createInitialData(this.sourceData);
    }
  },
  methods: {
    dataReady: function(sourceData) {
      this.sourceData = sourceData;
      this.dataOk = true;
      this.transformValue = "split row \\n";
      transformService.append(this.dataBox, this.transformValue);
    },
    transformUpdate: function(transformValue) {
      this.transformValue = transformValue;
      this.validationResult = transformService.validateTransformOp(this.dataBox, transformValue);
      if (transformService.validateTransformOp(this.dataBox, transformValue).ok) {
        transformService.preview(this.dataBox, transformValue);
      }
    },
    transformSave: function(transformValue) {
      this.transformValue = transformValue;
      if (transformService.validateTransformOp(this.dataBox, transformValue).ok) {
        transformService.append(this.dataBox, transformValue);
      }
    }
  }
}
</script>

<style scoped>
#transform-entry {
  width: 50%;
  margin: 0px auto;
  position: relative;
}
#previous-data {
  position: absolute;
  top: 45px;
  height: calc(100% - 45px);
  left: 0px;
  width: 100%;
  overflow: auto;
}
#preview-data {
  position: absolute;
  top: 45px;
  height: calc(100% - 45px);
  left: 0px;
  width: 100%;
  background: #281d35;
  overflow: auto;
}
#validation-result {
    position: absolute;
    left: 25%;
    width: 50%;
    top: 45px;
    text-align: center;
    border: 1px solid #800;
    border-top: 0px solid #FFF;
    background: rgba(128, 0,0, 0.25);
    font-size: 16px;
    font-family: monospace;
    padding: 5px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    transition: transform 0.4s, opacity 0.4s, background-color 0.2s, border-color 0.2s, height 0.2s;
}
#validation-result.ok {
  transform: translateY(-100px);
  opacity: 0;
}
#validation-result.unknown {
    border: 1px solid #08F;
    border-top: 0px solid #FFF;
    background: rgba(0, 64, 128, 0.25);
}
#command-help {
    overflow-y: scroll;
    max-height: 400px;
    display: block;
    font-size: 12px;
}
</style>
