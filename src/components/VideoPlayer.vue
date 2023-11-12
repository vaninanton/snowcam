<template>
  <div
    class="aspect-video relative rounded-md transform overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.08)] bg-slate-200 dark:bg-slate-700"
  >
    <img
      alt=""
      fetchpriority="high"
      width="672"
      height="494"
      decoding="async"
      :class="{
        'opacity-0': loaded,
        'opacity-100': !loaded,
        'absolute inset-0 w-full h-full pointer-events-none transition-opacity z-10': true,
      }"
      style="color: transparent"
      :src="poster"
    />
    <div>
      <video
        class="absolute inset-0 w-full h-full [mask-image:radial-gradient(white,black)]"
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
    src: String,
    poster: String,
  },
  data() {
    return {
      loaded: false,
    };
  },
  methods: {
    playVideo() {
      let video = this.$refs.video;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.on(Hls.Events.MANIFEST_PARSED, this._manifestParsed);
        hls.loadSource(this.src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = this.src;
        video.addEventListener("loadedmetadata", this._manifestParsed);
      }
    },
    _manifestParsed() {
      let video = this.$refs.video;
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
