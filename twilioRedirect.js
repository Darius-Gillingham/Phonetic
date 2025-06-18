// File: twilioRedirect.js
// Commit: extract Twilio redirect update to separate module

const axios = require('axios');
const path = require('path');

async function sendTwilioRedirect(callSid, filename) {
  const twiml = `<Response><Play>https://${process.env.PUBLIC_HOST}/audio/${filename}</Play><Pause length="1"/><Redirect>https://${process.env.PUBLIC_HOST}/keepalive?sid=${callSid}</Redirect></Response>`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`;

  await axios.post(
    url,
    new URLSearchParams({ Twiml: twiml }),
    {
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
}

module.exports = sendTwilioRedirect;
