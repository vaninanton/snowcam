# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## О проекте

SnowCam — PWA для просмотра HLS-веб-камер и погоды горнолыжного курорта Шымбулак (Алматы). Полностью статическое приложение без бэкенда: все данные берутся напрямую из браузера (HLS-потоки с `ipcam.kz`, погода из Tomorrow.io). Деплой — GitHub Pages, продакшен https://snowcam.vaninanton.ru

Язык интерфейса, комментариев и коммитов — **русский**.

## Команды

```bash
npm install          # legacy-peer-deps=true задан в .npmrc
cp .env.example .env # затем указать VITE_TOMORROW_API_KEY (ключ с tomorrow.io)

npm run dev          # dev-сервер, HTTPS через mkcert, --host=0.0.0.0
npm run build        # typecheck + сборка в dist/
npm run typecheck    # tsc --build
npm test             # vitest run
npm run test:watch   # vitest в watch-режиме
npm run preview      # просмотр сборки (тоже по HTTPS — curl'ить с -k)
npm run eslint       # ESLint с автофиксом
npm run format       # Prettier по src/
```

Проверка изменений — `npm run typecheck` + `npm test` + `npm run build`. Один тест: `npx vitest run src/hooks/useWeather.test.ts`.

## Тулинг

**TypeScript закреплён на 6.x.** Сам `tsc` 7 (Go-порт) проект проверил бы, но `typescript-eslint` требует `typescript <6.1.0`: его парсер работает через JS-API компилятора, которого в 7.0 нет. Не обновлять до 7, пока `typescript-eslint` его не поддержит.

**ESLint без type-aware правил.** `tseslint.configs.recommended`, а не `recommendedTypeChecked`: за типы отвечает `tsc`. Хуки проверяет `eslint-plugin-react-hooks` (набор `flat.recommended` с правилами React Compiler). Его `react-hooks/immutability` считает мутацией аргумента хука запись в свойство DOM-элемента из ref прямо в теле эффекта — поэтому работа с `<video>` в `useHlsPlayer` вынесена в функции уровня модуля (`attachHls`, `attachNative`). Форматирующих правил в ESLint нет — за них Prettier, `eslint-config-prettier` идёт последним в конфиге.

**Vitest на happy-dom** с `src/test/setup.ts`, компоненты тестируются через `@testing-library/react`. Setup вызывает `cleanup` после каждого теста (без `globals: true` Testing Library сама этого не делает) и решает конфликт версий: Node 26 объявляет собственный экспериментальный глобальный `localStorage`, недоступный без `--localstorage-file`; ключ на `globalThis` существует, поэтому окружение happy-dom его не перекрывает и `localStorage` в тестах оказывается `undefined`. Setup ставит `Storage` из happy-dom явно.

В `.npmrc` включён `legacy-peer-deps=true` — peer-зависимости не доустанавливаются автоматически. Поэтому `@testing-library/dom` (peer для `@testing-library/react`) прописан в `devDependencies` явно; при добавлении пакетов с peer-зависимостями их тоже нужно ставить руками.

Pre-commit (husky + lint-staged) прогоняет по изменённым `*.{ts,tsx}` `eslint --fix` и `prettier --write`, перед этим — `npm test`.

## Архитектура

`vite-plugin-mkcert` выдаёт dev-серверу и preview локально доверенный сертификат. Это нужно для проверки с телефона по LAN (`--host=0.0.0.0`): без HTTPS там нет secure context и не появляется промпт установки на homescreen. Плагин включает HTTPS сам — `server.https` нужен только чтобы его выключить (`false`).

### Две точки входа (multi-page Vite)

- `index.html` → [src/main.tsx](src/main.tsx) → [src/pages/HomePage.tsx](src/pages/HomePage.tsx) — вкладки локаций, погода, сетка камер, баннер установки
- `videowall.html` → [src/videowall.tsx](src/videowall.tsx) → [src/pages/VideoWallPage.tsx](src/pages/VideoWallPage.tsx) — «видеостена» без обвязки

