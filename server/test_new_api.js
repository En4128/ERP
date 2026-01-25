const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

    console.log("Testing models with new API key...\n");

    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-flash-latest'
    ];

    for (const modelName of modelsToTest) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Hello' in one word");
            const text = result.response.text();
            console.log(`✅ ${modelName} WORKS - Response: ${text.substring(0, 30)}\n`);
        } catch (error) {
            if (error.status === 429) {
                console.log(`⚠️  ${modelName} WORKS but quota exceeded\n`);
            } else if (error.status === 404) {
                console.log(`❌ ${modelName} NOT AVAILABLE (404)\n`);
            } else {
                console.log(`❌ ${modelName} FAILED: ${error.message}\n`);
            }
        }
    }
}

testModels();
