// File: reply.js
const fs = require('fs');
const path = require('path');
const twilio = require('twilio');

module.exports = function replyHandler(req, res) {
  const sid = req.query.sid;
  const file = req.query.file;
  const twiml = new twilio.twiml.VoiceResponse();
  const filePath = path.join(__dirname, 'audio', file);

  twiml.play(`https://${req.headers.host}/audio/${file}`);
  twiml.pause({ length: 1 });
  twiml.redirect(`https://${req.headers.host}/keepalive?sid=${sid}`);

  res.type('text/xml');
  res.send(twiml.toString());

  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`❌ Error deleting ${file}:`, err.message);
        else console.log(`🧹 Deleted audio file ${file}`);
      });
    }
  }, 10_000);
};
