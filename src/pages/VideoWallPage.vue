<script setup lang="ts">
import { computed } from "vue";
import HlsVideo from "@/components/HlsVideo.vue";
import { cameras } from "@/data/cameras";

const visibleCameras = computed(() => cameras.filter((camera) => camera.src));
</script>

<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mx-auto">
    <li class="relative" v-for="camera in visibleCameras" :key="camera.title">
      <HlsVideo
        :src="camera.src"
        :poster="camera.poster"
        muted
        controls
        allowfullscreen
        playsinline
        autoplay
      />
    </li>
  </ul>
</template>
