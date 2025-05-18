require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { createClient } = require('webdav');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Настройка multer для временного хранения файлов
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit
  },
});

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// WebDAV client
const webdavClient = createClient(process.env.WEBDAV_URL, {
  username: process.env.WEBDAV_USERNAME,
  password: process.env.WEBDAV_PASSWORD,
});

// Routes
app.get('/api/playlist', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM playlist ORDER BY position');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/playlist', async (req, res) => {
  const { title, path, position } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO playlist (title, path, position) VALUES (?, ?, ?)',
      [title, path, position]
    );
    const [newTrack] = await pool.query('SELECT * FROM playlist WHERE id = ?', [result.insertId]);
    res.json(newTrack[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = req.file.originalname;
    const filePath = `/music/${fileName}`;
    
    // Загрузка файла на WebDAV
    await webdavClient.putFileContents(filePath, req.file.buffer);
    
    // Получаем последнюю позицию в плейлисте
    const [lastPosition] = await pool.query('SELECT MAX(position) as maxPos FROM playlist');
    const nextPosition = (lastPosition[0].maxPos || 0) + 1;
    
    // Добавляем трек в плейлист
    const [result] = await pool.query(
      'INSERT INTO playlist (title, path, position) VALUES (?, ?, ?)',
      [fileName, filePath, nextPosition]
    );
    
    const [newTrack] = await pool.query('SELECT * FROM playlist WHERE id = ?', [result.insertId]);
    res.json(newTrack[0]);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/track/:path', async (req, res) => {
  try {
    const stream = webdavClient.createReadStream(req.params.path);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 