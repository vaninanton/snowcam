<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mx-auto">
    <li class="relative" v-for="video in videos" v-bind:key="video.title">
      <HlsVideo
        ref="videoWallItem"
        :src="video.src"
        poster="video.poster"
        muted
        controls
        allowfulscreen
        playsinline
        autoplay
      />
    </li>
  </ul>
</template>
<script>
import HlsVideo from "./components/HlsVideo.vue";
import videos from "./videos";
export default {
  components: {
    HlsVideo,
  },
  data() {
    return {
      videos,
    };
  },
  mounted() {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.MainButton.setParams({ text: "ХЫХЫХЫ" });
    window.Telegram.WebApp.MainButton.show();
    window.Telegram.WebApp.MainButton.onClick(this.capture);
  },
  methods: {
    async capture() {
      window.Telegram.WebApp.switchInlineQuery("aaaaa");
      return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 2560;
        canvas.height = 1440;

        const ctx = canvas.getContext("2d");

        for (let i = 0; i < 4; i++) {
          const videoWallItem = this.$refs.videoWallItem[i];
          const video = videoWallItem.$refs.videoItem;
          const x = (i % 2) * 1280;
          const y = Math.floor(i / 2) * 720;

          ctx.drawImage(video, x, y, 1280, 720);
        }

        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append("image", blob, "screenshot.png");

          await fetch("https://gocpa.space/api/webhooks/newproject", {
            method: "POST",
            body: formData,
          });

          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
          window.Telegram.WebApp.MainButton.setParams({
            text: "Скриншот отправлен!",
          });
          setTimeout(() => {
            window.Telegram.WebApp.MainButton.setParams({
              text: "Скрин в буфер",
            });
          }, 2000);
        });
      } catch (error) {
        setTimeout(() => {
          window.Telegram.WebApp.MainButton.setParams({ text: error });
        }, 2000);
      }
    },
  },
};
</script>
