// File: server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const { setupWebSocket } = require('./audioStream');
const incomingHandler = require('./incoming');
const { streamHandler, keepaliveHandler } = require('./stream');
const replyHandler = require('./reply');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/audio' });

setupWebSocket(wss);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/audio', express.static(path.join(__dirname, 'audio')));

app.post('/incoming', incomingHandler);
app.post('/stream', streamHandler);
app.post('/keepalive', keepaliveHandler);
app.post('/reply', replyHandler);

app.get('/', (req, res) => {
  res.send('<h1>📞 Gillingham Debugger</h1><p>Call activity displayed here in future modules.</p>');
});

server.listen(8080, () => {
  console.log(`🌐 Server running at http://localhost:8080`);
});
