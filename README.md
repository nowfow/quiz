# WebDAV Music Player

Веб-приложение для воспроизведения музыки с WebDAV сервера, развернутое на Cloudflare Workers & Pages.

## Функциональность

- Воспроизведение аудиофайлов с WebDAV сервера
- Загрузка новых треков через веб-интерфейс
- Хранение плейлиста в базе данных Cloudflare D1
- Современный интерфейс на React + Material-UI

## Технологии

- Frontend: React, Material-UI
- Backend: Cloudflare Workers
- Database: Cloudflare D1
- Storage: WebDAV (Mail.ru Cloud)

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/webdav-player.git
cd webdav-player
```

2. Установите зависимости:
```bash
npm install
cd client
npm install
```

3. Настройте переменные окружения:
- Создайте файл `.env` в корневой директории
- Добавьте необходимые переменные окружения (см. `.env.example`)

4. Разверните на Cloudflare:
```bash
# Развертывание Worker
wrangler deploy

# Развертывание фронтенда
cd client
npm run build
wrangler pages deploy build
```

## Структура проекта

```
webdav-player/
├── client/                 # React frontend
│   ├── public/
│   └── src/
├── worker.js              # Cloudflare Worker
├── wrangler.toml          # Worker конфигурация
├── schema.sql            # SQL схема базы данных
└── package.json
```

## Лицензия

MIT 