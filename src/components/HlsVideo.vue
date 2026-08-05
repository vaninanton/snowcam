<template>
  <!--
    Размеры задаются здесь, а не в местах использования. Без w-full ширину
    <video> определяет разрешение постера (720px постер -> видео 720px в
    ячейке 835px), а без aspect-video высота до загрузки потока берётся из
    постера и меняется на размеры видео — отсюда прыжки. С этой парой
    вёрстка не зависит ни от разрешения постера, ни от момента загрузки.
  -->
  <video
    class="aspect-video w-full object-cover"
    :src="src"
    :poster="poster"
    ref="videoItem"
  ></video>
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
