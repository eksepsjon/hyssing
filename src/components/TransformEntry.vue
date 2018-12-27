<template>
    <div>
        <input type="text" autofocus placeholder="Enter transform command" v-model="transform" v-on:keyup.enter="saveTransform"/>
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
input {
    border: 0px;
    background: rgba(0, 0, 0, 0.0);
    color: #FFF;
    padding: 4px 20px;
    font-size: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    width: 100%;
    border-radius: 5px;
    transition: background-color 0.4s, border-color 0.4s;
}
input:focus{
    outline: none;
    border: 1px solid rgba(255, 255, 255, 0.8);
    background: rgba(0, 0, 0, 0.2);
}
</style>
