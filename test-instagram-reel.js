const http = require('http');

const postData = JSON.stringify({
    url: 'https://www.instagram.com/reel/DSztmOrDDKt/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ=='
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/analyze',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing API with Instagram Reel URL...');

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
    console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();