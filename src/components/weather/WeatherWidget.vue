<script setup lang="ts">
import { computed, onMounted } from "vue";
import TimelineItem from "./TimelineItem.vue";
import WeatherIcon from "./WeatherIcon.vue";
import WindCompass from "./WindCompass.vue";
import { useWeather } from "@/composables/useWeather";

const { isLoading, error, current, hourly, load } = useWeather();

const values = computed(() => current.value?.values ?? {});

const currentTemp = computed(() => floorOrNull(values.value.temperature));
const feelsLike = computed(() => floorOrNull(values.value.temperatureApparent));
const windSpeed = computed(() => roundOrNull(values.value.windSpeed));
const windDirection = computed(() => values.value.windDirection ?? null);
const windGust = computed(() => roundOrNull(values.value.windGust));
const humidity = computed(() => roundOrNull(values.value.humidity));
const snowDepthCm = computed(() => roundOrNull(values.value.snowDepth));
const precipProbability = computed(() =>
  roundOrNull(values.value.precipitationProbability),
);

const visibilityKm = computed(() => {
  const raw = values.value.visibility;
  if (raw === undefined) return null;
  // При units=metric API отдаёт видимость уже в км
  const km = raw >= 1000 ? raw / 1000 : raw;
  return km >= 1 ? String(Math.round(km)) : km.toFixed(1);
});

/** Показатели строки под температурой — в порядке вывода, разделитель ставится между непустыми. */
const details = computed(() => {
  const items: string[] = [];
  if (windSpeed.value !== null) {
    const gust =
      windGust.value !== null && windGust.value > windSpeed.value
        ? ` (до ${windGust.value})`
        : "";
    items.push(`Ветер ${windSpeed.value} м/с${gust}`);
  }
  if (visibilityKm.value !== null)
    items.push(`Видимость ${visibilityKm.value} км`);
  if (snowDepthCm.value !== null) items.push(`Снег ${snowDepthCm.value} см`);
  if (humidity.value !== null) items.push(`Влажность ${humidity.value}%`);
  if (precipProbability.value !== null && precipProbability.value > 0)
    items.push(`Осадки ${precipProbability.value}%`);
  return items;
});

// API отдаёт не только undefined, но и явный null (например, snowDepth вне
// США), а Math.round(null) === 0 — без этой проверки в виджете появляется
// выдуманный «Снег 0 см»
function floorOrNull(value: number | null | undefined): number | null {
  return value == null ? null : Math.floor(value);
}

function roundOrNull(value: number | null | undefined): number | null {
  return value == null ? null : Math.round(value);
}

onMounted(load);
</script>

<template>
  <div>
    <div v-if="isLoading" class="px-1 py-4 sm:px-0 sm:max-w-2xl sm:mx-auto">
      Загрузка данных...
    </div>
    <div
      v-else-if="error"
      class="px-1 py-4 text-slate-500 sm:px-0 sm:max-w-2xl sm:mx-auto"
    >
      Погода недоступна
    </div>
    <div v-else>
      <div
        class="flex flex-row items-center gap-4 mb-2 my-4 px-1 sm:px-0 sm:max-w-2xl sm:mx-auto"
      >
        <div class="flex items-center gap-3 shrink-0">
          <WeatherIcon
            v-if="current"
            :timeline="current"
            class="w-14 h-14 sm:w-16 sm:h-16 shrink-0"
          />
          <div>
            <div class="text-4xl sm:text-5xl font-extralight leading-none">
              {{ currentTemp ?? "-" }}<sup>°</sup>
            </div>
            <p v-if="feelsLike !== null" class="text-slate-500 text-xs mt-0.5">
              Ощущается {{ feelsLike }}°
            </p>
          </div>
        </div>
        <div
          class="text-slate-400 text-xs min-w-0 flex-1 flex flex-wrap items-baseline gap-x-1 gap-y-0.5"
        >
          <template v-for="(item, index) in details" :key="item">
            <span v-if="index > 0" class="text-slate-600">·</span>
            <span class="whitespace-nowrap inline-flex items-center gap-1">
              <WindCompass
                v-if="index === 0 && windDirection !== null"
                :wind-direction="windDirection"
                class="text-sm align-middle mr-0.5 shrink-0"
              />
              {{ item }}
            </span>
          </template>
        </div>
      </div>

      <div
        class="flex snap-x snap-mandatory overflow-x-scroll w-full divide-x divide-gray-800 bg-white/5 py-1 min-w-0"
      >
        <div class="flex-1" v-for="item in hourly" :key="item.startTime">
          <TimelineItem :timeline="item" />
        </div>
      </div>
    </div>
  </div>
</template>
