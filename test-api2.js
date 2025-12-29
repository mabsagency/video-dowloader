const http = require('http');

const postData = JSON.stringify({
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
});

const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/analyze',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing API with HTTP to 127.0.0.1...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            console.log('Response:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Raw response:', body);
        }
    });
});

req.on('error', (e) => {
    console.error('Problem with request:', e);
});

req.write(postData);
req.end();