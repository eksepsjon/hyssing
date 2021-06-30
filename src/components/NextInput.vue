<template>
  <div class="bg-gray-800 p-4 rounded-2xl border-2 border-green-300">
    <label>
      <h3
        class="text-white text-2xl border-b-2 text-center border-green-700 pb-3"
      >
        {{ title }}
      </h3>
      <!--
      <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z"
        />
      </svg>-->
      <textarea
        v-model="initial"
        :placeholder="description + '\n' + commands"
        class="
          font-mono
          bg-transparent
          w-full
          mt-3
          h-20
          text-white
          focus:outline-none
        "
      ></textarea>
    </label>
  </div>
</template>

<script>
export default {
  name: "nextinput",
  components: {},
  props: ["title", "commands", "description"],
  data: function () {
    return {
      initial: "",
    };
  },
  watch: {
    initial(text) {
      this.$emit("text-ready", { text, commands: this.commands });
    },
  },
  computed: {},
};
</script>

<style></style>
