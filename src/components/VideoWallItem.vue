<template>
  <div
    class="aspect-video relative transform overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.08)] bg-slate-200 dark:bg-slate-700"
  >
    <img
      alt=""
      fetchpriority="high"
      decoding="async"
      :class="{
        'opacity-0': loaded,
        'opacity-100': !loaded,
        'absolute inset-0 w-full h-full pointer-events-none transition-opacity z-10': true,
      }"
      :src="video.poster"
    />
    <div>
      <video
        class="absolute inset-0 w-full h-full"
        :src="video.src"
        ref="video"
        muted
        controls
        allowfulscreen
        playsinline
      ></video>
    </div>
  </div>
</template>

<script>
import Hls from "hls.js";

export default {
  props: {
    video: Object,
  },
  data() {
    return {
      loaded: false,
    };
  },
  methods: {
    playVideo() {
      const { video } = this.$refs;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.on(Hls.Events.MANIFEST_PARSED, this.manifestParsed);
        hls.loadSource(this.video.src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = this.video.src;
        video.addEventListener("loadedmetadata", this.manifestParsed);
      }
    },
    manifestParsed() {
      const { video } = this.$refs;
      video.play();
      setTimeout(() => {
        this.loaded = true;
      }, 1000);
    },
  },
  mounted() {
    this.playVideo();
  },
};
</script>
