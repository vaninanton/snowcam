---
category: Video
---

# HlsVideo

Плеер HLS-потока веб-камеры: hls.js там, где он поддерживается, иначе нативный HLS в Safari/iOS. Занимает бокс 16:9 на всю ширину (`relative aspect-video w-full`), поэтому вёрстка не прыгает, пока грузится поток. Все пропсы, кроме `src` и `className`, уходят на внутренний `<video>`.

Если поток недоступен (фатальная ошибка hls.js или `error` у нативного `<video>`), кадр обесцвечивается, а поверх ложится тёмная подложка `bg-slate-900/70` с круглой кнопкой повтора и надписью «Камера недоступна». Повтор переподключает поток.

- `src` — URL HLS-манифеста (`https://ipcam.kz/camN/index.m3u8`). Не ставьте `src` на `<video>` сами: поток подключает компонент.
- `poster` — кадр 16:9, который виден до первого кадра потока.
- Для плитки камеры в приложении передавайте `muted controls playsInline autoPlay`.
- Ширину задаёт родитель (ячейка сетки); высоту не задавайте.

```jsx
<HlsVideo
  src="https://ipcam.kz/cam6/index.m3u8"
  poster="/previews/892c6cefe6ea6b6bdf083233c8fd37b6.webp"
  muted
  controls
  playsInline
  autoPlay
/>
```
