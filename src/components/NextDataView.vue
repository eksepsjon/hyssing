<template>
  <div class="w-full bg-gray-900 h-full p-2">
    <table class="w-full">
      <tr>
        <th
          class="bg-indigo-800 border-2 border-gray-800 p-2"
          v-for="n in 1 + data.cols"
          :key="n"
        >
          {{ n > 1 ? n - 1 : "" }}
        </th>
      </tr>
      <tr v-for="row in data.rows" :key="'r' + row">
        <th class="bg-gray-800 p-2 w-1/12 border-2 border-gray-800">
          {{ row }}
        </th>
        <td
          class="p-2 bg-black border-2 border-gray-800"
          v-for="col in data.cols"
          :key="'r' + row + 'c' + col"
        >
          <pre>{{ data.data[row - 1][col - 1] }}</pre>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: "NextDataView",
  props: ["data"],
};
</script>
