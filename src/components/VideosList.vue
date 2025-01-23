<script setup>
import { defineAsyncComponent } from "vue";
import videos from "../videos";

const VideoItem = defineAsyncComponent(() => import("./VideoItem.vue"));
</script>
<template>
  <ul
    class="grid max-w-[26rem] sm:max-w-[52.5rem] mt-10 sm:mt-20 md:mt-32 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mx-auto gap-6 lg:gap-y-8 xl:gap-x-8 lg:max-w-full px-4 sm:px-6 lg:px-8"
  >
    <li
      class="group relative rounded-3xl bg-slate-50 p-6 lg:p-0 dark:bg-slate-800/80 dark:highlight-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/50"
      v-for="video in videos"
      v-bind:key="video.title"
    >
      <VideoItem :video="video" />
    </li>
  </ul>
</template>
