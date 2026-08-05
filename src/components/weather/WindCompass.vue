<script setup lang="ts">
import { computed } from "vue";

// Корнем шаблона обязан быть настоящий элемент. Раньше class/style/title
// висели на самом блоке <template>, и Vue их молча отбрасывал — стрелка не
// поворачивалась и не имела подсказки. По той же причине в шаблоне нет
// комментариев: узел-комментарий рядом с корнем превращает его во фрагмент,
// и наследование атрибутов от родителя снова ломается.
const props = defineProps<{
  /** Градусы по часовой стрелке от севера, откуда дует ветер. */
  windDirection: number;
}>();

const DIRECTIONS = [
  "Северный",
  "Северо-восточный",
  "Восточный",
  "Юго-восточный",
  "Южный",
  "Юго-западный",
  "Западный",
  "Северо-западный",
] as const;

const title = computed(
  () => DIRECTIONS[Math.round(props.windDirection / 45) % DIRECTIONS.length],
);

const arrowStyle = computed(() => ({
  transform: `rotate(${props.windDirection}deg)`,
}));
</script>

<template>
  <span
    class="inline-block origin-center select-none"
    :title="title"
    :style="arrowStyle"
    >&uarr;</span
  >
</template>
