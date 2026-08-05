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
npm run typecheck    # vue-tsc --build (проверяет и шаблоны)
npm test             # vitest run
npm run test:watch   # vitest в watch-режиме
npm run preview      # просмотр сборки (тоже по HTTPS — curl'ить с -k)
npm run eslint       # ESLint с автофиксом
npm run format       # Prettier по src/
```

Проверка изменений — `npm run typecheck` + `npm test` + `npm run build`. Один тест: `npx vitest run src/composables/useWeather.test.ts`.

## Тулинг

**TypeScript закреплён на 6.x.** TypeScript 7 — это Go-порт, он не отдаёт `./lib/tsc`, на который опирается `vue-tsc`, и проверка типов на нём падает с `ERR_PACKAGE_PATH_NOT_EXPORTED`. Не обновлять до 7, пока `vue-tsc` не начнёт его поддерживать.

**ESLint намеренно без type-aware правил.** `tseslint.configs.recommended`, а не `recommendedTypeChecked`: сервис typescript-eslint не типизирует SFC и выдаёт `any` на каждый импорт `.vue`, из-за чего `no-unsafe-*` сыплют ложными срабатываниями. За типы отвечает `vue-tsc`, который видит и шаблоны. Форматирующих правил в ESLint нет — за них Prettier, `eslint-config-prettier` идёт последним в конфиге.

**Vitest на happy-dom** с `src/test/setup.ts`. Setup нужен из-за конфликта версий: Node 26 объявляет собственный экспериментальный глобальный `localStorage`, недоступный без `--localstorage-file`; ключ на `globalThis` существует, поэтому окружение happy-dom его не перекрывает и `localStorage` в тестах оказывается `undefined`. Setup ставит `Storage` из happy-dom явно.

В `.npmrc` включён `legacy-peer-deps=true` — peer-зависимости не доустанавливаются автоматически. Из-за этого `vue-eslint-parser` (peer для `eslint-plugin-vue`) прописан в `devDependencies` явно; при добавлении плагинов с peer-зависимостями их тоже нужно ставить руками.

Pre-commit (husky + lint-staged) прогоняет по изменённым `*.{ts,vue}` `eslint --fix` и `prettier --write`, перед этим — `npm test`.

## Ловушка: комментарии в `<template>`

**Не ставить HTML-комментарии рядом с корневым элементом шаблона.** Узел-комментарий делает шаблон фрагментом, и Vue перестаёт наследовать атрибуты от родителя — `class`, `muted`, `controls` молча пропадают. В dev-сборке комментарии сохраняются, в production вырезаются, поэтому баг проявляется только в разработке и в тестах. Пояснения к разметке пишутся в `<script setup>` — так сделано в `HlsVideo.vue` и `WindCompass.vue`.

Смежная ловушка: атрибуты на самом блоке `<template>` (`<template class="..." :style="...">`) Vue отбрасывает без предупреждения. Именно так `WindCompass` долго рендерился голым текстовым узлом и стрелка ветра не поворачивалась.

## Архитектура

`vite-plugin-mkcert` выдаёт dev-серверу и preview локально доверенный сертификат. Это нужно для проверки с телефона по LAN (`--host=0.0.0.0`): без HTTPS там нет secure context и не появляется промпт установки на homescreen. Плагин включает HTTPS сам — `server.https` нужен только чтобы его выключить (`false`).

### Две точки входа (multi-page Vite)

- `index.html` → [src/main.ts](src/main.ts) → [src/pages/HomePage.vue](src/pages/HomePage.vue) — вкладки локаций, погода, сетка камер
- `videowall.html` → [src/videowall.ts](src/videowall.ts) → [src/pages/VideoWallPage.vue](src/pages/VideoWallPage.vue) — «видеостена» без обвязки

Обе монтируются через [src/createApp.ts](src/createApp.ts) — `createSnowCamApp(RootComponent, { splashImage, beforeMount })`. Она вызывает `beforeMount(app)` для плагинов конкретной страницы (`AddToHomescreen` подключается только в `main.ts`), монтирует в `#app` и инициализирует iOS PWA splash. **Новый вход добавляется через неё**, а не через собственный `createApp`.

Сборка (rolldown-опции Vite 8) выносит `hls.js` в чанк `hls`, остальной `node_modules` — в `vendor`. Пути входов резолвятся через `import.meta.dirname` (`__dirname` ломает нативный загрузчик конфига Vite). Алиас `@` → `src/` объявлен в `vite.config.ts`, `vitest.config.ts` и `tsconfig.app.json` — при переименованиях править во всех трёх.

### Данные камер

