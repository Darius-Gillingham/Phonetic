// File: TranscriptLogger.js
// Commit: add logging for successful and failed Supabase transcript inserts

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
const supabase = createClient(supabaseUrl, supabaseKey);

async function logTranscript(callSid, text) {
  try {
    const { error } = await supabase
      .from('transcripts')
      .insert([
        {
          call_sid: callSid,
          text: text,
          timestamp: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
    } else {
      console.log(`✅ Transcript saved to Supabase for ${callSid}`);
    }
  } catch (err) {
    console.error('❌ Supabase log failure:', err.message);
  }
}

module.exports = logTranscript;
