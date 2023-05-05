const axios = require('axios');

const generateSpeech = async (req, res) => {
  const { text, voice_settings } = req.body;

  const headers = {
    'accept': 'audio/mpeg',
    'xi-api-key': process.env.ELEVENLABS_API_KEY,
    'Content-Type': 'application/json'
  };

  const data = {
    text: text,
    voice_settings: voice_settings
  };

  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/BN9WDSJSTUZ3X1Y38EY8',
      data,
      { headers: headers, responseType: 'arraybuffer' }
    );

    const audioResponse = response.data;

    res.set('Content-Type', 'audio/mpeg');
    res.send(audioResponse);
    
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    res.status(400).json({
      success: false,
      error: 'The speech could not be generated',
    });
  }
}

module.exports = { generateSpeech };