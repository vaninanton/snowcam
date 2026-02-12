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

function clearCacheAndReload() {
  localStorage.removeItem("tomorrowioData");
  document.cookie = "addToHomescreenCalled=; Max-Age=-99999999;";
  window.location.reload();
}
</script>

<template>
  <TomorrowWidget />
  <ul
    class="grid max-w-full mt-4 mb-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 mx-auto gap-4 xl:gap-y-6 xl:gap-x-8 xl:max-w-full sm:px-6 xl:px-8"
  >
    <li v-for="video in videos" v-bind:key="video.title">
      <div>
        <div class="p-2 sm:p-0">
          <h2 class="font-semibold">
            {{ video.title
            }}<template v-if="video.elevation"
              >, {{ video.elevation }} м</template
            >
          </h2>
        </div>
        <HlsVideo
          :src="video.src"
          :poster="video.poster"
          class="aspect-video"
          muted
          controls
          allowfullscreen
          playsinline
          autoplay
        />
      </div>
    </li>
  </ul>
  <VersionString @click="clearCacheAndReload" />
</template>
