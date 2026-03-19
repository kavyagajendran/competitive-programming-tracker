
const http = require('http');

const data = JSON.stringify({
    csvContent: 'test',
    platform: 'LeetCode',
    sheetUrl: 'https://docs.google.com/test',
    fields: ['Global Ranking']
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/track',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Sending request...");
const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
