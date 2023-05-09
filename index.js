const path = require('path');
const express = require('express');
const multer = require('multer');
const axios = require('axios');
var FormData = require('form-data');
const dotenv = require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
const upload = multer();



// Enable body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/openai', require('./routes/openaiRoutes'));

app.post('/openai/saveAudios', upload.single('audio'),async  (req, res) => {
    if (!req.file) {
      // No audio file was uploaded
      return res.status(400).json({ error: 'No audio file provided' });
    }
  
    // The audio file is available as req.file
    const audioData = req.file.audio;
    var form = new FormData();
    form.append('audio', req.file.buffer,"sound.mp3");
    console.log(req["content-type"]);

    const headers = {
        'Authorization': `Basic ${process.env.DID_Key}`,
        'Content-Type' : "application/json",
        'Accept': 'audio/mpeg'
      };
      try {
        const response = await axios.post(
            "https://api.d-id.com/audios",
            { audio : form},
          { headers: headers}
        );
    console.log(response);
        
        res.send(response);

    
        /*const audioResponse = response.data;
    
        res.set('Content-Type', 'application/json');
        res.send(audioResponse);*/
        
      } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
        } else {
          console.log(error.message);
        }
        res.status(400).json({
            success: false,
            error: error,
          });
    }
  
    // Process or handle the audio file as needed
  
    //res.status(200).json({ success: true });
  });
  
  

app.listen(port, () => console.log(`Server started on port ${port}`));
