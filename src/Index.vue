<script setup>
import { defineAsyncComponent } from "vue";

const TomorrowWidget = defineAsyncComponent(
  () => import("./components/Tomorrow/TomorrowWidget.vue"),
);
const VideosList = defineAsyncComponent(
  () => import("./components/VideosList.vue"),
);
const VersionString = defineAsyncComponent(
  () => import("./components/VersionString.vue"),
);
</script>

<template>
  <TomorrowWidget />
  <VideosList />
  <VersionString />
</template>
