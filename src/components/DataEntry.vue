<template>
  <div class="get-data">
    <h1 class="title">hyssing</h1>
    <textarea placeholder="Paste some data here!" @paste="dataPasted"></textarea>
  </div>
</template>

<script>
export default {
  name: 'DataEntry',
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
div {
  text-align: center;
  margin-top: 30px;
}
textarea {
    width: 500px;
    height: 100px;
    font-size: 20px;
    padding: 20px;
    border-radius: 15px;
}
</style>
