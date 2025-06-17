// File: server.js
// Commit: safely add /ping health check endpoint

require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const cors = require('cors');

const incomingRoute = require('./incoming');
const streamRoutes = require('./stream');
const replyRoute = require('./reply');
const setupWebSocket = require('./audioStream');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/audio' });

// ✅ Allow requests from Vercel-hosted frontend
app.use(cors({
  origin: 'https://your-vercel-site.vercel.app',
  credentials: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// ✅ Routes
app.post('/incoming', incomingRoute);
app.post('/stream', streamRoutes.streamHandler);
app.post('/keepalive', streamRoutes.keepaliveHandler);
app.post('/reply', replyRoute);

// ✅ Ping health check
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'online', service: 'Gillingham TTS Backend' });
});

// ✅ Default root
app.get('/', (req, res) => {
  res.send('<h1>📞 Gillingham AI Call Server</h1>');
});

// ✅ WebSocket
setupWebSocket(wss);

// ✅ Start server
server.listen(8080, () => {
  console.log(`🌐 Server running at http://localhost:8080`);
});
