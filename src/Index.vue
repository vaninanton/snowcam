<script setup>
import { defineAsyncComponent } from "vue";
import videos from "./videos";

const TomorrowWidget = defineAsyncComponent(
  () => import("./components/Tomorrow/TomorrowWidget.vue"),
);
const HlsVideo = defineAsyncComponent(
  () => import("./components/HlsVideo.vue"),
);
const VersionString = defineAsyncComponent(
  () => import("./components/VersionString.vue"),
);
</script>

<template>
  <TomorrowWidget />
  <ul
    class="grid max-w-full mt-10 mb-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 mx-auto gap-6 xl:gap-y-8 xl:gap-x-8 xl:max-w-full sm:px-6 xl:px-8"
  >
    <li v-for="video in videos" v-bind:key="video.title">
      <div>
        <div class="p-2 sm:p-0">
          <h2 class="font-semibold">{{ video.title }}</h2>
        </div>
        <HlsVideo
          :src="video.src"
          :poster="video.poster"
          class="aspect-video"
          muted
          controls
          allowfulscreen
          playsinline
          autoplay
        />
      </div>
    </li>
  </ul>
  <VersionString />
</template>