[src/data/cameras.ts](src/data/cameras.ts) — единственный источник, типизирован как `Camera` ([src/types/camera.ts](src/types/camera.ts)). Оттуда же экспортируется `places` — уникальные локации в порядке появления.

- Компоненты фильтруют список по `camera.src`; `HomePage` дополнительно по активной локации и запоминает выбор в `localStorage` под ключом `snowcam-place-tab`. Панель вкладок появляется только при 2+ локациях.
- `poster` — путь к превью в `public/previews/`, **обязательно 16:9** (см. ниже).
- Поток камеры «Бугель» (`cam2`) отдаёт `not found` — плитка показывает постер и не оживает.

### Воспроизведение

[src/components/HlsVideo.vue](src/components/HlsVideo.vue) + [src/composables/useHlsPlayer.ts](src/composables/useHlsPlayer.ts): через hls.js там, где поддерживается, иначе нативный HLS в Safari/iOS. Композабл пересоздаёт проигрыватель при смене `src` и уничтожает его на `onBeforeUnmount` — без этого hls.js продолжает тянуть сегменты в фоне.

Классы `aspect-video w-full object-cover` заданы **в самом компоненте**, а не в местах использования. Без `w-full` ширину `<video>` определяет разрешение постера, без `aspect-video` высота до загрузки потока берётся из постера и меняется на размеры видео — отсюда прыжки страницы. Подключение делается в `onMounted`, а не в `watch` с `immediate`: к этому моменту ref уже заполнен, и порядок не зависит от планировщика эффектов.

### Погода (Tomorrow.io)

- [src/composables/useWeather.ts](src/composables/useWeather.ts) — **единственное место запроса к API**, нативный `fetch`. Ответ кэшируется в `localStorage` под ключом `tomorrowioData` **на 6 часов** (у API ограниченный бесплатный лимит — не убирать кэш и не добавлять повторных запросов). Ключ сохранён с доTS-версии, чтобы не осиротить кэш у пользователей. Клик по `VersionString` на главной вызывает `clearCache()` и перезагружает страницу.
- [src/components/weather/tomorrow.ts](src/components/weather/tomorrow.ts) — координаты, таймзона `Asia/Almaty`, список полей с расшифровками и `buildTimelineUrl()`. Списочные параметры (`location`, `fields`, `timesteps`) API ждёт через запятую, поэтому массивы склеиваются через `join(",")` вручную.
- [src/components/weather/conditions.ts](src/components/weather/conditions.ts) — вывод показателей для катания из сырых интервалов. Чистая функция без Vue, вся логика тестируется отдельно от компонентов.
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

Собирается **без** service worker и без `vite-plugin-pwa`: манифест — статический `public/site.webmanifest`, splash для iOS — рантайм-библиотека `ios-pwa-splash` из `createApp.ts`, промпт установки — `@owliehq/vue-addtohomescreen`. У обоих пакетов нет своих типов, декларации лежат в [src/env.d.ts](src/env.d.ts). Safe-area отступы заданы в `src/style.css`. Tailwind 4 подключён плагином `@tailwindcss/vite`, отдельного PostCSS-пайплайна в проекте нет.

## Конвенции кода

- Vue 3 Composition API, только `<script setup lang="ts">`. Тяжёлые компоненты подключаются в родителе через `defineAsyncComponent` (см. `HomePage.vue`).
- Props и emits описываются через дженерики (`defineProps<{...}>()`), а не объектным синтаксисом.
- Имена компонентов и их файлов — PascalCase, композаблы — `useXxx.ts`, переменные и функции — camelCase.
- Строки — двойные кавычки. ES-модули везде.
- Стили — только утилитарные классы Tailwind 4 в шаблоне; глобальное — в `src/style.css`. Тема тёмная (`bg-slate-900 text-slate-400` на `<body>`).
- Тесты лежат рядом с кодом как `*.test.ts`.
- Коммиты — Conventional Commits на русском.

## CI и деплой

- `.github/workflows/ci.yml`: на PR и push в `main` — typecheck, ESLint, `prettier --check`, тесты.
- `.github/workflows/deploy.yml`: push в `main` → `npm ci` → `npm run build` (включает typecheck) с `VITE_BUILD_VERSION=${{ github.sha }}` и `VITE_TOMORROW_API_KEY` из секретов → GitHub Pages → уведомление в Telegram. Шаг уведомления помечен `continue-on-error`: сайт к нему уже опубликован.
- `VITE_BUILD_VERSION` показывается в `VersionString.vue` (первые 7 символов SHA); при локальной сборке переменной нет и отображается `ver: develop`.

`index.html` содержит счётчик Яндекс.Метрики — при правках `<head>`/`<body>` его не терять.
