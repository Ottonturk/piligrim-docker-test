const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const dotenv = require('dotenv');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const amadeusAuthService = require('./services/amadeusAuthService');

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;
const mongoURI = config.get('mongoURI');

// ✅ Сертификаты
const sslOptions = {
  key: fs.readFileSync('private.key'),
  cert: fs.readFileSync('certificate.crt'),
  secureProtocol: 'TLSv1_2_method'
};

// ✅ Логирование в файл
const logToFile = (msg) => {
  const logPath = path.join(__dirname, 'server_logs.txt');
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${msg}\n`, 'utf8');
};

logToFile('Starting server...');

// ✅ Amadeus init
amadeusAuthService.initAmadeusAuth()
  .then(() => {
    console.log('Amadeus authentication initialized successfully');
    logToFile('Amadeus authentication initialized successfully');
  })
  .catch((err) => {
    console.error('Amadeus auth failed:', err);
    logToFile(`Amadeus auth failed: ${err.message}`);
  });

// ✅ Middleware
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'https://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => console.error(err));

app.use(express.json());
app.use('/api/flights', require('./routes/flightRoutes'));

// ✅ Статика + React билд
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'), err => {
      if (err) {
        res.status(500).send(err);
      }
    });
  });
}

// ✅ HTTPS server
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`✅ HTTPS server is running at https://localhost:${port}`);
  logToFile(`HTTPS server is running at https://localhost:${port}`);
});
