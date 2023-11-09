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
      class="absolute inset-0 w-full h-full"
      style="color: transparent"
      :src="poster"
    />
    <div
      :class="{
        'opacity-0': !loaded,
        'opacity-100': loaded,
        'transition-opacity': true,
      }"
      v-on:click="fullscreen"
    >
      <video
        class="absolute inset-0 w-full h-full [mask-image:radial-gradient(white,black)]"
        ref="video"
        muted
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
      let video = this.$refs["video"];

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.on(Hls.Events.MEDIA_ATTACHED, this.mediaAttached);
        hls.on(Hls.Events.MANIFEST_PARSED, this.manifestParsed);
        hls.loadSource(this.src);
        hls.attachMedia(video);
      } else {
        video.src = this.src;
        video.play();
        setTimeout(() => {
          this.loaded = true;
        }, 500);
      }
    },
    mediaAttached(event, data) {
      setTimeout(() => {
        this.loaded = true;
      }, 500);
    },
    manifestParsed(event, data) {
      let video = this.$refs["video"];
      video.play();
    },
    fullscreen() {
      let video = this.$refs["video"];
      video.play();
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitrequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.webkitEnterFullScreen) {
        video.webkitEnterFullScreen();
      } else if (video.mozRequestFullscreen) {
        video.mozRequestFullScreen();
      }
    },
  },
  mounted() {
    this.playVideo();
  },
};
</script>
