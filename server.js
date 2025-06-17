// File: server.js
// Commit: add frontend WebSocket server on /client-stream for live transcripts

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
const { setupClientStream } = require('./clientStream');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/audio' });
const clientWss = new WebSocket.Server({ server, path: '/client-stream' });

app.use(cors({
  origin: 'https://your-vercel-site.vercel.app', // Replace with actual domain
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

app.get('/ping', (req, res) => {
  res.json({ status: 'online', service: 'Gillingham TTS Backend' });
});

setupWebSocket(wss);
setupClientStream(clientWss);

server.listen(8080, () => {
  console.log(`🌐 Server running at http://localhost:8080`);
});
