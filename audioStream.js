// File: audioStream.js
// Commit: log call start, transcribed text, and GPT reply during stream

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const FormData = require('form-data');

const synthesizeSpeech = require('./tts');
const getGPTReply = require('./gpt');
const logTranscript = require('./TranscriptLogger');

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = function setupWebSocket(wss) {
  wss.on('connection', (ws) => {
    console.log('🔌 WebSocket connected');

    const FLUSH_BYTES = 30000;
    let accumulated = [];
    let accumulatedLength = 0;
    let paused = false;
    let callSid = null;

    ws.on('message', async (msg) => {
      const message = JSON.parse(msg);

      if (message.event === 'start') {
        callSid = message.start.callSid;
        console.log(`📞 Call started: ${callSid}`);
        accumulated = [];
        accumulatedLength = 0;
        paused = false;
      }

      if (message.event === 'media') {
        if (paused) return;

        const buffer = Buffer.from(message.media.payload, 'base64');
        if (buffer.length < 160) return;

        accumulated.push(buffer);
        accumulatedLength += buffer.length;

        if (accumulatedLength >= FLUSH_BYTES) {
          paused = true;
          const combinedBuffer = Buffer.concat(accumulated);
          accumulated = [];
          accumulatedLength = 0;

          const tempDir = path.join(__dirname, 'temp');
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

          const rawPath = path.join(tempDir, `${uuidv4()}.raw`);
          const wavPath = path.join(tempDir, `${uuidv4()}.wav`);
          fs.writeFileSync(rawPath, combinedBuffer);

          ffmpeg()
            .input(rawPath)
            .inputOptions(['-f', 'mulaw', '-ar', '8000', '-ac', '1'])
            .outputOptions(['-ar', '16000', '-ac', '1'])
            .toFormat('wav')
            .on('error', (err) => {
              console.error('❌ ffmpeg error:', err.message);
              if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
              paused = false;
            })
            .on('end', async () => {
              try {
                const form = new FormData();
                form.append('file', fs.createReadStream(wavPath));
                form.append('model', 'whisper-1');
                form.append('language', 'en');
                form.append('response_format', 'json');

                const whisperRes = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
                  headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
                  }
                });

                const transcript = whisperRes.data.text || '';
                console.log('📝 Transcribed text:', transcript);
                await logTranscript(callSid, transcript);

                const reply = await getGPTReply(transcript);
                console.log('🤖 AI reply:', reply);

                const replyBuffer = await synthesizeSpeech(reply);
                const audioFilename = `${uuidv4()}.mp3`;
                const audioPath = path.join(__dirname, 'audio', audioFilename);
                fs.writeFileSync(audioPath, replyBuffer);

                console.log(`🔁 Redirecting to /reply for ${audioFilename}`);
                await axios.post(
                  `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`,
                  new URLSearchParams({
                    Twiml: `<Response><Play>https://${process.env.PUBLIC_HOST}/audio/${audioFilename}</Play><Pause length="1"/><Redirect>https://${process.env.PUBLIC_HOST}/keepalive?sid=${callSid}</Redirect></Response>`
                  }),
                  {
                    auth: {
                      username: process.env.TWILIO_ACCOUNT_SID,
                      password: process.env.TWILIO_AUTH_TOKEN
                    },
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                  }
                );
              } catch (err) {
                console.error('❌ Error in STT/TTS or Twilio update:', err.response?.data || err.message);
              } finally {
                if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
                if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
                paused = false;
              }
            })
            .save(wavPath);
        }
      }

      if (message.event === 'stop') {
        console.log('⛔️ Call ended');
        accumulated = [];
        accumulatedLength = 0;
      }
    });

    ws.on('close', () => {
      console.log('❌ WebSocket disconnected');
    });
  });
};
