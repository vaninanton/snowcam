<template>
  <video :src="src" :poster="poster" ref="videoItem"></video>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Hls from "hls.js";

const props = defineProps({
  src: String,
  poster: { type: String, default: "" },
});

const videoItem = ref(null);

const manifestParsed = () => {
  const video = videoItem.value;
  if (video.autoplay) {
    video.play();
  }
};

onMounted(() => {
  const video = videoItem.value;

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.on(Hls.Events.MANIFEST_PARSED, manifestParsed);
    hls.loadSource(props.src);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = props.src;
    video.addEventListener("loadedmetadata", manifestParsed);
  }
});
</script>
