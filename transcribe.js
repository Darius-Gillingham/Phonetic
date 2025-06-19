// File: transcribe.js
// Commit: extract Whisper transcription logic into standalone transcribe.js module

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function transcribeAudio(filePath) {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('model', 'whisper-1');
    form.append('language', 'en');
    form.append('response_format', 'json');

    console.log(`📤 Sending audio file to Whisper for transcription: ${filePath}`);

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const transcript = response.data.text || '';
    console.log('📝 Transcribed text:', transcript);
    return transcript;
  } catch (err) {
    console.error('❌ Error in transcribeAudio:', err.response?.data || err.message);
    return '';
  }
}

module.exports = transcribeAudio;
