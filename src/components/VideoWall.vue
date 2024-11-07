<script setup>
import { defineAsyncComponent } from "vue";

const VideoWallItem = defineAsyncComponent(() => import("./VideoWallItem.vue"));

const videos = [
  {
    title: "Ледник Богдановича",
    description: "Верхняя станция",
    src: "https://ipcam.kz/cam6/index.m3u8",
    poster: "/previews/3212b47c65ccc0cb9759f5c08632c563.jpg",
  },
  {
    title: "Средняя станция",
    description: "Средняя станция",
    src: "https://ipcam.kz/cam5/index.m3u8",
    poster: "/previews/ffa10e45b1d87ab0aa8796bc7969046c.jpg",
  },
  {
    title: "Бугель",
    description: "Базовая станция",
    src: "https://ipcam.kz/cam2/index.m3u8",
    poster: "/previews/d5361ff25a96271df9ac614d9138806a.jpg",
  },
  {
    title: "Подъемник",
    description: "Базовая станция",
    src: "https://ipcam.kz/cam1/index.m3u8",
    poster: "/previews/197f1dde9a2c929cca5496f225cc2d62.jpg",
  },
];
</script>
<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mx-auto">
    <li class="relative" v-for="video in videos" v-bind:key="video.title">
      <VideoWallItem :video="video" />
    </li>
  </ul>
</template>
