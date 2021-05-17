<template>
  <div
    class="border border-gray-900 p-2 flex flex-row items-stretch justify-start"
  >
    <div class="flex flex-col items-center justify-start p-2">
      <slot name="icon"></slot>
    </div>
    <div class="flex flex-col items-start h-full p-2">
      <span class="text-lg font-bold uppercase tracking-widest"
        ><slot></slot></span
      ><span class="text-gray-300"><slot name="description"></slot></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "Step",
};
</script>

<style></style>
