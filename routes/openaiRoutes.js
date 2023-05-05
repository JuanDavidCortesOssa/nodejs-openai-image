const express = require('express');
const { generateImage, generateText } = require('../controllers/openaiController');
const { generateSpeech } = require('../controllers/elevenlabsController');
const router = express.Router();

router.post('/generateimage', generateImage);
router.post('/generatetext', generateText);
router.post('/generatespeech', generateSpeech);

module.exports = router;
