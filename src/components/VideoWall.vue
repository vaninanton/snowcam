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
  methods: {
    async capture() {
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

      const dataURI = canvas.toDataURL("image/jpeg");

      if ((await this.navShare(dataURI)) === false) {
        this.saveFile(dataURI);
      }
    },
    async navShare(dataURI) {
      if (!navigator.canShare) {
        console.error("navigator.share is not available");
        return false;
      }

      const blob = await (await fetch(dataURI)).blob();
      const file = new File(
        [blob],
        "snowcam.vaninanton.ru-" + new Date().toISOString() + ".jpg",
        { type: blob.type },
      );
      if (!navigator.canShare({ files: [file] })) {
        console.error("navigator.share couldnt share files");
        return false;
      }
      navigator.share({ files: [file] });

      return true;
    },
    saveFile(dataURI) {
      console.log("saveFile");
      const link = document.createElement("a");
      link.style.display = "none";
      link.setAttribute(
        "download",
        "snowcam.vaninanton.ru-" + new Date().toISOString() + ".jpg",
      );
      link.setAttribute(
        "href",
        dataURI.replace("image/jpeg", "image/octet-stream"),
      );
      document.body.appendChild(link);
      link.click();
    },
  },
};
</script>
