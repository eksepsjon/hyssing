<template>
  <div class="">
    <next-input
      class="max-w-sm"
      v-for="inp in inputs"
      :title="inp.title"
      :commands="inp.commands"
      :key="inp.title"
      @text-ready="$emit('text-ready', $event)"
    />
  </div>
</template>

<script>
import NextInput from "./NextInput.vue";

export default {
  name: "nextinput",
  components: { NextInput },
  data: function () {
    return {
      initial: "",
    };
  },
  computed: {
    inputs() {
      return [{ title: "Vanilla", commands: ["splitrow \\\\n"] }];
    },
  },
  methods: {
    init(text) {
      this.$emit("text-ready", { text, commands: ["splitrow \\\\n"] });
    },
  },
};
</script>

<style></style>
