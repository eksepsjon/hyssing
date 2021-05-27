<template>
  <div class="w-full h-full p-1">
    <table class="w-full">
      <tr>
        <th
          class="border-gray-800 p-2"
          v-for="n in 1 + data.cols"
          :key="n"
          :class="n > 1 ? 'border-l-2' : 'border-b-2'"
        >
          <span
            v-if="n > 1"
            class="
              bg-green-700
              rounded-full
              text-center
              w-7
              h-7
              flex
              items-center
              justify-center
            "
            >{{ n > 1 ? n - 1 : "" }}</span
          >
        </th>
      </tr>
      <tr v-for="row in data.rows" :key="'r' + row">
        <th class="p-2 w-7 border-t-2 border-gray-800 text-right">
          <span
            class="
              bg-green-700
              rounded-full
              w-7
              h-7
              flex
              items-center
              justify-center
            "
          >
            {{ row }}
          </span>
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
