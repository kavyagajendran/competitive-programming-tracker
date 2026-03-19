const https = require('https');

const url = 'https://kontests.net/api/v1/codeforces';

console.log(`Fetching ${url}...`);

https.get(url, (res) => {
    console.log('statusCode:', res.statusCode);

    let data = '';
    res.on('data', (d) => {
        data += d;
    });

    res.on('end', () => {
        console.log('Body length:', data.length);
        if (res.statusCode === 200) {
            try {
                const json = JSON.parse(data);
                console.log('First contest:', json[0]);
            } catch (e) {
                console.log('Error parsing JSON:', e);
                console.log('Body:', data.substring(0, 200));
            }
        } else {
            console.log('Body:', data.substring(0, 200));
        }
    });

}).on('error', (e) => {
    console.error(e);
});
