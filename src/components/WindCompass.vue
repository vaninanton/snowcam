<template>
  <template
    class="inline-block origin-center select-none"
    :title="title"
    :style="arrowStyle"
    >&uarr;</template
  >
</template>

<script>
export default {
  name: "WindCompass",
  props: {
    windDirection: {
      type: Number,
      required: true,
    },
  },
  computed: {
    title() {
      let angle = this.windDirection;
      const directions = [
        "Северный",
        "Северо-восточный",
        "Восточный",
        "Юго-восточный",
        "Южный",
        "Юго-западный",
        "Западный",
        "Северо-западный",
      ];
      return directions[Math.round(angle / 45) % 8];
    },

    arrowStyle() {
      return {
        transform: `rotate(${this.windDirection}deg)`,
      };
    },
  },
};
</script>
