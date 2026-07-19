const { CohereClientV2 } = require('cohere-ai');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// Helper to get Cohere client with current environment token
const getCohereClient = () => {
    return new CohereClientV2({
        token: process.env.COHERE_API_KEY,
    });
};

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

        const cohere = getCohereClient();
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
        
        // Graceful fallback to offline chatbot if API key is invalid/unconfigured
        if (error.statusCode === 401 || error.message?.includes('API key')) {
            const lowerMessage = message.toLowerCase();
            let fallbackReply = "I am currently operating in offline demo mode. I can help you find books, check our policies, or guide you through the dashboard! What would you like to know?";
            
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
                fallbackReply = "Hello! I am Libra, your AI library assistant (Offline Demo Mode). How can I help you today?";
            } else if (lowerMessage.includes('book') || lowerMessage.includes('read') || lowerMessage.includes('recommend')) {
                fallbackReply = "I recommend checking out classics like '1984' or 'To Kill a Mockingbird' in our Catalog! You can search and filter books from the navbar.";
            } else if (lowerMessage.includes('policy') || lowerMessage.includes('borrow') || lowerMessage.includes('fine')) {
                fallbackReply = "Our policy allows borrowing up to 5 books for 14 days. Late returns incur a fine of $0.50 per day.";
            }
            
            return res.json(new ApiResponse(200, 'Chat response generated (Demo Fallback)', {
                reply: fallbackReply
            }));
        }
        
        throw new ApiError(500, 'Failed to process chat with the AI assistant');
    }
});
