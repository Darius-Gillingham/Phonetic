const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const transcribeAudio = require('./transcribe');
const logTranscript = require('./TranscriptLogger');
const summarize = require('./summarize');
const getGPTReply = require('./gpt');
const synthesizeSpeech = require('./tts');

async function streamHandler(req, res) {
  try {
    console.log('📥 Received audio stream POST');

    const audioBuffer = req.body.audio;
    const callSid = req.body.callSid || 'unknown';
    if (!audioBuffer) {
      console.log('❌ No audio buffer received');
      return res.status(400).json({ error: 'No audio buffer provided' });
    }

    const fileId = uuidv4();
    const filePath = path.join(__dirname, 'audio', `${fileId}.mp3`);
    fs.writeFileSync(filePath, Buffer.from(audioBuffer, 'base64'));

    console.log(`🎙️ Audio saved as ${fileId}.mp3 — beginning transcription`);

    const transcript = await transcribeAudio(filePath);
    console.log(`📄 Transcription complete: ${transcript}`);

    await logTranscript(callSid, transcript);

    const summary = await summarize(transcript);
    console.log(`📝 Summary: ${summary}`);

    const reply = await getGPTReply(summary);
    console.log(`🤖 GPT Reply: ${reply}`);

    const ttsBuffer = await synthesizeSpeech(reply);
    if (!ttsBuffer) {
      console.log('❌ Failed to synthesize speech');
      return res.status(500).json({ error: 'Failed to synthesize reply' });
    }

    console.log('✅ Sending TTS audio buffer back to client');

    res.status(200).json({ audio: ttsBuffer.toString('base64') });
  } catch (err) {
    console.error('❌ Error in streamHandler:', err.message);
    res.status(500).json({ error: 'Stream handling failed' });
  }
}

function keepaliveHandler(req, res) {
  res.status(200).send('🔁 Keepalive');
}

module.exports = {
  streamHandler,
  keepaliveHandler,
};
