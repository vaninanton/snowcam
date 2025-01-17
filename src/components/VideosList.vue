<script setup>
import { defineAsyncComponent } from "vue";

const VideoItem = defineAsyncComponent(() => import("./VideoItem.vue"));

const videos = [
  {
    title: "3200",
    description: "Верхняя станция Комби-2",
    src: "https://ipcam.kz/cam6/index.m3u8",
    poster: "/previews/3212b47c65ccc0cb9759f5c08632c563.jpg",
  },
  {
    title: "2800",
    description: "2800 Комби-2",
    src: "https://ipcam.kz/cam5/index.m3u8",
    poster: "/previews/ffa10e45b1d87ab0aa8796bc7969046c.jpg",
  },
  {
    title: "Подъемник",
    description: "Базовая станция",
    src: "https://ipcam.kz/cam1/index.m3u8",
    poster: "/previews/197f1dde9a2c929cca5496f225cc2d62.jpg",
  },
  {
    title: "Бугель",
    description: "Базовая станция",
    src: "https://ipcam.kz/cam2/index.m3u8",
    poster: "/previews/d5361ff25a96271df9ac614d9138806a.jpg",
  },
];
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
