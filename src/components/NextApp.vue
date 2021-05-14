<template>
  <div>
    <template v-if="!current">
      <next-input class="h-screen" @text-ready="init($event)" />
    </template>
    <template v-else>
      <div class="h-screen bg-gray-800 flex flex-col justify-items-stretch">
        <next-data-view v-if="next" class="text-white flex-grow" :data="next" />
        <next-data-view v-else class="text-white flex-grow" :data="current" />
        <div class="flex-none p-2">
          <div
            class="
              absolute
              right-2
              bottom-2
              z-20
              bg-red-800
              text-white
              p-2
              text-xl
              border-2 border-red-500
            "
            v-if="cmd && cmd.length && !validationResult.ok"
          >
            {{ validationResult.text }}
          </div>
          <table
            v-if="validationResult.unknownCommand"
            class="
              text-gray-400
              border-2 border-indigo-700
              w-full
              rounded-lg
              text-xs
            "
          >
            <tr
              v-for="help in commands"
              :key="help.command.prefix"
              class="even:bg-gray-900"
            >
              <td>
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
            spellcheck="false"
            class="
              w-full
              bg-gray-900
              focus:bg-black
              text-white
              border-2 border-indigo-700
              focus:outline-none
              p-2
              text-lg
            "
            :class="
              validationResult.ok || (cmd && cmd.length === 0)
                ? 'border-indigo-700'
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
import NextInput from "./NextInput.vue";
import NextDataView from "./NextDataView.vue";
import TransformService from "./../services/TransformService";
const transformService = new TransformService();

export default {
  name: "nextapp",
  components: { NextInput, NextDataView },
  data: function () {
    return {
      initial: "",
      current: null,
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
    init(text) {
      this.current = { rows: 1, cols: 1, type: "text", data: [[text]] };
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
