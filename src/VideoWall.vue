<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mx-auto">
    <li class="relative" v-for="video in videos" v-bind:key="video.title">
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
import HlsVideo from "./components/HlsVideo.vue";
import videos from "./videos";
</script>