Обе монтируются через [src/createApp.tsx](src/createApp.tsx) — `createSnowCamApp(<Root />, { splashImage })`. Она рендерит дерево в `#app` внутри `StrictMode` и инициализирует iOS PWA splash. Компоненты конкретной страницы передаются прямо в дерево (`AddToHomescreen` есть только в `main.tsx`). **Новый вход добавляется через неё**, а не через собственный `createRoot`.

Сборка (rolldown-опции Vite 8) выносит `hls.js` в чанк `hls`, остальной `node_modules` — в `vendor`. Пути входов резолвятся через `import.meta.dirname` (`__dirname` ломает нативный загрузчик конфига Vite). Алиас `@` → `src/` объявлен в `vite.config.ts`, `vitest.config.ts` и `tsconfig.app.json` — при переименованиях править во всех трёх.

### Данные камер

[src/data/cameras.ts](src/data/cameras.ts) — единственный источник, типизирован как `Camera` ([src/types/camera.ts](src/types/camera.ts)). Оттуда же экспортируется `places` — уникальные локации в порядке появления.

- `HomePage` фильтрует список по активной локации и запоминает выбор в `localStorage` под ключом `snowcam-place-tab`. Панель вкладок появляется только при 2+ локациях. Временно отключённую камеру комментируют в `cameras.ts`.
- Колонки сетки считает `cameraGridCols()` ([src/lib/cameraGrid.ts](src/lib/cameraGrid.ts)) по числу камер: до трёх — в один ряд на десктопе, четыре — 2×2, больше — по три. Классы Tailwind там перечислены целиком: собранные из частей строки Tailwind не найдёт.
- `poster` — путь к превью в `public/previews/`, **обязательно 16:9** (см. ниже). Формат — WebP 720×405, имя файла — md5 содержимого (кэш-бастинг: новое превью кладётся под новым именем, старое удаляется).
- Постеры пересобираются кадром из живого потока:
  ```bash
  ffmpeg -y -i "https://ipcam.kz/camN/index.m3u8" -ss 3 -frames:v 1 -vf scale=720:405 frame.png
  cwebp -q 80 -m 6 -sharp_yuv -pass 10 -af frame.png -o poster.webp
  ```
  `q 80` — компромисс по SSIM (0.965–0.977 против исходного кадра) и весу (~65–100 КБ). ImageOptim прогонять бессмысленно: он не умеет WebP и даёт 0 байт выигрыша (на JPEG давал ~3%).
- Камера «Бугель» (`cam2`) **временно закомментирована** в `cameras.ts`: поток давно отдаёт `not found`. Её постер оставлен в `public/previews/` — это зимний архивный снимок, обновить его кадром нельзя, и по сезону он не совпадает с остальными.

### Воспроизведение

[src/components/HlsVideo.tsx](src/components/HlsVideo.tsx) + [src/hooks/useHlsPlayer.ts](src/hooks/useHlsPlayer.ts): через hls.js там, где поддерживается, иначе нативный HLS в Safari/iOS. Хук подключает поток в `useEffect` и уничтожает проигрыватель в его cleanup — при смене `src` и при размонтировании. Без этого hls.js продолжает тянуть сегменты в фоне. `src` на сам `<video>` не ставится: поток подключает только хук.

На главной плеер подключается через [src/components/CameraVideo.tsx](src/components/CameraVideo.tsx): пока камера не подошла к экрану ближе чем на 200px (`useInViewOnce`), на её месте постер в том же боксе 16:9, и ни чанк `hls.js`, ни сегменты потока не запрашиваются. Подключённая камера при уходе с экрана не выгружается — иначе при прокрутке назад поток грузился бы заново. Видеостена подключает `HlsVideo` напрямую: там видно всё сразу.

Бокс 16:9 задан **в самом компоненте**, а не в местах использования: `relative aspect-video w-full` на обёртке, `h-full w-full object-cover` на `<video>`. Без `w-full` ширину `<video>` определяет разрешение постера, без `aspect-video` высота до загрузки потока берётся из постера и меняется на размеры видео — отсюда прыжки страницы. Корень компонента — `<div>`, а остальные пропсы (`muted`, `controls`, `autoPlay`, `playsInline`) пробрасываются на `<video>`. React выставляет `muted` свойством элемента, а не атрибутом — в тестах проверяется `video.muted`.

