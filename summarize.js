// File: summarize.js
// Commit: add OpenAI-powered summarization function with error handling

const axios = require('axios');
require('dotenv').config();

async function summarize(text) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful summarization engine. Return only a concise paragraph summary of the transcript.'
          },
          {
            role: 'user',
            content: text
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const summary = response.data.choices?.[0]?.message?.content?.trim();
    console.log('🧾 Summary generated:', summary);
    return summary || '[summary unavailable]';
  } catch (err) {
    console.error('❌ Summarization error:', err.response?.data || err.message);
    return '[summary failed]';
  }
}

module.exports = summarize;
