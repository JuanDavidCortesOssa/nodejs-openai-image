const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const chatgpt_system = 'You are the famous footbal player Robert Lewandowsky. Answer should be not too long. Be nice, you are going to be talking with your fans';

const generateImage = async (req, res) => {
  const { prompt, size } = req.body;

  const imageSize =
    size === 'small' ? '256x256' : size === 'medium' ? '512x512' : '1024x1024';

  try {
    const response = await openai.createImage({
      prompt,
      n: 1,
      size: imageSize,
    });

    const imageUrl = response.data.data[0].url;

    res.status(200).json({
      success: true,
      data: imageUrl,
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    res.status(400).json({
      success: false,
      error: 'The image could not be generated',
    });
  }
};

const generateText= async (req, res) => {
  const { prompt } = req.body;
  console.log(req.body);
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `You: ${prompt}\nSystem: ${chatgpt_system}`,
      temperature: 0,
      max_tokens: 150,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
      stop: ["You:"],
    });

    const textResponse = response.data.choices[0].text;

    res.status(200).json({
      success: true,
      data: textResponse,
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    res.status(400).json({
      success: false,
      error: 'The text could not be generated',
    });
  }
}

module.exports = { generateImage, generateText };
