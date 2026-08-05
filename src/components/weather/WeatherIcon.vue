<script setup lang="ts">
import { computed } from "vue";
import dayjs from "./dayjs";
import { getWeatherIcon } from "./icons";
import type { TimelineInterval } from "@/types/tomorrow";

const props = defineProps<{
  timeline: TimelineInterval;
}>();

/** Ночь — если момент не раньше заката либо не позже восхода. */
const isNight = computed(() => {
  const { sunriseTime, sunsetTime } = props.timeline.values;
  const at = dayjs(props.timeline.startTime);
  return (
    (sunsetTime !== undefined && at.isSameOrAfter(sunsetTime)) ||
    (sunriseTime !== undefined && at.isSameOrBefore(sunriseTime))
  );
});

const icon = computed(() =>
  getWeatherIcon(
    props.timeline.values.weatherCode,
    isNight.value ? "night" : "day",
  ),
);
</script>

<template>
  <img v-if="icon" :src="icon" :alt="String(timeline.values.weatherCode)" />
</template>
