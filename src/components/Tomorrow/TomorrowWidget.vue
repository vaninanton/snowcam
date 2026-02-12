<script setup>
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import TimelineItem from "./TimelineItem.vue";
import WeatherIcon from "./WeatherIcon.vue";
import WindCompass from "./WindCompass.vue";
import { TOMORROW_TIMELINE_URL, buildTimelineQueryString } from "./config";

const weatherData = ref({
  current: null,
  daily: null,
  hourly: null,
});

const current = computed(() => weatherData.value.current);
const values = computed(() => current.value?.values ?? {});

const currentTemp = computed(() => {
  const v = values.value.temperature;
  return v != null ? Math.floor(v) : "-";
});

const feelsLike = computed(() => {
  const v = values.value.temperatureApparent;
  return v != null ? Math.floor(v) : null;
});

const windSpeed = computed(() => {
  const v = values.value.windSpeed;
  return v != null ? Math.round(Number(v)) : null;
});

const windDirection = computed(() => {
  const v = values.value.windDirection;
  return v != null ? Number(v) : null;
});

const windGust = computed(() => {
  const v = values.value.windGust;
  return v != null ? Math.round(Number(v)) : null;
});

const visibilityKm = computed(() => {
  const v = values.value.visibility;
  if (v == null) return null;
  const num = Number(v);
  // API при units=metric возвращает видимость уже в км
  const km = num >= 1000 ? num / 1000 : num;
  return km >= 1 ? Math.round(km) : km.toFixed(1);
});

const snowDepthCm = computed(() => {
  const v = values.value.snowDepth;
  return v != null ? Math.round(Number(v)) : null;
});

const humidity = computed(() => {
  const v = values.value.humidity;
  return v != null ? Math.round(Number(v)) : null;
});

const precipProbability = computed(() => {
  const v = values.value.precipitationProbability;
  return v != null ? Math.round(Number(v)) : null;
});

async function fetchWeatherData() {
  const instance = getCurrentInstance();
  const $http = instance?.appContext?.config?.globalProperties?.$http;
  if (!$http) return;

  const cachedData = localStorage.getItem("tomorrowioData");
  let data = null;

  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    const sixHoursMs = 6 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp < sixHoursMs) {
      data = parsed.data;
    } else {
      localStorage.removeItem("tomorrowioData");
    }
  }

  if (!data) {
    data = await $http.get(
      `${TOMORROW_TIMELINE_URL}?${buildTimelineQueryString()}`,
    );
    localStorage.setItem(
      "tomorrowioData",
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  }

  const { timelines } = data.data;
  const currentTimeline = timelines.find((el) => el.timestep === "current");
  const dailyTimeline = timelines.find((el) => el.timestep === "1d");
  const hourlyTimeline = timelines.find((el) => el.timestep === "1h");

  weatherData.value = {
    current: currentTimeline?.intervals?.[0] ?? null,
    daily: dailyTimeline?.intervals ?? null,
    hourly: hourlyTimeline?.intervals ?? null,
  };
}

onMounted(() => {
  fetchWeatherData();
});
</script>

<template>
  <div>
    <div v-if="$isLoading">Загрузка данных...</div>
    <div v-else>
      <div
        class="flex flex-row items-center gap-4 mb-2 my-4 px-1 sm:px-0 sm:max-w-2xl sm:mx-auto"
      >
        <div class="flex items-center gap-3 shrink-0 cursor-pointer">
          <WeatherIcon
            v-if="current"
            :timeline="current"
            class="w-14 h-14 sm:w-16 sm:h-16 shrink-0"
          />
          <div>
            <div class="text-4xl sm:text-5xl font-extralight leading-none">
              {{ currentTemp }}<sup>°</sup>
            </div>
            <p v-if="feelsLike !== null" class="text-slate-500 text-xs mt-0.5">
              Ощущается {{ feelsLike }}°
            </p>
          </div>
        </div>
        <div
          class="text-slate-400 text-xs min-w-0 flex-1 flex flex-wrap items-baseline gap-x-1 gap-y-0.5"
        >
          <template v-if="windSpeed !== null">
            <span class="whitespace-nowrap inline-flex items-center gap-1">
              <WindCompass
                v-if="windDirection !== null"
                :wind-direction="windDirection"
                class="inline-block text-sm align-middle mr-0.5 shrink-0"
              />
              <span
                >Ветер {{ windSpeed }} м/с<span
                  v-if="windGust !== null && windGust > windSpeed"
                >
                  (до {{ windGust }})</span
                ></span
              >
            </span>
          </template>
          <template v-if="visibilityKm !== null">
            <span v-if="windSpeed !== null" class="text-slate-600">·</span>
            <span class="whitespace-nowrap"
              >Видимость {{ visibilityKm }} км</span
            >
          </template>
          <template v-if="snowDepthCm !== null">
            <span
              v-if="windSpeed !== null || visibilityKm !== null"
              class="text-slate-600"
              >·</span
            >
            <span class="whitespace-nowrap">Снег {{ snowDepthCm }} см</span>
          </template>
          <template v-if="humidity !== null">
            <span
              v-if="
                windSpeed !== null ||
                visibilityKm !== null ||
                snowDepthCm !== null
              "
              class="text-slate-600"
              >·</span
            >
            <span class="whitespace-nowrap">Влажность {{ humidity }}%</span>
          </template>
          <template v-if="precipProbability !== null && precipProbability > 0">
            <span
              v-if="
                windSpeed !== null ||
                visibilityKm !== null ||
                snowDepthCm !== null ||
                humidity !== null
              "
              class="text-slate-600"
              >·</span
            >
            <span class="whitespace-nowrap"
              >Осадки {{ precipProbability }}%</span
            >
          </template>
        </div>
      </div>

      <div
        class="flex snap-x snap-mandatory overflow-x-scroll w-full divide-x divide-gray-800 bg-white/5 py-1 min-w-0"
      >
        <div
          class="flex-1 transition-colors"
          v-for="item in weatherData.hourly"
          v-bind:key="item.startTime"
        >
          <TimelineItem :timeline="item" />
        </div>
      </div>
    </div>
  </div>
</template>
