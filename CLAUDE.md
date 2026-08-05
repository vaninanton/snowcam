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
npm run build        # сборка в dist/
npm run preview      # просмотр сборки (тоже по HTTPS — curl'ить с -k)
npm run eslint       # ESLint с автофиксом
npm run format       # Prettier по src/
```

**Тестов нет.** `npm test` — заглушка (`echo && exit 0`), вызывается из `.husky/pre-commit` перед `lint-staged`. Не предлагать «запустить тесты»; проверка изменений — это `npm run eslint` + `npm run build`.

### Линтинг

`eslint.config.js` — flat-config для ESLint 10: `@eslint/js` recommended → `eslint-plugin-vue` (`flat/essential`, соответствует прежнему `vue3-essential`) → `eslint-config-prettier` последним. Форматирующих правил в ESLint нет: перенос строк и отступы целиком за Prettier (`printWidth` по умолчанию), поэтому `max-len` не задаётся. Отдельные блоки конфига раздают browser-глобалы для `src/`, node-глобалы для `vite.config.js` и `eslint.config.js`, и отключают `vue/multi-word-component-names` для `src/Index.vue`.

Pre-commit (husky + lint-staged) прогоняет по изменённым `*.{js,vue}` сначала `eslint --fix`, затем `prettier --write`.

В `.npmrc` включён `legacy-peer-deps=true` — peer-зависимости не доустанавливаются автоматически. Из-за этого `vue-eslint-parser` (peer для `eslint-plugin-vue`) прописан в `devDependencies` явно; при добавлении плагинов с peer-зависимостями их тоже нужно ставить руками.

## Архитектура

`server.https: true` + `vite-plugin-mkcert` дают dev-серверу локально доверенный сертификат. Это нужно именно для проверки с телефона по LAN (`--host=0.0.0.0`): без HTTPS там нет secure context и не появляется промпт установки на homescreen. Плагин обязателен — само по себе `server.https: true` сертификат не выпускает.

### Две точки входа (multi-page Vite)

`vite.config.js` собирает два независимых HTML-входа:

- `index.html` → [src/index.js](src/index.js) → [src/Index.vue](src/Index.vue) — основное приложение (вкладки локаций + погодный виджет + сетка камер)
- `videowall.html` → [src/videowall.js](src/videowall.js) → [src/VideoWall.vue](src/VideoWall.vue) — «видеостена» без обвязки, только сетка потоков

Обе точки входа монтируются через общую фабрику [src/app.js](src/app.js) — `createSnowCamApp(RootComponent, { splashImage, beforeMount })`. Она подключает http-плагин, вызывает `beforeMount(app)` для точечных плагинов (например, `AddToHomescreen` только в `index.js`), монтирует в `#app` и инициализирует iOS PWA splash. **Новый вход добавляется через неё**, а не через собственный `createApp`.

Сборка (rolldown-опции Vite 8) выносит `hls.js` в отдельный чанк `hls`, остальной `node_modules` — в `vendor`. Пути входов резолвятся через `import.meta.dirname` (`__dirname` ломает нативный загрузчик конфига Vite).

### HTTP-слой

[src/http.js](src/http.js) — Vue-плагин, регистрирующий глобальные `$http` (инстанс axios) и `$isLoading`. Интерсептор ответа **возвращает `res.data`**, а не сам response — вызывающий код работает сразу с телом ответа. В `<script setup>` доступ идёт через `getCurrentInstance()?.appContext?.config?.globalProperties?.$http` (см. `TomorrowWidget.vue`), в шаблоне — просто `$http` / `$isLoading`.

### Данные камер

[src/videos.js](src/videos.js) — единственный источник: массив объектов `{ place, title, description, elevation, src, poster, player? }`, `export default`.

- Компоненты фильтруют список по `v.src` — записи с пустым `src` не рендерятся; неактуальные камеры закомментированы прямо в файле.
- `Index.vue` выводит вкладки по уникальным `place` (панель вкладок появляется только при 2+ локациях) и запоминает выбор в `localStorage` под ключом `snowcam-place-tab`.
- Поле `player` (страница плеера ipcamlive) встречается только в закомментированных записях и ничем не используется: скрипт, который автоматически вытаскивал из этой страницы URL m3u8, удалён. Заполнять `src` для таких камер теперь нужно вручную.
- `poster` — путь к превью в `public/previews/`.

