const express = require('express');
const { chatWithBot } = require('../controllers/chatController');

const router = express.Router();

// Allow public access to chatbot, or can be protected if we import protect from auth middleware
router.post('/', chatWithBot);

module.exports = router;
