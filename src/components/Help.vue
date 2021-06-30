<template>
  <table class="text-gray-400 border-t-4 border-indigo-700">
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
</template>

<script>
const transformService = new TransformService();

export default {
  name: "Help",
  data: function () {
    return {
      commands: transformService.commands,
    };
  },
};
</script>

<style></style>
