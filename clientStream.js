// File: clientStream.js
// Commit: WebSocket server for live frontend transcription feed

let frontendClients = new Set();

function setupClientStream(wss) {
  wss.on('connection', (ws) => {
    console.log('🧠 Frontend WebSocket connected');
    frontendClients.add(ws);

    ws.on('close', () => {
      frontendClients.delete(ws);
      console.log('🧠 Frontend WebSocket disconnected');
    });
  });
}

function broadcastTranscript(transcript) {
  const payload = JSON.stringify({ type: 'transcript', text: transcript });
  for (const client of frontendClients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

module.exports = {
  setupClientStream,
  broadcastTranscript
};
