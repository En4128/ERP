const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '.env');
const content = fs.readFileSync(envPath, 'utf8');
console.log('--- .env Raw Content ---');
console.log(content.replace(/\r/g, '\\r').replace(/\n/g, '\\n'));

dotenv.config();
const apiKey = process.env.GOOGLE_AI_API_KEY;

if (apiKey) {
    console.log('\n--- API Key Analysis ---');
    console.log('Length:', apiKey.length);
    let codes = [];
    for (let i = 0; i < apiKey.length; i++) {
        codes.push(apiKey.charCodeAt(i));
    }
    console.log('Character Codes:', codes.join(', '));
    console.log('First 5:', apiKey.substring(0, 5));
    console.log('Last 5:', apiKey.substring(apiKey.length - 5));
} else {
    console.log('API Key not found in process.env');
}
