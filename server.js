// File: server.js
// Commit: restore transcriber compatibility and update to use separated logic structure

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
  origin: process.env.CORS_ORIGIN || 'https://phonetic-front-oppbj4g5q-darius-gillinghams-projects.vercel.app/',
  credentials: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/audio', express.static(path.join(__dirname, 'audio')));

app.post('/incoming', incomingRoute);
app.post('/stream', streamRoutes.streamHandler);
app.post('/keepalive', streamRoutes.keepaliveHandler);
app.post('/reply', replyRoute);

app.get('/', (req, res) => {
  res.send('<h1>📞 Gillingham AI Call Server</h1>');
});

setupWebSocket(wss);

server.listen(8080, () => {
  console.log(`🌐 Server running at http://localhost:8080`);
});
