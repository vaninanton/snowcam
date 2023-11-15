<template>
  <img :src="icon" :alt="timeline.values.weatherCode" />
</template>
<script>
import moment from "moment/min/moment-with-locales";
import { getDayIcon, getNightIcon } from "./GetIcon.js";
export default {
  props: {
    timeline: Object,
  },
  computed: {
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
  },
};
</script>
