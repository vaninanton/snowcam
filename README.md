# SnowCam

Веб-приложение для просмотра веб-камер и погоды горнолыжного курорта Шымбулак. Поддерживает HLS-потоки в реальном времени, почасовой прогноз погоды и установку как PWA на устройство.

## Возможности

- **Веб-камеры** — просмотр до четырёх HLS-потоков с верхней, средней и базовых станций
- **Погода** — виджет с текущей температурой и почасовым прогнозом (Tomorrow.io)
- **PWA** — установка на главный экран, поддержка iOS и Android

## Стек

- Vue 3, Vite 7
- Tailwind CSS 4
- HLS.js — воспроизведение HLS-потоков
- Tomorrow.io API — погода

## Требования

- Node.js (рекомендуется актуальная LTS)
- npm

## Установка и запуск

```bash
# Клонирование репозитория
git clone git@github.com:vaninanton/snowcam.git
cd snowcam

# Установка зависимостей
npm install

# Копирование примера переменных окружения
cp .env.example .env
```

Для работы виджета погоды в `.env` нужно указать ключ API Tomorrow.io:

```env
VITE_TOMORROW_API_KEY=ваш_ключ
```

Ключ можно получить на [tomorrow.io](https://www.tomorrow.io/).

```bash
# Режим разработки (с HTTPS через mkcert)
npm run dev

# Сборка для продакшена
npm run build

# Просмотр собранной версии
npm run preview
```

После `npm run dev` приложение доступно по адресу из вывода Vite (по умолчанию с `--host=0.0.0.0` — в локальной сети).

## Скрипты

| Команда           | Описание                        |
| ----------------- | ------------------------------- |
| `npm run dev`     | Запуск dev-сервера с HTTPS      |
| `npm run build`   | Сборка в `dist/`                |
| `npm run preview` | Локальный просмотр сборки       |
| `npm run eslint`  | Проверка и автоисправление кода |
| `npm run format`  | Форматирование через Prettier   |

## Деплой

Развёртывание выполняется на **GitHub Pages** при пуше в ветку `main` (см. `.github/workflows/deploy.yml`). Для сборки в CI нужны секреты:

- `VITE_TOMORROW_API_KEY` — ключ Tomorrow.io
- `TELEGRAM_TOKEN`, `TELEGRAM_TO` — для уведомления о деплое в Telegram (опционально)

Продакшен: **https://snowcam.vaninanton.ru**
