<template>
  <div class="flex flex-row flex-wrap">
    <next-input
      class="max-w-4xl flex-grow mr-4 mb-4"
      v-for="inp in inputs"
      :title="inp.title"
      :description="inp.description"
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
      return [
        {
          title: "No Recipe",
          description: "No commands are applied.",
          commands: ["splitrow \\\\n"],
        },
        {
          title: "Line-by-line",
          description: "Split text by line breaks.",
          commands: ["splitrow \\\\n"],
        },
        {
          title: "Encode to base64",
          description: "Encode text with base64.",
          commands: ["base64"],
        },
        {
          title: "Decode from base64",
          description: "Decode base64 text.",
          commands: ["unbase64"],
        },
      ];
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
