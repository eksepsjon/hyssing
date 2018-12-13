<template>
  <div>
    <table class="data-view">
      <tr class="header">
        <th></th>
        <th colspan="99999">{{header}}</th>
      </tr>
      <tr>
        <th v-for="n in  1 + localData.columns" :key="n">{{ n > 1 ? n - 1 : '' }}</th>
      </tr>
      <tr v-for="(row, index) in localData.rows" :key="index">
          <th class="vertical">{{index + 1}}</th>
          <td v-for="(val, index2) in row" :key="index2"><pre>{{val}}</pre></td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: 'DataView',
  props: ["data", "header"],
  data: function() {
    return {
        localData: this.data
        };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    td, th {
        padding: 5px;
    }
    th.vertical {
      text-align: right;
    }
    div {
      overflow: auto;
    }
</style>
