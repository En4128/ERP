const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const testAI = async () => {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    let log = '';

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        console.log('Listing models...');
        // The SDK might have changed, listing models usually involves the genAI object
        // but let's try a direct approach or check if the method exists

        let modelsList = [];
        try {
            // Note: In older SDKs it might be genAI.listModels()
            // In newer ones, it might be different or not directly available on genAI
            // Just trying to generate content with a very basic model name first
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            console.log('Attempting with gemini-pro...');
            const result = await model.generateContent("test");
            log = 'gemini-pro worked!';
        } catch (e) {
            log = 'Listing models/gemini-pro failed: ' + e.message;
        }

        fs.writeFileSync('ai_models.log', log);
        console.log(log);
    } catch (error) {
        fs.writeFileSync('ai_models.log', error.message);
        console.error(error);
    }
};

testAI();
