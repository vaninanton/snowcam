<template>
  <ul
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mx-auto"
    v-on="{ click: capture }"
  >
    <li class="relative" v-for="video in videos" v-bind:key="video.title">
      <VideoWallItem ref="videoWallItem" :video="video" />
    </li>
  </ul>
</template>
<script>
import VideoWallItem from "./VideoWallItem.vue";

export default {
  components: {
    VideoWallItem,
  },
  data() {
    return {
      videos: [
        {
          title: "Ледник Богдановича",
          description: "Верхняя станция",
          src: "https://ipcam.kz/cam6/index.m3u8",
          poster: "/previews/3212b47c65ccc0cb9759f5c08632c563.jpg",
        },
        {
          title: "Средняя станция",
          description: "Средняя станция",
          src: "https://ipcam.kz/cam5/index.m3u8",
          poster: "/previews/ffa10e45b1d87ab0aa8796bc7969046c.jpg",
        },
        {
          title: "Бугель",
          description: "Базовая станция",
          src: "https://ipcam.kz/cam2/index.m3u8",
          poster: "/previews/d5361ff25a96271df9ac614d9138806a.jpg",
        },
        {
          title: "Подъемник",
          description: "Базовая станция",
          src: "https://ipcam.kz/cam1/index.m3u8",
          poster: "/previews/197f1dde9a2c929cca5496f225cc2d62.jpg",
        },
      ],
    };
  },
  methods: {
    capture() {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 2560;
      canvas.height = 1440;

      context.drawImage(
        this.$refs.videoWallItem[0].$refs.video,
        0,
        0,
        1280,
        720,
      );
      context.drawImage(
        this.$refs.videoWallItem[1].$refs.video,
        0,
        720,
        1280,
        720,
      );
      context.drawImage(
        this.$refs.videoWallItem[2].$refs.video,
        1280,
        0,
        1280,
        720,
      );
      context.drawImage(
        this.$refs.videoWallItem[3].$refs.video,
        1280,
        720,
        1280,
        720,
      );

      const dataURI = canvas.toDataURL("image/png");

      let yourDate = new Date();

      const link = document.createElement("a");
      link.style.display = "none";
      link.setAttribute(
        "download",
        "snowcam.vaninanton.ru-" + yourDate.toISOString() + ".png",
      );
      link.setAttribute(
        "href",
        dataURI.replace("image/png", "image/octet-stream"),
      );
      document.body.appendChild(link);
      link.click();
    },
  },
};
</script>
