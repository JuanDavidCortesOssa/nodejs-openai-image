const express = require('express');

const { generateImage, generateText } = require('../controllers/openaiController');
const { generateSpeech } = require('../controllers/elevenlabsController');
const { saveAudio } = require('../controllers/didController');
const router = express.Router();

router.post('/generateimage', generateImage);
router.post('/generatetext', generateText);
router.post('/generatespeech', generateSpeech);
router.post('/saveAudio',saveAudio);

module.exports = router;
