# WebDAV Music Player

Веб-приложение для воспроизведения музыки с WebDAV сервера.

## Функциональность

- Воспроизведение аудиофайлов с WebDAV сервера
- Загрузка новых треков через веб-интерфейс
- Хранение плейлиста в базе данных MySQL
- Современный интерфейс на React + Material-UI

## Технологии

- Frontend: React, Material-UI
- Backend: Node.js, Express
- Database: MySQL
- Storage: WebDAV (Mail.ru Cloud)

## Быстрый старт

1. Установите зависимости:
```bash
npm install
cd client && npm install
```

2. Запустите приложение:
```bash
npm run dev:full
```

Приложение будет доступно по адресу: http://localhost:3000

## Настройка

Создайте файл `.env` в корневой директории со следующими параметрами:

```env
# Database configuration
DB_HOST=your_db_host
DB_PORT=3306
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# WebDAV configuration
WEBDAV_URL=your_webdav_url
WEBDAV_USERNAME=your_webdav_username
WEBDAV_PASSWORD=your_webdav_password

# Server configuration
PORT=5000
```

## Структура проекта

```
musicquiz/
├── client/                 # React frontend
│   ├── public/
│   └── src/
├── server.js              # Express server
├── schema.sql            # SQL схема базы данных
└── package.json
```

## Лицензия

MIT 