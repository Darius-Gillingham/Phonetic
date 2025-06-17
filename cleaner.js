// File: cleaner.js
// Commit: create standalone audio cleanup daemon

require('dotenv').config();
const { deleteOldAudioFiles } = require('./lifecycle');

// 🔁 Run every minute
setInterval(() => {
  deleteOldAudioFiles(); // default = 5 minutes old
}, 60 * 1000);

console.log('🧹 Audio cleanup daemon running every 60 seconds');
