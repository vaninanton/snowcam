<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mx-auto">
    <li
      class="relative"
      v-for="video in videosWithSrc"
      v-bind:key="video.title"
    >
      <HlsVideo
        :src="video.src"
        :poster="video.poster"
        muted
        controls
        allowfullscreen
        playsinline
        autoplay
      />
    </li>
  </ul>
</template>

<script setup>
import { computed } from "vue";
import HlsVideo from "./components/HlsVideo.vue";
import videos from "./videos";

const videosWithSrc = computed(() => videos.filter((v) => v.src));
</script>