### Воспроизведение

[src/components/HlsVideo.vue](src/components/HlsVideo.vue) — тонкая обёртка над `<video>`: если `Hls.isSupported()`, поток грузится через hls.js, иначе (Safari/iOS) `src` ставится напрямую и используется нативный HLS. Атрибуты (`muted`, `controls`, `autoplay`, `playsinline`) передаются как fallthrough-атрибуты от родителя.

### Погода (Tomorrow.io)

`src/components/Tomorrow/`:

- [config.js](src/components/Tomorrow/config.js) — координаты, таймзона `Asia/Almaty`, полный список запрашиваемых полей и `buildTimelineQueryString()` (нативный `URLSearchParams`, окно «сейчас … +1 день», timesteps `current`/`1h`/`1d`). Списочные параметры (`location`, `fields`, `timesteps`) API ждёт через запятую, поэтому массивы склеиваются через `join(",")` вручную.
- [dayjs.js](src/components/Tomorrow/dayjs.js) — **единственное место, где регистрируются плагины dayjs** (`isSameOrAfter`, `isSameOrBefore`). Импортировать дату нужно отсюда (`import dayjs from "./dayjs"`), а не напрямую из `"dayjs"`: библиотека — синглтон, и прямой импорт не увидит расширенных методов. Плагины подключаются с расширением `.js` в пути, иначе модуль не резолвится вне бандлера.
- [TomorrowWidget.vue](src/components/Tomorrow/TomorrowWidget.vue) — единственное место запроса к API. Ответ кэшируется в `localStorage` под ключом `tomorrowioData` **на 6 часов** (у API ограниченный бесплатный лимит — не убирать кэш и не добавлять повторных запросов без необходимости). Клик по `VersionString` в `Index.vue` чистит этот кэш и перезагружает страницу.
- [GetIcon.js](src/components/Tomorrow/GetIcon.js) — маппинг `weatherCode` Tomorrow.io на SVG из `@bybas/weather-icons`, отдельно день/ночь.

Ключ API попадает в бандл как `VITE_TOMORROW_API_KEY` — это публичный клиентский ключ по устройству приложения.

### PWA

Собирается **без** service worker и без `vite-plugin-pwa`: манифест — статический `public/site.webmanifest`, splash для iOS — рантайм-библиотека `ios-pwa-splash` из `src/app.js`, промпт установки — `@owliehq/vue-addtohomescreen`. Safe-area отступы заданы в `src/style.css`. Tailwind 4 подключён плагином `@tailwindcss/vite`, отдельного PostCSS-пайплайна (`postcss.config.*`, autoprefixer) в проекте нет.

## Конвенции кода

- Vue 3 Composition API, только `<script setup>`. Тяжёлые компоненты подключаются в родителе через `defineAsyncComponent` (см. `Index.vue`).
- Имена компонентов и их файлов — PascalCase (`HlsVideo.vue`), переменные и функции — camelCase.
- Строки — двойные кавычки. ES-модули везде; CommonJS только в `.eslintrc.cjs`.
- Стили — исключительно утилитарные классы Tailwind 4 в шаблоне; глобальное — в `src/style.css` (`@import "tailwindcss"`). Тема тёмная (`bg-slate-900 text-slate-400` на `<body>`).
- Второй `<script>` без `setup` допустим для констант и импортов вне реактивности.
- Коммиты — Conventional Commits на русском (`chore(deps): обновить …`, `feat(videos): …`).

## Деплой

`.github/workflows/deploy.yml`: push в `main` → `npm install` → `npm run build` с `VITE_BUILD_VERSION=${{ github.sha }}` и `VITE_TOMORROW_API_KEY` из секретов → GitHub Pages → уведомление в Telegram (`TELEGRAM_TOKEN`, `TELEGRAM_TO`). `VITE_BUILD_VERSION` показывается в `VersionString.vue` (первые 7 символов SHA); при локальной сборке переменной нет и отображается `ver: develop`.

`index.html` содержит счётчик Яндекс.Метрики — при правках `<head>`/`<body>` его не терять.
