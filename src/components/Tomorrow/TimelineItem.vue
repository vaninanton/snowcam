<template>
  <div
    class="w-22 p-2 h-full flex flex-col justify-between text-center text-xs"
    :class="{ 'bg-white/10': isCurrent }"
  >
    <div>
      <div class="font-normal mb-2">{{ startTime }}</div>
      <weatherIcon class="w-12 mx-auto" :timeline="timeline"></weatherIcon>

      <div>
        <span class="font-bold text-lg">{{ temperature }}<sup>°</sup></span>
        <span class="font-light" v-if="temperature != temperatureApparent"
          >({{ temperatureApparent }}<sup>°</sup>)</span
        >
      </div>
    </div>
  </div>
</template>
<script>
import Snowflake from "@bybas/weather-icons/design/fill/animation-ready/snowflake.svg";
import moment from "moment/min/moment-with-locales";
import WeatherIcon from "./WeatherIcon.vue";
import WindCompass from "./WindCompass.vue";
import { getDayIcon, getNightIcon } from "./GetIcon";

moment.locale("ru");

export default {
  props: {
    timeline: Object,
  },
  components: {
    WindCompass,
    WeatherIcon,
  },
  data() {
    return {
      Snowflake,
    };
  },
  computed: {
    isCurrent() {
      return moment(this.timeline.startTime).isSame(moment().startOf("hour"));
    },
    startTime() {
      if (this.isCurrent) {
        return "Сейчас";
      }
      return moment(this.timeline.startTime).format("HH") + ":00";
    },
    temperature() {
      return Math.floor(this.timeline.values.temperature);
    },
    temperatureApparent() {
      return Math.floor(this.timeline.values.temperatureApparent);
    },
    icon() {
      if (
        moment(this.timeline.startTime).isSameOrAfter(
          this.timeline.values.sunsetTime,
        ) ||
        moment(this.timeline.startTime).isSameOrBefore(
          this.timeline.values.sunriseTime,
        )
      ) {
        return getNightIcon(this.timeline.values.weatherCode);
      }

      return getDayIcon(this.timeline.values.weatherCode);
    },
    description() {
      return this.timeline.values.weatherCode;
      // return GetIcon(this.timeline.values.weatherCode)?.text;
    },
  },
};
</script>