**Недоступные камеры.** Хук слушает `Hls.Events.ERROR` и `error` у `<video>` (нативный путь). Нефатальные ошибки hls.js разбирает сам — реагируем только на `data.fatal`: гасим проигрыватель и поднимаем `hasError`. Компонент тогда обесцвечивает кадр (`grayscale`) и кладёт поверх постера полупрозрачную серую подложку `bg-slate-900/70` с кнопкой повтора — так мёртвая плитка не путается с живой. Ошибка привязана к ключу подключения (`src` + номер попытки): `retry()` увеличивает номер, эффект переподключает поток, и заглушка пропадает без ручного сброса состояния — смена `src` работает так же. В нативной ветке после присвоения `src` вызывается `element.load()`: при повторе значение `src` не меняется, и без `load()` браузер может не пойти за потоком заново.

### Погода (Tomorrow.io)

- [src/hooks/useWeather.ts](src/hooks/useWeather.ts) — **единственное место запроса к API**, нативный `fetch`. Загрузка с кэшем — обычная функция `loadWeather()`, хук `useWeather()` только кладёт результат в состояние (`loading` / `error` / `ready`); со свежим кэшем он готов уже на первом рендере. Одновременные вызовы `loadWeather()` делят один запрос: StrictMode в dev запускает эффекты дважды, и без этого каждая перезагрузка страницы тратила бы два запроса из лимита. Ответ кэшируется в `localStorage` под ключом `tomorrowioData` **на 6 часов** (у API ограниченный бесплатный лимит — не убирать кэш и не добавлять повторных запросов). Ключ сохранён с доTS-версии, чтобы не осиротить кэш у пользователей. Клик по `VersionString` на главной вызывает `clearCache()` и перезагружает страницу.
- [src/components/weather/WeatherPlaceholder.tsx](src/components/weather/WeatherPlaceholder.tsx) — заглушка на время загрузки чанка и данных (fallback `Suspense` в `HomePage` и состояние `loading`). Держит высоту шапки и полосы прогноза (188px до `sm`, 180px шире), чтобы камеры не прыгали вниз. Строки снега и предупреждений не резервируются: их может не быть. **При изменении вёрстки виджета пересчитать эти высоты**, иначе вернётся сдвиг страницы. Лежит отдельным файлом, чтобы не тянуть чанк виджета в основной бандл.
- [src/components/weather/tomorrow.ts](src/components/weather/tomorrow.ts) — координаты, таймзона `Asia/Almaty`, список полей с расшифровками и `buildTimelineUrl()`. Списочные параметры (`location`, `fields`, `timesteps`) API ждёт через запятую, поэтому массивы склеиваются через `join(",")` вручную.
- [src/components/weather/conditions.ts](src/components/weather/conditions.ts) — вывод показателей для катания из сырых интервалов. Чистая функция без React, вся логика тестируется отдельно от компонентов.
- [src/components/weather/dayjs.ts](src/components/weather/dayjs.ts) — **единственное место регистрации плагинов dayjs** (`isSameOrAfter`, `isSameOrBefore`). Импортировать дату нужно отсюда, а не напрямую из `"dayjs"`: библиотека — синглтон, и прямой импорт не увидит расширенных методов. Плагины подключаются с расширением `.js` в пути, иначе модуль не резолвится вне бандлера.
- [src/components/weather/icons.ts](src/components/weather/icons.ts) — маппинг `weatherCode` на SVG из `@bybas/weather-icons`, отдельно день/ночь. Таблицы объявлены на уровне модуля.
- Типы ответа — [src/types/tomorrow.ts](src/types/tomorrow.ts). Все поля `values` опциональны: набор зависит от timestep.

Ключ API попадает в бандл как `VITE_TOMORROW_API_KEY` — это публичный клиентский ключ по устройству приложения.

#### Ограничения Tomorrow.io, проверенные на этом ключе

Всё ниже выяснено запросами к живому API, а не вычитано из документации:

