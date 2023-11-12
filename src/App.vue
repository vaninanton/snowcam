<script setup>
import { defineAsyncComponent } from "vue";

const Videos = defineAsyncComponent(() => import("./components/Videos.vue"));
const Weather = defineAsyncComponent(() => import("./components/Weather.vue"));
const Version = defineAsyncComponent(() => import("./components/Version.vue"));
</script>

<template>
  <Version />
  <Weather />
  <Videos />
</template>
