const http = require('http');
const fs = require('fs');

const postData = JSON.stringify({
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    format: 'mp4',
    quality: '720p'
});

const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/download',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing /api/download...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers);

    const outPath = './downloads/test-output.bin';
    const fileStream = fs.createWriteStream(outPath);

    res.on('data', (chunk) => {
        fileStream.write(chunk);
    });

    res.on('end', () => {
        fileStream.end();
        console.log('Download response saved to', outPath);
        try {
            const content = fs.readFileSync(outPath, 'utf8');
            console.log('File preview (first 300 chars):\n', content.slice(0,300));
        } catch (e) {
            console.log('Saved binary file (not previewable as text).');
        }
    });
});

req.on('error', (e) => {
    console.error('Problem with request:', e);
});

req.write(postData);
req.end();