// File: cleaner.js
// Commit: remove deprecated dependency

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const AUDIO_DIR = path.join(__dirname, 'audio');
const MAX_AGE_MS = 2 * 60 * 1000; // 2 minutes

function deleteOldAudioFiles() {
  fs.readdir(AUDIO_DIR, (err, files) => {
    if (err) {
      console.error('❌ Failed to read audio directory:', err.message);
      return;
    }

    const now = Date.now();

    files.forEach((file) => {
      const fullPath = path.join(AUDIO_DIR, file);
      if (!file.endsWith('.mp3')) return;

      fs.stat(fullPath, (err, stats) => {
        if (err) {
          console.error(`❌ Error statting file ${file}:`, err.message);
          return;
        }

        const age = now - stats.mtimeMs;
        if (age > MAX_AGE_MS) {
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.error(`❌ Error deleting ${file}:`, err.message);
            } else {
              console.log(`🧹 Deleted stale file: ${file}`);
            }
          });
        }
      });
    });
  });
}

// 🔁 Run every minute
setInterval(() => {
  console.log('🕒 Running audio cleanup task...');
  deleteOldAudioFiles();
}, 60 * 1000);

console.log('🧹 Audio cleanup daemon running every 60 seconds');
