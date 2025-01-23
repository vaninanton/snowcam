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
import videos from "../videos";

export default {
  components: {
    VideoWallItem,
  },
  data() {
    return {
      videos,
    };
  },
  mounted() {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.MainButton.setParams({ text: "Поделиться" });
    window.Telegram.WebApp.MainButton.show(); //show telegram btn
    window.Telegram.WebApp.MainButton.onClick(this.capture);
  },
  methods: {
    async capture() {
      // window.Telegram.WebApp.MainButton.onClick(buttonOn) //set func on main button click
      // window.Telegram.WebApp.MainButton.setParams({ 'text': 'АААА' });
      // window.Telegram.WebApp.MainButton.show() //show telegram btn

      // console.log(window.Telegram.WebApp.WebAppInitData);
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");

      window.Telegram.WebApp.shareToStory(
        "https://snowcam.vantonkz.keenetic.pro/android-chrome-512x512.png",
        {
          text: "aaaa",
          widget_link: "https://snowcam.vantonkz.keenetic.pro",
        },
      );
      // if (await this.navShare(dataURI) === false) {

      // }
    },
  },
};
</script>
