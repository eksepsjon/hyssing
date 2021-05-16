<template>
  <div class="flex flex-col bg-gray-900">
    <h1 class="text-4xl m-8 text-white text-center">hyssing</h1>
    <div class="p-2">
      <next-input
        class="max-w-sm"
        v-for="inp in inputs"
        :title="inp.title"
        :commands="inp.commands"
        :key="inp.title"
        @text-ready="$emit('text-ready', $event)"
      />
    </div>
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
      return [{ title: "Plain", commands: ["splitrow \\\\n"] }];
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
