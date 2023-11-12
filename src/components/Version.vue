<script setup>
const version = import.meta.env.VITE_BUILD_VERSION;
</script>
<template>
  <div
    class="bottom-0 right-0 text-right text-xs pr-4 pb-2"
    v-if="version"
    v-once
  >
    ver: {{ version.slice(0, 7) }}
  </div>
</template>
