<template>
  <div class="flex flex-col bg-gray-800">
    <h1 class="text-4xl m-8 mb-0 text-white text-center">hyssing</h1>
    <textarea
      v-model="initial"
      class="
        flex-grow
        m-8
        p-4
        rounded-lg
        text-lg
        bg-gray-900
        text-white
        border-2 border-indigo-700
        focus:outline-none
        focus:ring-2 focus:ring-indigo-300
      "
    ></textarea>
    <button
      @click="init(initial)"
      class="
        flex-none
        m-8
        mt-0
        p-4
        rounded-lg
        bg-indigo-700
        hover:bg-indigo-600
        hover:border-indigo-300
        text-white
        border-2 border-indigo-700
        focus:outline-none
        focus:ring-2 focus:ring-indigo-300
      "
    >
      Go!
    </button>
  </div>
</template>

<script>
export default {
  name: "nextinput",
  components: {},
  data: function () {
    return {
      initial: "",
    };
  },
  computed: {},
  methods: {
    init(text) {
      this.$emit("text-ready", text);
    },
  },
};
</script>

<style></style>
