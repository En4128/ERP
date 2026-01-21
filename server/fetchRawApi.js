const https = require('https');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GOOGLE_AI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log('Fetching from:', url.replace(apiKey, 'API_KEY'));

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        fs.writeFileSync('raw_api_response.json', data);
        console.log('Response saved to raw_api_response.json');
        try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
                console.log('API Error:', parsed.error.message);
                console.log('Error Reason:', parsed.error.status);
            } else if (parsed.models) {
                console.log('Success! Found', parsed.models.length, 'models.');
            }
        } catch (e) {
            console.log('Failed to parse response as JSON');
        }
    });
}).on('error', (err) => {
    console.error('Network Error:', err.message);
});
