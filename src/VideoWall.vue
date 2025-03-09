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
import VideoWallItem from "./components/VideoWallItem.vue";
import videos from "./videos";

export default {
  components: {
    VideoWallItem,
  },
  data() {
    return {
      videos,
    };
  },
  methods: {
    async capture() {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 2560;
        canvas.height = 1440;

        const ctx = canvas.getContext("2d");

        for (let i = 0; i < 4; i++) {
          const videoWallItem = this.$refs.videoWallItem[i];
          const video = videoWallItem.$refs.video;
          const x = (i % 2) * 1280;
          const y = Math.floor(i / 2) * 720;

          ctx.drawImage(video, x, y, 1280, 720);
        }

        canvas.toBlob((blob) => {
          const item = new ClipboardItem({ "image/png": blob });

          navigator.clipboard.write([item]);
          console.log("copied!");
        });
      } catch (error) {
        setTimeout(() => {
          window.Telegram.WebApp.MainButton.setParams({ text: "Ошибка((((" });
        }, 2000);
      }
    },
  },
};
</script>
