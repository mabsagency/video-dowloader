const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing yt-dlp...');

try {
  // Check if yt-dlp is already installed
  try {
    execSync('yt-dlp --version', { stdio: 'pipe' });
    console.log('✅ yt-dlp is already installed!');
  } catch (e) {
    // yt-dlp not found, install it
    console.log('Downloading yt-dlp...');

    // Download yt-dlp executable for Windows
    const https = require('https');
    const ytDlpUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
    const ytDlpPath = path.join(__dirname, 'yt-dlp.exe');

    const file = fs.createWriteStream(ytDlpPath);
    https.get(ytDlpUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ yt-dlp downloaded successfully!');

        // Add to PATH temporarily for this session
        const binDir = path.join(__dirname);
        console.log(`📍 yt-dlp installed at: ${ytDlpPath}`);
        console.log('💡 Make sure yt-dlp.exe is in your system PATH or in the project directory');
      });
    }).on('error', (err) => {
      console.error('❌ Error downloading yt-dlp:', err.message);
      process.exit(1);
    });
  }
} catch (error) {
  console.error('❌ Error installing yt-dlp:', error.message);
  process.exit(1);
}