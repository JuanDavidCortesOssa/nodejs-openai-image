const axios = require('axios');
const multer = require('multer');

const upload = multer();

const saveAudio = async (req, res)=>{

  if (!req.file) {
    // No audio file was uploaded
    return res.status(400).json({ error: 'No audio file provided' });
  }
    const { audio } = req.file.audio;

    console.log("audio", req,req.file);
    
}
module.exports = { saveAudio };