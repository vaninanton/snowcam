<script setup lang="ts">
import { computed, onMounted } from "vue";
import TimelineItem from "./TimelineItem.vue";
import WeatherIcon from "./WeatherIcon.vue";
import WindCompass from "./WindCompass.vue";
import { deriveConditions } from "./conditions";
import { useWeather } from "@/composables/useWeather";

const { isLoading, error, current, hourly, pastHourly, daily, load } =
  useWeather();

const values = computed(() => current.value?.values ?? {});

const conditions = computed(() =>
  deriveConditions(current.value, pastHourly.value, daily.value),
);

const currentTemp = computed(() => floorOrNull(values.value.temperature));
const feelsLike = computed(() => floorOrNull(values.value.temperatureApparent));
const windSpeed = computed(() => roundOrNull(values.value.windSpeed));
const windDirection = computed(() => values.value.windDirection ?? null);
const windGust = computed(() => roundOrNull(values.value.windGust));
const humidity = computed(() => roundOrNull(values.value.humidity));
const precipProbability = computed(() =>
  roundOrNull(values.value.precipitationProbability),
);

const visibilityKm = computed(() => {
  const raw = values.value.visibility;
  if (raw == null) return null;
  // При units=metric API отдаёт видимость уже в км
  const km = raw >= 1000 ? raw / 1000 : raw;
  return km >= 1 ? String(Math.round(km)) : km.toFixed(1);
});

/** Строка под температурой. Разделитель ставится только между непустыми. */
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
  if (humidity.value !== null) items.push(`Влажность ${humidity.value}%`);
  if (precipProbability.value !== null && precipProbability.value > 0)
    items.push(`Осадки ${precipProbability.value}%`);
  const { tempMin, tempMax } = conditions.value;
  if (tempMin !== null && tempMax !== null)
    items.push(`Ночью ${Math.round(tempMin)}° / днём ${Math.round(tempMax)}°`);
  const uv = conditions.value.uvIndexMax;
  // На 3200 м со снегом УФ жжёт заметно сильнее, но при слабом смысла нет
  if (uv !== null && uv >= 3) items.push(`УФ до ${Math.round(uv)}`);
  return items;
});

/** Снежная сводка. Пустая — блок не рендерится вовсе. */
const snowNotes = computed(() => {
  const { freshSnowCm, expectedSnowCm, isSnowingNow } = conditions.value;
  const notes: string[] = [];
  if (isSnowingNow) notes.push("Идёт снег");
  if (freshSnowCm !== null) notes.push(`Свежего ${freshSnowCm} см за сутки`);
  if (expectedSnowCm !== null) notes.push(`Ожидается ${expectedSnowCm} см`);
  return notes;
});

/** Предупреждения о том, что кататься будет плохо. */
const warnings = computed(() => {
  const {
    isWindAlert,
    windGustMaxMs,
    isLowVisibility,
    isRainOnSnow,
    isFreezeThaw,
  } = conditions.value;
  const items: string[] = [];
  if (isWindAlert && windGustMaxMs !== null)
    items.push(
      `Порывы до ${Math.round(windGustMaxMs)} м/с — подъёмники могут стоять`,
    );
  if (isLowVisibility) items.push("Плохая видимость");
  if (isRainOnSnow) items.push("Дождь на склоне");
  if (isFreezeThaw) items.push("Ночью подмерзает — утром жёстко");
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
          <!-- Разделитель внутри элемента, иначе при переносе строки он
               остаётся висеть в её конце -->
          <span
            v-for="(item, index) in details"
            :key="item"
            class="whitespace-nowrap inline-flex items-center gap-1"
          >
            <span v-if="index > 0" class="text-slate-600">·</span>
            <WindCompass
              v-if="index === 0 && windDirection !== null"
              :wind-direction="windDirection"
              class="text-sm align-middle mr-0.5 shrink-0"
            />
            {{ item }}
          </span>
        </div>
      </div>

      <div
        v-if="snowNotes.length"
        class="px-1 mb-2 sm:px-0 sm:max-w-2xl sm:mx-auto flex flex-wrap items-baseline gap-x-1 text-sm text-sky-300"
      >
        <span aria-hidden="true">❄</span>
        <span
          v-for="(note, index) in snowNotes"
          :key="note"
          class="whitespace-nowrap"
        >
          <span v-if="index > 0" class="text-slate-600">·&nbsp;</span>
          {{ note }}
        </span>
      </div>

      <div
        v-if="warnings.length"
        class="px-1 mb-2 sm:px-0 sm:max-w-2xl sm:mx-auto flex flex-wrap items-baseline gap-x-1 text-xs text-amber-400/90"
      >
        <span
          v-for="(item, index) in warnings"
          :key="item"
          class="whitespace-nowrap"
        >
          <span v-if="index > 0" class="text-slate-600">·&nbsp;</span>
          {{ item }}
        </span>
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
