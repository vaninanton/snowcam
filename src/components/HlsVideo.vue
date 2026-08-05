<script setup lang="ts">
import { ref, toRef } from "vue";
import { useHlsPlayer } from "@/composables/useHlsPlayer";

// Размеры задаются здесь, а не в местах использования. Без w-full ширину
// <video> определяет разрешение постера (720px постер -> видео 720px в ячейке
// 835px), а без aspect-video высота до загрузки потока берётся из постера и
// меняется на размеры видео — отсюда прыжки страницы. С этой парой вёрстка не
// зависит ни от разрешения постера, ни от момента загрузки.
//
// Комментариев внутри <template> нет намеренно: узел-комментарий рядом с
// корневым элементом делает шаблон фрагментом, и атрибуты от родителя
// (muted, controls, autoplay) перестают наследоваться.
const props = withDefaults(
  defineProps<{
    src: string;
    poster?: string;
  }>(),
  { poster: "" },
);

const videoRef = ref<HTMLVideoElement | null>(null);

useHlsPlayer(videoRef, toRef(props, "src"));
</script>

<template>
  <video
    ref="videoRef"
    class="aspect-video w-full object-cover"
    :src="src"
    :poster="poster"
  ></video>
</template>
