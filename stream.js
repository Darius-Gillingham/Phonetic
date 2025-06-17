// File: stream.js
// Commit: extract /stream and /keepalive handlers

const twilio = require('twilio');

function streamHandler(req, res) {
  const sid = req.query.sid || req.body.CallSid;
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.connect().stream({
    url: `wss://${process.env.PUBLIC_HOST}/audio`,
    parameters: [{ name: 'codec', value: 'audio/L16;rate=16000' }]
  });

  twiml.pause({ length: 599 });
  twiml.redirect(`https://${process.env.PUBLIC_HOST}/keepalive?sid=${sid}`);

  res.type('text/xml');
  res.send(twiml.toString());
}

function keepaliveHandler(req, res) {
  const sid = req.query.sid || req.body.CallSid;
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.connect().stream({
    url: `wss://${process.env.PUBLIC_HOST}/audio`,
    parameters: [{ name: 'codec', value: 'audio/L16;rate=16000' }]
  });

  twiml.pause({ length: 599 });
  twiml.redirect(`https://${process.env.PUBLIC_HOST}/keepalive?sid=${sid}`);

  res.type('text/xml');
  res.send(twiml.toString());
}

module.exports = { streamHandler, keepaliveHandler };
