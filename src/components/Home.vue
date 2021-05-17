<template>
  <div class="flex flex-col items-center justify-between min-h-screen">
    <div class="flex flex-col items-center w-full max-w-4xl">
      <div class="w-full flex flex-row bg-gray-700 rounded-xl mt-8">
        <h1 class="text-4xl m-16 text-center w-1/2">hyssing</h1>
        <div
          class="
            bg-gray-800
            flex flex-col
            items-stretch
            rounded-xl
            justify-between
            w-1/2
            m-8
          "
        >
          <step>
            Paste
            <template v-slot:description
              >Paste your text in a recipe box</template
            >
            <template v-slot:icon>
              <svg
                class="w-8 h-8 m-4 rounded-full text-green-300 flex-none"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z"
                />
              </svg>
            </template>
          </step>
          <step>
            Transform
            <template v-slot:description
              >Enter commands to transform the text</template
            >
            <template v-slot:icon>
              <svg
                class="w-8 h-8 m-4 rounded-full text-blue-300 flex-none"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M13,19V16H21V19H13M8.5,13L2.47,7H6.71L11.67,11.95C12.25,12.54 12.25,13.5 11.67,14.07L6.74,19H2.5L8.5,13Z"
                />
              </svg>
            </template>
          </step>
          <step>
            Repeat
            <template v-slot:description
              >Bookmark the commands and repeat the transformation again and
              again.</template
            >
            <template v-slot:icon>
              <svg
                class="w-8 h-8 m-4 rounded-full text-yellow-300 flex-none"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z"
                />
              </svg>
            </template>
          </step>
        </div>
      </div>
      <h2 class="text-2xl m-8">"Paste &amp; Go" Recipes</h2>
      <div class="bg-green-900 p-4 rounded-xl w-full">
        <next-input-area @text-ready="init($event)" />
      </div>
    </div>
    <div
      class="p-8 w-full bg-black text-gray-400 mt-16 flex flex-col items-center"
    >
      <div class="w-full max-w-3xl">
        <a
          href="https://github.com/eksepsjon/hyssing"
          class="flex flex-row hover:underline items-center"
        >
          <svg class="w-8 h-8 m-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
            />
          </svg>
          Check out on GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import NextInputArea from "./NextInputArea.vue";
import Step from "./Step.vue";
import TransformService from "./../services/TransformService";
const transformService = new TransformService();

export default {
  name: "home",
  components: { NextInputArea, Step },
  data: function () {
    return {
      commands: transformService.commands,
    };
  },
  methods: {
    init({ text, commands }) {
      let current = { rows: 1, cols: 1, type: "text", data: [[text]] };

      for (let n = 0; n < commands.length; n++) {
        const next = transformService.transform(
          current,
          transformService.arrify(commands[n])
        );
        console.log("Apply command", commands[n], current, next);
        if (next) {
          current = next;
        }
      }

      window.currentData = current;
      this.$router.push({ name: "process" });
    },
  },
};
</script>

<style></style>
