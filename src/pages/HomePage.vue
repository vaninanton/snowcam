<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { cameras, places } from "@/data/cameras";
import { clearCache } from "@/composables/useWeather";

const STORAGE_KEY_PLACE = "snowcam-place-tab";

const WeatherWidget = defineAsyncComponent(
  () => import("@/components/weather/WeatherWidget.vue"),
);
const HlsVideo = defineAsyncComponent(
  () => import("@/components/HlsVideo.vue"),
);
const VersionString = defineAsyncComponent(
  () => import("@/components/VersionString.vue"),
);

function readSavedPlace(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PLACE);
    if (saved !== null && places.includes(saved)) return saved;
  } catch {
    // localStorage недоступен — берём первую локацию
  }
  return places[0] ?? "";
}

const activePlace = ref(readSavedPlace());

watch(activePlace, (place) => {
  try {
    localStorage.setItem(STORAGE_KEY_PLACE, place);
  } catch {
    // localStorage недоступен (приватный режим, отключённые куки)
  }
});

const visibleCameras = computed(() =>
  cameras.filter((camera) => camera.place === activePlace.value && camera.src),
);

/** Сбрасывает кэш погоды и подсказку об установке, затем перезагружает страницу. */
function clearCacheAndReload(): void {
  clearCache();
  document.cookie = "addToHomescreenCalled=; Max-Age=-99999999;";
  window.location.reload();
}
</script>

<template>
  <WeatherWidget />
  <div
    v-if="places.length > 1"
    class="flex border-b border-slate-700 mt-2 mb-2 sm:px-6 xl:px-8 gap-0"
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
    <li v-for="camera in visibleCameras" :key="camera.title">
      <div>
        <div class="p-2 sm:p-0">
          <h2 class="font-semibold">
            {{ camera.title
            }}<template v-if="camera.elevation"
              >, {{ camera.elevation }} м</template
            >
          </h2>
        </div>
        <HlsVideo
          :src="camera.src"
          :poster="camera.poster"
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
