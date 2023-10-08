<template>
  <!-- <div style="opacity: 0; transition: opacity 0.5s linear 0s;"></div> -->
  <video
    class="absolute inset-0 w-full h-full [mask-image:radial-gradient(white,black)]"
    :poster="poster"
    ref="video"
    v-on:click="fullscreen"
    muted
    playsinline
  ></video>
  <!-- </div> -->
</template>

<script>
import { ref } from "vue";
import Hls from "hls.js";

export default {
  setup() {
    const video = ref(null);
    return {
      video,
    };
  },
  props: {
    src: String,
    poster: String,
  },
  methods: {
    playVideo() {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(this.src);
        hls.attachMedia(this.video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          this.video.play();
        });
      } else {
        this.video.src = this.src;
        this.video.play();
      }
    },
    fullscreen() {
      this.video.play();

      if (this.video.requestFullscreen) {
        this.video.requestFullscreen();
      } else if (this.video.webkitrequestFullscreen) {
        this.video.webkitRequestFullscreen();
      } else if (this.video.webkitEnterFullScreen) {
        this.video.webkitEnterFullScreen();
      } else if (this.video.mozRequestFullscreen) {
        this.video.mozRequestFullScreen();
      }

    },
  },
  mounted() {
    this.playVideo();
  },
};
</script>
