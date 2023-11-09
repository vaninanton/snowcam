<script setup>
import VideoPlayer from "./components/VideoPlayer.vue";
import Weather from "./components/Weather.vue";
</script>

<template>
  <Weather />

  <ul
    class="grid max-w-[26rem] sm:max-w-[52.5rem] mt-10 sm:mt-20 md:mt-32 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mx-auto gap-6 lg:gap-y-8 xl:gap-x-8 lg:max-w-7xl px-4 sm:px-6 lg:px-8"
  >
    <li
      class="group relative rounded-3xl bg-slate-50 p-6 dark:bg-slate-800/80 dark:highlight-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/50"
      v-for="video in videos"
    >
      <VideoPlayer :src="video.src" :poster="video.poster" />
      <div class="flex flex-wrap items-center mt-6">
        <h2
          class="text-sm leading-6 text-slate-900 dark:text-white font-semibold group-hover:text-sky-500 dark:group-hover:text-sky-400"
        >
          {{ video.title }}
        </h2>
        <p
          class="w-full flex-none text-[0.8125rem] leading-6 text-slate-500 dark:text-slate-400"
        >
          {{ video.description }}
        </p>
      </div>
    </li>
  </ul>
</template>
<script>
import poster1 from "/previews/3212b47c65ccc0cb9759f5c08632c563.jpg";
import poster2 from "/previews/ffa10e45b1d87ab0aa8796bc7969046b.jpg";
import poster3 from "/previews/d5361ff25a96271df9ac614d9138806a.jpg";
import poster4 from "/previews/197f1dde9a2c929cca5496f225cc2d62.jpg";
export default {
  data() {
    return {
      videos: [
        {
          title: "Ледник Богдановича",
          description: "Верхняя станция, камера в сторону сноупарка",
          src: "https://ipcam.kz/cam6/index.m3u8",
          poster: poster1,
        },
        {
          title: "Средняя станция",
          description: "Средняя станция, где пили кофе и ели хотдоги",
          src: "https://ipcam.kz/cam5/index.m3u8",
          poster: poster2,
        },
        {
          title: "Базовая станция, бугель",
          description: "Бугель на базовой станции",
          src: "https://ipcam.kz/cam2/index.m3u8",
          poster: poster3,
        },
        {
          title: "Базовая станция",
          description: "Базовая станция",
          src: "https://ipcam.kz/cam1/index.m3u8",
          poster: poster4,
        },
        {
          title: "Лесная сказка",
          description: "Old Skazka",
          src: "https://s46.ipcamlive.com/streams/2egmov7mp1rwfdwn4/stream.m3u8",
          poster: poster4,
        },
        {
          title: "Лесная сказка",
          description: "Склон Irbis",
          src: "https://s10.ipcamlive.com/streams/0aw85cpkzrhfwpjxg/stream.m3u8",
          poster: poster4,
        },
        {
          title: "Лесная сказка",
          description: "Lift A",
          src: "https://s75.ipcamlive.com/streams/4bucjko3eixri8xps/stream.m3u8",
          poster: poster4,
        },
        {
          title: "Лесная сказка",
          description: "Lift C",
          src: "https://s10.ipcamlive.com/streams/0anazyiyo1m8uotb2/stream.m3u8",
          poster: poster4,
        },
      ],
    };
  },
};
</script>
