<template>
  <table class="data-view">
    <tr>
      <th v-for="n in  1 + localData.columns" :key="n">{{ n > 1 ? n - 1 : '' }}</th>
    </tr>
    <tr v-for="(row, index) in localData.rows" :key="index">
        <th>{{index + 1}}</th>
        <td v-for="(val, index2) in row" :key="index2">{{val}}</td>
    </tr>
  </table>
</template>

<script>
export default {
  name: 'DataView',
  props: ["data"],
  data: function() {
    return {
        localData: this.data
        };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    td {
        padding: 5px;
    }
</style>
