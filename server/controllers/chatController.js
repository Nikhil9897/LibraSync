const { CohereClientV2 } = require('cohere-ai');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// Initialize Cohere SDK
const cohere = new CohereClientV2({
    token: process.env.COHERE_API_KEY,
});

// @desc    Process a chat message with Cohere
// @route   POST /api/v1/chat
// @access  Public (or Private depending on needs)
exports.chatWithBot = asyncHandler(async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        throw new ApiError(400, 'Please provide a message');
    }

    try {
        const systemInstruction = `You are Libra, the friendly and helpful AI library assistant for LibraSync. You help users find books, understand library policies, and navigate the platform. Keep your answers concise, polite, and directly related to library services or reading recommendations.`;
        
        // Format history for Cohere
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));

        const messages = [
            { role: 'system', content: systemInstruction },
            ...formattedHistory,
            { role: 'user', content: message }
        ];

        const response = await cohere.chat({
            model: "command-r-plus-08-2024",
            messages: messages,
            temperature: 0.7,
        });

        const responseText = response.message.content[0].text;

        res.json(new ApiResponse(200, 'Chat response generated', {
            reply: responseText
        }));

    } catch (error) {
        console.error('Cohere API Error:', error);
        throw new ApiError(500, 'Failed to process chat with the AI assistant');
    }
});
