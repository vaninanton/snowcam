<template>
  <div
    class="w-16 min-w-16 p-1.5 h-full flex flex-col justify-between text-center text-xs"
    :class="{ 'bg-white/10': isCurrent }"
  >
    <div>
      <div class="font-normal mb-0.5">{{ startTime }}</div>
      <WeatherIcon class="w-8 h-8 mx-auto block" :timeline="timeline" />

      <div class="whitespace-nowrap">
        <span class="font-bold text-sm">{{ temperature }}<sup>°</sup></span>
        <span class="font-light" v-if="temperature !== temperatureApparent">
          ({{ temperatureApparent }}<sup>°</sup>)</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import moment from "moment/min/moment-with-locales";
import WeatherIcon from "./WeatherIcon.vue";

moment.locale("ru");

const props = defineProps({
  timeline: { type: Object, required: true },
});

const isCurrent = computed(() =>
  moment(props.timeline.startTime).isSame(moment().startOf("hour")),
);

const startTime = computed(() =>
  isCurrent.value
    ? "Сейчас"
    : moment(props.timeline.startTime).format("HH") + ":00",
);

const temperature = computed(() =>
  Math.floor(props.timeline.values.temperature),
);

const temperatureApparent = computed(() =>
  Math.floor(props.timeline.values.temperatureApparent),
);
</script>
