<script setup lang="ts">
import { computed } from "vue";
import dayjs from "./dayjs";
import WeatherIcon from "./WeatherIcon.vue";
import type { TimelineInterval } from "@/types/tomorrow";

const props = defineProps<{
  timeline: TimelineInterval;
}>();

const isCurrent = computed(() =>
  dayjs(props.timeline.startTime).isSame(dayjs().startOf("hour")),
);

const label = computed(() =>
  isCurrent.value
    ? "Сейчас"
    : `${dayjs(props.timeline.startTime).format("HH")}:00`,
);

const temperature = computed(() =>
  floorOrNull(props.timeline.values.temperature),
);
const temperatureApparent = computed(() =>
  floorOrNull(props.timeline.values.temperatureApparent),
);

function floorOrNull(value: number | undefined): number | null {
  return value === undefined ? null : Math.floor(value);
}
</script>

<template>
  <div
    class="w-16 min-w-16 p-1.5 h-full flex flex-col justify-between text-center text-xs"
    :class="{ 'bg-white/10': isCurrent }"
  >
    <div>
      <div class="font-normal mb-0.5">{{ label }}</div>
      <WeatherIcon class="w-8 h-8 mx-auto block" :timeline="timeline" />

      <div class="whitespace-nowrap">
        <span class="font-bold text-sm">{{ temperature }}<sup>°</sup></span>
        <span
          class="font-light"
          v-if="
            temperatureApparent !== null && temperature !== temperatureApparent
          "
        >
          ({{ temperatureApparent }}<sup>°</sup>)</span
        >
      </div>
    </div>
  </div>
</template>
