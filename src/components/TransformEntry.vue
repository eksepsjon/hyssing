<template>
    <div>
        <input type="text" placeholder="Enter transform command" v-model="transform" v-on:keyup.enter="saveTransform"/>
    </div>
</template>

<script>

export default {
  name: 'TransformEntry',
  props: ["validationResult"],
  data: function() {
      return {transform: ""};
  },
  methods: {
    saveTransform: function() {
        if (this.validationResult.ok) {
            this.$emit('save', this.transform);
            this.transform = "";
        }
    }
  },
  watch: {
    transform: function() {
        this.$emit('update', this.transform);
    }
}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div {
    background: #000;
}
input {
    border: 0px;
    background: transparent;
    color: #FFF;
    padding: 4px 20px;
    width: 100%;
    height: 100%;
    font-size: 20px;
    font-family: monospace;
}
input:focus{
    outline: none;
}
</style>
