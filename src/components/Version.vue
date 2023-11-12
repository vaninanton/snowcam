<script setup>
const version = import.meta.env.VITE_BUILD_VERSION;
</script>
<template>
  <div
    class="fixed bottom-0 right-0 text-right pr-2 pb-2 pointer-events-none"
    v-if="version"
  >
    {{ version }}
  </div>
</template>
