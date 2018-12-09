<template>
  <div class="get-data">
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
textarea {
    width: 500px;
    height: 100px;
    font-size: 20px;
    padding: 20px;
    border-radius: 15px;
}
</style>
