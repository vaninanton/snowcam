<template>
  <img :src="icon" :alt="timeline.values.weatherCode" />
</template>
<script>
import dayjs from "./dayjs";
import { getDayIcon, getNightIcon } from "./GetIcon";

export default {
  props: {
    timeline: Object,
  },
  computed: {
    icon() {
      if (
        dayjs(this.timeline.startTime).isSameOrAfter(
          this.timeline.values.sunsetTime,
        ) ||
        dayjs(this.timeline.startTime).isSameOrBefore(
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
