# SnowCam — как собирать экраны

SnowCam — тёмное PWA с веб-камерами и погодой горнолыжного курорта Шымбулак. Интерфейс на русском. Компоненты лежат в `window.SnowCam`: `CameraVideo`, `HlsVideo`, `WeatherWidget`, `WeatherPlaceholder`, `TimelineItem`, `WeatherIcon`, `WindCompass`, `AddToHomescreen`, `VersionString`, а также помощники `cx(...classes)` и `cameraGridCols(count)`.

## Подготовка

Провайдера нет: компоненты стилизуются классами Tailwind из `styles.css`. Тема тёмная, `styles.css` сам красит `body` в `bg-slate-900 text-slate-400 antialiased`. Не ставьте светлый фон и не переопределяйте цвет текста у корня.

**CSS скомпилирован заранее, это не JIT.** Работают только классы, которые уже есть в `_ds_bundle.css`. Произвольные значения вроде `w-[480px]` и редкие утилиты, скорее всего, ничего не дадут. Для нестандартных размеров используйте `style={{...}}`. Сами переменные темы Tailwind (`var(--color-slate-800)`, `var(--spacing)`) определены все.

## Словарь стилей

| Назначение                                        | Классы                                                                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Фон страницы / панели / полосы                    | `bg-slate-900`, `bg-slate-800`, `bg-white/5`, подсветка `bg-white/10`, затемнение `bg-slate-900/70`                                                     |
| Текст: основной / яркий / вторичный / разделитель | `text-slate-400`, `text-slate-100`–`text-slate-300`, `text-slate-500`, `text-slate-600`                                                                 |
| Акцент (кнопки, активное)                         | кнопка `rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-500`; активное `text-sky-400 border-sky-500`; снег `text-sky-300` |
| Предупреждения                                    | `text-amber-400/90 text-xs`                                                                                                                             |
| Границы                                           | `border-slate-700`, `divide-x divide-gray-800`                                                                                                          |
| Типографика                                       | `text-xs`/`text-sm` для мелочи, `font-semibold` для заголовков камер, `text-4xl sm:text-5xl font-extralight` для крупной температуры                    |
| Колонка контента                                  | `px-1 sm:px-0 sm:max-w-2xl sm:mx-auto` (как у погоды), сетки — `sm:px-6 xl:px-8`                                                                        |

Перечни через точку («Ветер 6 м/с · Влажность 87%») — разделитель `<span className="text-slate-600">·</span>`. Нулевые и пустые значения не выводятся вовсе, «0 см» не пишем.

Вкладки локаций (разметка из приложения, отдельного компонента нет): контейнер `flex border-b border-slate-700`; кнопка `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors`; активная `border-sky-500 text-sky-400`, неактивная `border-transparent text-slate-500 hover:text-slate-300`.

## Где смотреть

- `styles.css` → `_ds_bundle.css`: скомпилированный Tailwind 4 с темой и всеми доступными классами. Проверяйте класс здесь, прежде чем на него полагаться.
- `components/<group>/<Name>/<Name>.prompt.md`: поведение, пропсы и пример для каждого компонента. `<Name>.d.ts` — контракт пропсов.

## Пример: главная

```jsx
const { WeatherWidget, CameraVideo, VersionString, cameraGridCols, cx } =
  window.SnowCam;

<>
  <WeatherWidget />
  <ul
    className={cx(
      "grid mt-4 mb-4 mx-auto gap-4 xl:gap-y-6 xl:gap-x-8 sm:px-6 xl:px-8",
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
  <VersionString onClick={() => location.reload()} />
</>;
```

`camera` — `{ place, title, description, elevation, src, poster }`. Без ключа API `WeatherWidget` показывает «Погода недоступна»: как подложить данные, описано в его `.prompt.md`.
