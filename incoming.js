// File: incoming.js
// Commit: extract /incoming route from server.js

const twilio = require('twilio');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const synthesizeSpeech = require('./tts');
const getGPTReply = require('./gpt');

module.exports = async function incomingHandler(req, res) {
  const callSid = req.body.CallSid;
  console.log('📞 Incoming Twilio webhook:');
  console.log(JSON.stringify(req.body, null, 2));

  const twiml = new twilio.twiml.VoiceResponse();

  try {
    const gptGreeting = await getGPTReply('Greet the caller warmly and professionally and please mention that you are the Gillingham Software AI Answering Machine.');
    const greetingBuffer = await synthesizeSpeech(gptGreeting);

    const audioDir = path.join(__dirname, 'audio');
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

    const audioFilename = `${uuidv4()}.mp3`;
    const audioPath = path.join(audioDir, audioFilename);
    fs.writeFileSync(audioPath, greetingBuffer);
    const publicAudioUrl = `https://${req.headers.host}/audio/${audioFilename}`;

    twiml.play(publicAudioUrl);
    twiml.pause({ length: 1 });
    twiml.redirect(`/stream?sid=${callSid}`);
  } catch (err) {
    console.error('❌ Error preparing greeting:', err.message);
    twiml.say('Hello. Welcome to Gillingham Software.');
    twiml.redirect(`/stream?sid=${callSid}`);
  }

  res.type('text/xml');
  res.send(twiml.toString());
};
