// File: fileUtils.js
// Commit: add helper functions for file creation and safe cleanup

const fs = require('fs');
const path = require('path');

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑 Deleted file: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Failed to delete ${filePath}:`, err.message);
  }
}

function writeTempFile(dir, buffer, extension = 'tmp') {
  ensureDirExists(dir);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, buffer);
  console.log(`📝 Wrote temp file: ${fullPath}`);
  return fullPath;
}

module.exports = {
  ensureDirExists,
  safeUnlink,
  writeTempFile
};