- **`snowDepth` запрашивать бессмысленно.** Поле geographic-limited регионом США и для Шымбулака всегда `null`. Именно оно давало в виджете выдуманный «Снег 0 см»: API присылает `null`, а `Math.round(null) === 0`. Помощники в виджете проверяют `== null`, а не `=== undefined` — не «чинить» это обратно.
- **`*AccumulationLwe` API не возвращает вовсе**, даже когда их запрашиваешь.
- **История — максимум 24 часа назад.** На `-48ч` приходит `403: startTime cannot be more than 24 hours in the past`. Поэтому свежий снег считается «за сутки», а не за календарное вчера.
- **`snowAccumulation` и `snowAccumulationSum` — в миллиметрах**, хотя катающиеся меряют сантиметрами. Деление на 10 живёт в `conditions.ts`, в самих полях единицы указаны в расшифровках.
- **Суточные агрегаты** (`snowAccumulationSum`, `temperatureMin/Max`, `windGustMax`, `uvIndexMax`) приходят во всех timestep, но осмысленны только в `1d`.
- Полей `freezingLevelHeight`, `snowLevel`, `surfaceTemperature` не существует — `400 unknown field`. Снеговую линию посчитать нечем.
- **Лимит запросов жёсткий**: `429` ловится после примерно восьми запросов подряд. Кэш на 6 часов — не оптимизация, а необходимость.

Зима определяется **по данным, а не по календарю** (`isWinter` в `conditions.ts`): в горах снег бывает и в августе. Нулевые величины схлопываются в `null` и не рендерятся — виджет не должен показывать «0 см».

### PWA

Собирается **без** service worker и без `vite-plugin-pwa`: манифест — статический `public/site.webmanifest`, splash для iOS — рантайм-библиотека `ios-pwa-splash` из `createApp.tsx`, промпт установки — свой компонент [src/components/AddToHomescreen.tsx](src/components/AddToHomescreen.tsx): показывается один раз (кука `addToHomescreenCalled` на год — имя сохранено с прежнего Vue-плагина, клик по версии её сбрасывает), в Chromium вызывает системный диалог через `beforeinstallprompt`, в остальных браузерах показывает инструкцию. У `ios-pwa-splash` нет своих типов, декларация лежит в [src/env.d.ts](src/env.d.ts). Safe-area отступы заданы в `src/style.css`. Tailwind 4 подключён плагином `@tailwindcss/vite`, отдельного PostCSS-пайплайна в проекте нет.

## Конвенции кода

- React 19, только функциональные компоненты и хуки, файлы `.tsx`. Компонент экспортируется по умолчанию. Тяжёлые компоненты подключаются в родителе через `lazy` + `Suspense` (см. `HomePage.tsx`).
- Пропсы типизируются в сигнатуре компонента, без `React.FC`. Условные классы склеиваются через `cx()` из [src/lib/cx.ts](src/lib/cx.ts).
- Логика без JSX (расчёты, запросы, кэш) живёт в чистых функциях, хуки — тонкая обёртка над ними.
- Имена компонентов и их файлов — PascalCase, хуки — `src/hooks/useXxx.ts`, переменные и функции — camelCase.
- Строки — двойные кавычки. ES-модули везде.
- Стили — только утилитарные классы Tailwind 4 в шаблоне; глобальное — в `src/style.css`. Тема тёмная (`bg-slate-900 text-slate-400` на `<body>`).
- Тесты лежат рядом с кодом как `*.test.ts` / `*.test.tsx`.
- Коммиты — Conventional Commits на русском.

## CI и деплой

- `.github/workflows/ci.yml`: на PR и push в `main` — typecheck, ESLint, `prettier --check`, тесты.
- `.github/workflows/deploy.yml`: push в `main` → `npm ci` → `npm run build` (включает typecheck) с `VITE_BUILD_VERSION=${{ github.sha }}` и `VITE_TOMORROW_API_KEY` из секретов → GitHub Pages → уведомление в Telegram. Шаг уведомления помечен `continue-on-error`: сайт к нему уже опубликован.
- `VITE_BUILD_VERSION` показывается в `VersionString.tsx` (первые 7 символов SHA); при локальной сборке переменной нет и отображается `ver: develop`.

`index.html` содержит счётчик Яндекс.Метрики — при правках `<head>`/`<body>` его не терять.
