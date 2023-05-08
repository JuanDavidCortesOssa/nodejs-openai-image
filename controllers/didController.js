const axios = require('axios');

const saveAudio = async (req, res)=>{
    const { audio } = req.body;

    console.log(req);
    const headers = {
        'Authorization': `Basic ${process.env.DID_Key}`,
        'Content-Type': req['content-type']
      };
      try {
        const response = await axios.post(
            "https://api.d-id.com/audios",
          audio,
          { headers: headers}
        );

        console.log(res, req);
        res.send(response);

    
        /*const audioResponse = response.data;
    
        res.set('Content-Type', 'application/json');
        res.send(audioResponse);*/
        
      } catch (error) {
        if (error.response) {
          console.log(error.response.status);
        } else {
          console.log(error.message);
        }
        res.status(400).json({
            success: false,
            error: 'Error in the request',
          });
    }
}
module.exports = { saveAudio };