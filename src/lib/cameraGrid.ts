/**
 * Колонки сетки камер на широком экране: до трёх камер — в один ряд,
 * четыре — квадратом 2×2, больше — по три в ряд. На телефоне всегда
 * одна колонка, на планшете — две.
 *
 * Классы перечислены целиком: Tailwind находит их по тексту исходника
 * и не увидит собранные из частей строки.
 */
export function cameraGridCols(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2 || count === 4) return "grid-cols-1 sm:grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}
