const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initializing the Google Generative AI with the API Key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

exports.askChatbot = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        // Use gemini-flash-latest which points to the most supported flash version
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `You are a helpful and professional Smart Campus ERP assistant. 
        You help students and faculty with their queries about attendance, marks, courses, and general campus life.
        Keep your responses concise, friendly, and professional.
        
        User's query: ${message}`;

        const result = await model.generateContent(prompt);
        const responseData = await result.response;
        const text = responseData.text();

        res.json({ text });
    } catch (error) {
        console.error('Chatbot error:', error);
        const status = error.status || 500;
        const errorMessage = error.message || 'Failed to get response from AI assistant.';

        res.status(status).json({
            message: errorMessage,
            details: status === 404 ? 'Model not found. This often happens with an invalid or incomplete API Key.' :
                status === 429 ? 'Daily/Minute quota reached. Please wait a moment and try again.' : null
        });
    }
};
