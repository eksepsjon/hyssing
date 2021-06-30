<template>
  <div>
    <template v-if="!current">
      <div class="h-screen w-screen flex items-center justify-center">
        <next-input
          v-if="routeCmds"
          class="max-w-4xl flex-grow mr-4 mb-4"
          title="URL Recipe"
          description=""
          :commands="routeCmds"
          @text-ready="init($event)"
        />
      </div>
    </template>
    <template v-else>
      <div class="h-screen bg-gray-900 flex flex-row justify-items-stretch">
        <div
          class="
            flex-grow flex-shrink-0
            w-1/3
            max-w-sm
            flex flex-col
            items-stretch
            justify-self-stretch
          "
        >
          <div
            class="
              flex-grow-0 flex-shrink-0
              bg-indigo-800
              text-center text-xl
              p-4
            "
          >
            Hyssing
          </div>
          <div class="flex-grow bg-gray-900 flex flex-col overflow-auto">
            <div class="text-gray-500 p-4">Applied commands</div>

            <div
              class="bg-indigo-900 p-4 m-2 rounded-2xl rounded-bl-none"
              v-for="(cmd, cmdIndex) in current.appliedCommands"
              :key="cmdIndex"
            >
              <span
                v-for="(step, stepIndex) in cmd"
                :key="stepIndex + 's'"
                class="
                  inline-block
                  bg-black
                  rounded
                  mr-2
                  p-1
                  pr-2
                  pl-2
                  font-mono
                "
                >{{ step }}</span
              >
            </div>
          </div>
          <div class="flex-grow-0 flex-shrink-0 flex items-stretch">
            <div
              class="
                absolute
                left-2
                bottom-16
                z-20
                bg-red-800
                text-white text-xl
                rounded-full
                pl-8
                pr-8
                border-2 border-red-500
              "
              v-if="cmd && cmd.length && !validationResult.ok"
            >
              {{ validationResult.text }}
            </div>
            <input
              placeholder="Enter transform command here..."
              spellcheck="false"
              class="
                bg-gray-900
                text-white
                border-b-2 border-gray-700
                focus:outline-none
                font-mono
                p-2
                pl-4
                pr-4
                m-2
                flex-grow
                focus:bg-black
              "
              :class="
                validationResult.ok || (cmd && cmd.length === 0)
                  ? ''
                  : 'border-red-500'
              "
              v-model="command"
              v-on:keyup.enter="process"
            />
          </div>
        </div>
        <div class="max-h-screen overflow-auto bg-black w-full p-2">
          <next-data-view v-if="next" :data="next" />
          <next-data-view v-else :data="current" />
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
      current: window.currentData ? window.currentData : null,
      next: null,
      command: "",
      validationResult: { ok: false, unknownCommand: true, text: "" },
      commands: transformService.commands,
    };
  },
  computed: {
    routeCmds() {
      if (this.$route.params.cmd) {
        return JSON.parse(atob(this.$route.params.cmd));
      }

      return null;
    },
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
    storeCommandsInParams() {
      const cmdToStore = [];
      for (let n = 0; n < this.current.appliedCommands.length; n++) {
        cmdToStore.push(this.current.appliedCommands[n].join(" "));
      }
      this.$router.replace({
        name: "processb64",
        params: { cmd: btoa(JSON.stringify(cmdToStore)) },
      });
      return;
      window.history.replaceState(
        {},
        null,
        "#" +
          this.$route.path +
          "/" +
          encodeURIComponent(btoa(JSON.stringify(cmdToStore)))
      );
    },
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

      this.storeCommandsInParams();
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

        this.storeCommandsInParams();
      }
    },
  },
};
</script>

<style></style>
