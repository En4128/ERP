const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listAvailableModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

    try {
        console.log("Fetching available models...\n");

        // The SDK exposes listModels via the main instance
        const models = await genAI.listModels();

        console.log(`Found ${models.length} models:\n`);

        models.forEach((model, index) => {
            console.log(`${index + 1}. ${model.name}`);
            console.log(`   Display Name: ${model.displayName}`);
            console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
            console.log('');
        });

        // Find models that support generateContent
        const contentGenModels = models.filter(m =>
            m.supportedGenerationMethods?.includes('generateContent')
        );

        console.log(`\n=== MODELS SUPPORTING generateContent ===`);
        contentGenModels.forEach(m => {
            console.log(`✓ ${m.name}`);
        });

    } catch (error) {
        console.error('Error listing models:', error.message);
    }
}

listAvailableModels();
