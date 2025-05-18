module.exports = {
  // Настройки MySQL
  database: {
    host: '77.222.40.238',
    port: 3306,
    database: 'nowfowmai3',
    user: 'nowfowmai3',
    password: 'm8C09A54',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },

  // Настройки WebDAV
  webdav: {
    url: 'https://webdav.cloud.mail.ru/',
    username: 'nowfow@mail.ru',
    password: 'FpeY7pxjVeQJEJpEjaar'
  },

  // Настройки сервера
  server: {
    port: 5000,
    uploadLimit: 200 * 1024 * 1024 // 50MB в байтах
  }
}; 