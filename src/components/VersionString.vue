<script setup lang="ts">
import { computed } from "vue";

defineEmits<{
  click: [];
}>();

/** VITE_BUILD_VERSION подставляется в CI как github.sha. */
const version = computed(() => {
  const sha = import.meta.env.VITE_BUILD_VERSION;
  return sha ? sha.slice(0, 7) : "develop";
});
</script>

<template>
  <div
    class="bottom-0 right-0 text-right text-xs pr-4 pb-2 cursor-pointer hover:underline"
    @click="$emit('click')"
  >
    ver: {{ version }}
  </div>
</template>
