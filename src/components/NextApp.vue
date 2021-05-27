<template>
  <div>
    <template v-if="!current">
      <next-input-area class="h-screen" @text-ready="init($event)" />
    </template>
    <template v-else>
      <div class="h-screen bg-gray-900 flex flex-col justify-items-stretch">
        <next-data-view v-if="next" class="text-white flex-grow" :data="next" />
        <next-data-view v-else class="text-white flex-grow" :data="current" />
        <div class="flex-none">
          <div
            class="
              absolute
              right-2
              bottom-2
              z-20
              bg-red-800
              text-white text-xl
              rounded-full
              pl-8
              pr-8
              border-2 border-red-500
            "
            v-if="
              command !== 'help' && cmd && cmd.length && !validationResult.ok
            "
          >
            {{ validationResult.text }}
          </div>
          <table
            v-if="command === 'help'"
            class="
              text-gray-400
              border-t-4 border-indigo-700
              w-full
              rounded-lg
              text
            "
          >
            <tr
              v-for="help in commands"
              :key="help.command.prefix"
              class="even:bg-indigo-900 odd:bg-indigo-800"
            >
              <td class="p-2">
                <span
                  class="
                    text-white
                    inline-block
                    bg-black
                    rounded
                    p-1
                    pr-2
                    pl-2
                    font-mono
                  "
                  >{{ help.command.prefix }}</span
                >
              </td>
              <td>{{ help.command.arguments }}</td>
              <td>{{ help.command.text }}</td>
              <td>{{ help.command.applicable }}</td>
            </tr>
          </table>
          <input
            placeholder=" > Type help to list of commands..."
            spellcheck="false"
            class="
              w-full
              bg-gray-900
              focus:bg-black
              text-white
              border-t-2 border-gray-700
              focus:outline-none
              font-mono
              p-2
              text-lg
            "
            :class="
              validationResult.ok || (cmd && cmd.length === 0)
                ? 'border-green-700'
                : 'border-red-500'
            "
            v-model="command"
            v-on:keyup.enter="process"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import NextInputArea from "./NextInputArea.vue";
import NextDataView from "./NextDataView.vue";
import TransformService from "./../services/TransformService";
const transformService = new TransformService();

export default {
  name: "nextapp",
  components: { NextInputArea, NextDataView },
  data: function () {
    return {
      initial: "",
      current: window.currentData ? window.currentData : null,
      next: null,
      command: "",
      validationResult: { ok: false, unknownCommand: true, text: "" },
      commands: transformService.commands,
    };
  },
  computed: {
    cmd() {
      return transformService.arrify(this.command);
    },
  },
  watch: {
    command() {
      this.preview();
    },
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
        } else {
          this.command = commands[n];
        }
      }

      this.current = current;
      this.next = null;
      this.command = "";
    },
    preview() {
      this.validationResult = transformService.validateTransformOp(
        this.current,
        this.cmd
      );
      this.next = transformService.transform(this.current, this.cmd);
    },
    process() {
      const next = transformService.transform(this.current, this.cmd);
      if (next) {
        this.current = next;
        this.next = null;
        this.command = "";
      }
    },
  },
};
</script>

<style></style>
