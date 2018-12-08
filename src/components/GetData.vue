<template>
  <div class="get-data">
    <h1>Hand Me Some Data to Process</h1>
    <textarea placeholder="Paste some data here!" @paste="dataPasted"></textarea>
  </div>
</template>

<script>
export default {
  name: 'GetData',
  data: function() {
    return {};
  },
  methods: {
      dataPasted: function(event) {
          this.$emit("data", event.clipboardData.getData("text"));
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
textarea {
    width: 400px;
    height: 200px;
    font-size: 20px;
    padding: 20px;
    border-radius: 15px;
}
</style>
