<template>
  <div><input type="text" placeholder="Enter transform command" v-model="currentTransform" /></div>
</template>

<script>
export default {
  name: 'TransformEntry',
  data: function() {
    return {"currentTransform": ""};
  },
  methods: {
    
  },
  watch: {
    currentTransform: function() {
        this.$emit('update', this.currentTransform);
        // or generate/simulate a native events (not sure how, but its outside Vue's realm I think
    }
}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input {
    border: 0px;
    background: transparent;
    color: #FFF;
    padding: 0px 20px;
    width: 100%;
    height: 100%;
}
input:focus{
    outline: none;
}
</style>
