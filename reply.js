// File: reply.js
// Commit: remove per-request audio deletion in favor of cleaner daemon

const twilio = require('twilio');
const path = require('path');

module.exports = function replyHandler(req, res) {
  const sid = req.query.sid;
  const file = req.query.file;
  const twiml = new twilio.twiml.VoiceResponse();

  console.log(`📞 /reply hit with sid: ${sid} and file: ${file}`);

  twiml.play(`https://${req.headers.host}/audio/${file}`);
  twiml.pause({ length: 1 });
  twiml.redirect(`https://${req.headers.host}/keepalive?sid=${sid}`);

  res.type('text/xml');
  res.send(twiml.toString());
};
