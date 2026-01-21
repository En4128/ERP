const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const verifyFix = async () => {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    console.log('Verifying Fix with model: gemini-2.0-flash');

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        console.log('Sending test prompt...');
        const result = await model.generateContent("Hello! Are you alive?");
        const response = await result.response;
        const text = response.text();

        console.log('AI Response:', text);
        console.log('SUCCESS: gemini-2.0-flash is working perfectly!');
    } catch (error) {
        console.error('Verification FAILED!');
        console.error('Error:', error.message);
    }
};

verifyFix();
