const https = require('https');

const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://codeforces.com/api/contest.list?gym=false');

console.log(`Fetching ${proxyUrl}...`);

https.get(proxyUrl, (res) => {
    console.log('statusCode:', res.statusCode);

    let data = '';
    res.on('data', (d) => {
        data += d;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                const json = JSON.parse(data);
                if (json.status === 'OK') {
                    console.log(`Success! Found ${json.result.length} contests.`);
                    const upcoming = json.result.filter(c => c.phase === 'BEFORE');
                    console.log(`Upcoming: ${upcoming.length}`);
                    if (upcoming.length > 0) console.log(upcoming[0]);
                } else {
                    console.log('API Error:', json);
                }
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
