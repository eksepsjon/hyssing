<template>
  <div class="get-data">
    <div class="container">
      <div class="columns">
        <div class="bg-red-500">
          <textarea
            class="border-4 border-red-400"
            placeholder="Paste some data here!"
            readonly="readonly"
            autofocus
            @paste="dataPasted"
          ></textarea>
        </div>
        <div class="column">
          - or -
        </div>
        <div class="column">
          <textarea
            v-model="typedData"
            placeholder="Type some data here!"
          ></textarea>
          <button v-on:click="processData()" class="button is-primary">
            Process
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DataEntry",
  data: function() {
    return { typedData: "" };
  },
  methods: {
    dataPasted: function(event) {
      this.$emit("data", event.clipboardData.getData("text"));
    },
    processData: function() {
      this.$emit("data", this.typedData);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
