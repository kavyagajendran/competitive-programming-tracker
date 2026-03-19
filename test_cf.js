const https = require('https');

const url = 'https://codeforces.com/api/contest.list?gym=false';

console.log(`Fetching ${url}...`);

https.get(url, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    let data = '';
    res.on('data', (d) => {
        data += d;
    });

    res.on('end', () => {
        console.log('Body length:', data.length);
        console.log('First 200 chars:', data.substring(0, 200));
    });

}).on('error', (e) => {
    console.error(e);
});
