<template>
  <div class="get-data">
    <div class="container">
      <div class="columns">
        <div class="column">
          <textarea placeholder="Paste some data here!" autofocus @paste="dataPasted"></textarea>
        </div>
        <div class="column">
          - or -
        </div>
        <div class="column">
          <textarea v-model="typedData" placeholder="Type some data here!"></textarea>
          <button v-on:click="processData()" class="button is-primary">Process</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataEntry',
  data: function() {
    return {typedData: ""};
  },
  methods: {
      dataPasted: function(event) {
          this.$emit("data", event.clipboardData.getData("text"));
      },
      processData: function() {
          this.$emit("data", this.typedData);
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
    width: 100%;
    height: 200px;
    font-size: 20px;
    padding: 20px;
    border-radius: 5px;
}
.column:first-child textarea {
    height: 240px;
}
.button {
    width: 100%;
}
</style>
