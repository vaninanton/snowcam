<script setup>
import { defineAsyncComponent, ref, computed, watch } from "vue";
import videos from "./videos";

const STORAGE_KEY_PLACE = "snowcam-place-tab";

const places = computed(() => {
  const set = new Set(videos.map((v) => v.place).filter(Boolean));
  return [...set];
});

const savedPlace = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY_PLACE);
    return places.value.includes(v) ? v : places.value[0];
  } catch {
    return places.value[0];
  }
};

const activePlace = ref(savedPlace());
watch(activePlace, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY_PLACE, val);
  } catch (_) {}
});

const videosByPlace = computed(() =>
  videos.filter((v) => v.place === activePlace.value),
);

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
  <div
    v-if="places.length > 1"
    class="flex border-b border-slate-700 mb-2 sm:px-6 xl:px-8 gap-0"
  >
    <button
      v-for="place in places"
      :key="place"
      type="button"
      class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
      :class="
        activePlace === place
          ? 'border-sky-500 text-sky-400'
          : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
      "
      @click="activePlace = place"
    >
      {{ place }}
    </button>
  </div>
  <ul
    class="grid max-w-full mt-4 mb-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 mx-auto gap-4 xl:gap-y-6 xl:gap-x-8 xl:max-w-full sm:px-6 xl:px-8"
  >
    <li v-for="video in videosByPlace" v-bind:key="video.title">
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
