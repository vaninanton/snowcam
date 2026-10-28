---
category: Video
---

# CameraVideo

Ленивая плитка веб-камеры для списков камер. Пока плитка не подошла к экрану ближе чем на 200px, на её месте только картинка `camera.poster` в том же боксе 16:9. Потом подключается `HlsVideo` (muted, controls, autoplay) и больше не выгружается. Используйте её в сетках камер. Когда видны сразу все плееры (видеостена), берите `HlsVideo` напрямую.

`camera` — запись камеры: `{ place, title, description, elevation, src, poster }`. `elevation` в метрах, `src` — URL HLS-манифеста, `poster` — кадр 16:9.

В приложении список камер — это сетка `<ul>`. Над каждой плиткой заголовок `h2.p-2.sm:p-0.font-semibold` вида «Название, 3200 м». Классы колонок даёт `cameraGridCols(count)` (тоже экспортируется): до трёх камер — в один ряд, четыре — 2×2, больше — по три в ряд.

```jsx
<ul
  className={cx(
    "grid gap-4 xl:gap-x-8 xl:gap-y-6 sm:px-6 xl:px-8",
    cameraGridCols(cameras.length),
  )}
>
  {cameras.map((camera) => (
    <li key={camera.title}>
      <h2 className="p-2 sm:p-0 font-semibold">
        {camera.title}, {camera.elevation} м
      </h2>
      <CameraVideo camera={camera} />
    </li>
  ))}
</ul>
```
