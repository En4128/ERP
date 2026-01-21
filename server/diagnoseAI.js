const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const diagnoseAI = async () => {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    let log = '--- AI Diagnostics ---\n';
    log += 'API Key Length: ' + (apiKey ? apiKey.length : 0) + '\n';
    log += 'Environment: ' + process.env.NODE_ENV + '\n';

    if (!apiKey) {
        log += 'CRITICAL: API Key is missing.\n';
        fs.writeFileSync('ai_diagnostics.log', log);
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try to fetch models using a trick - although listModels isn't directly on genAI in all versions
        // We'll try a very standard one
        const testModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];

        for (const modelName of testModels) {
            log += '\nTesting ' + modelName + '...';
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Say 'ready'");
                const response = await result.response;
                log += ' SUCCESS: ' + response.text();
            } catch (e) {
                log += ' FAILED: ' + e.message;
            }
        }
    } catch (error) {
        log += '\nFatal Error: ' + error.message;
    }

    log += '\n\n--- End of Diagnostics ---';
    fs.writeFileSync('ai_diagnostics.log', log);
    console.log('Diagnostics written to ai_diagnostics.log');
};

diagnoseAI();
