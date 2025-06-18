// File: tts.js
// Commit: log TTS input and confirmation after speech synthesis

const axios = require('axios');
const stream = require('stream');
const { promisify } = require('util');

const pipeline = promisify(stream.pipeline);

async function synthesizeSpeech(text) {
  try {
    console.log('🔊 Synthesizing speech for:', text);

    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        voice: 'onyx',
        input: text.trim()
      },
      {
        responseType: 'stream',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const chunks = [];
    for await (const chunk of response.data) {
      chunks.push(chunk);
    }

    console.log('✅ TTS synthesis complete');
    return Buffer.concat(chunks);
  } catch (err) {
    console.error('[TTS ERROR]', err.message);
    return null;
  }
}

module.exports = synthesizeSpeech;
