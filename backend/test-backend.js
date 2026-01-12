const http = require('http');

const data = JSON.stringify({
    name: "Test User",
    rollNo: "TEST001",
    descriptor: Array(128).fill(0.1)
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', responseBody);
    });
});

req.on('error', (error) => {
    console.error("Test Failed:", error.message);
});

req.write(data);
req.end();
