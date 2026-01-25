
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

    console.log("--- STARTING MODEL TESTS ---");

    // Test 1: gemini-pro (Standard 1.0 Pro)
    console.log("Testing gemini-pro...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello, are you there?");
        console.log("PASS: gemini-pro is WORKING. Response:", result.response.text().substring(0, 20));
    } catch (e) {
        console.log("FAIL: gemini-pro FAILED:", e.message);
    }

    // Test 2: gemini-1.5-flash (Standard 1.5 Flash) - failed before but testing again cleanly
    console.log("\nTesting gemini-1.5-flash...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("PASS: gemini-1.5-flash is WORKING");
    } catch (e) {
        console.log("FAIL: gemini-1.5-flash FAILED:", e.message);
    }

    // Test 3: gemini-2.0-flash-exp (maybe they have access to experimental?) or just flash-latest
    console.log("\nTesting gemini-1.5-pro...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent("Hello");
        console.log("PASS: gemini-1.5-pro is WORKING");
    } catch (e) {
        console.log("FAIL: gemini-1.5-pro FAILED:", e.message);
    }

    // Test 4: gemini-flash-latest (The one that caused issues but worked technically)
    console.log("\nTesting gemini-flash-latest...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Hello");
        console.log("PASS: gemini-flash-latest is WORKING");
    } catch (e) {
        // We expect this might fail with 429, but not 404
        console.log("FAIL: gemini-flash-latest FAILED:", e.message);
    }
}

listModels();
