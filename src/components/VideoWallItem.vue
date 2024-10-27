<template>
  <div class="aspect-video relative transform overflow-hidden">
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
        allowfulscreen
        playsinline
        @click="getScreenshot"
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
    getScreenshot() {
      const { video } = this.$refs;
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;

      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURI = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.style.display = "none";
      link.setAttribute("download", "image.png");
      link.setAttribute(
        "href",
        dataURI.replace("image/png", "image/octet-stream"),
      );
      document.body.appendChild(link);
      link.click();
    },
  },
  mounted() {
    this.playVideo();
  },
};
</script>
