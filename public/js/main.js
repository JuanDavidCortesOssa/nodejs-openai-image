

function onSubmit(e) {
  e.preventDefault();

  document.querySelector('.msg').textContent = '';
  // document.querySelector('#image').src = '';

  const prompt = document.querySelector('#prompt').value;
  // const size = document.querySelector('#size').value;

  if (prompt === '') {
    alert('Please add some text');
    return;
  }

  // generateImageRequest(prompt, size);
  // generateTextRequest(prompt);
  //generateSpeechRequest(prompt);
  answerSpechRequest(prompt);
}

async function answerSpechRequest(prompt){

  const gptAnswer = await generateTextRequest(prompt);
  generateSpeechRequest(gptAnswer);

}

async function generateSpeechRequest(prompt) {
  try {
    showSpinner();

    const response = await fetch('/openai/generatespeech', {
      
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        // "voice_settings": {
        //   "stability": 0.2,
        //   "similarity_boost": 0.68
        // }
      }),
    });

    if (!response.ok) {
      removeSpinner();
      console.log(response);
      throw new Error('That audio could not be generated');
    }

    const audio = await response.arrayBuffer();
    const audioSource = document.getElementById('audio-source');
    audioSource.src = URL.createObjectURL(new Blob([audio], { type: 'audio/mpeg' }));
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.load();

    const formData = new FormData();
    formData.append('audio', URL.createObjectURL(new Blob([audio], { type: 'audio/mpeg' })));



    var result =  await fetch(`/openai/saveAudio`, {
      method: 'POST',
      body : formData
    }).then((response) => response.json()).then(async (data) =>{

      //var audioUrl = data;
  
      //console.log(audioUrl);
      /*if (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') {
        const talkResponse = await fetch(`${DID_API.url}/talks/streams/${streamId}`,
          {
            method: 'POST',
            headers: { Authorization: `Basic ${DID_API.key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              'script': {
                'type': 'audio',
                'audio_url': audioUrl,
              },
              'driver_url': 'bank://lively/',
              'config': {
                'stitch': true,
              },
              'session_id': sessionId
            })
          });
      }*/
    });

    removeSpinner();
  } catch (error) {
    document.querySelector('.msg').textContent = error;
  }
}

async function generateTextRequest(prompt) {
  try {
    showSpinner();

    console.log(prompt);
    const response = await fetch('/openai/generatetext', {
      
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({prompt}),
    });

    

    if (!response.ok) {
      removeSpinner();
      console.log(response);
      throw new Error('That text could not be generated');
    }

    const data = await response.json();
    console.log(data);

    const gptText = data.data;

    document.querySelector('.msg').textContent = gptText;

    removeSpinner();

    return gptText;

  } catch (error) {
    console.log(error);
    //document.querySelector('.msg').textContent = error;
  }
}

async function generateImageRequest(prompt, size) {
  try {
    showSpinner();

    const response = await fetch('/openai/generateimage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        size,
      }),
    });

    if (!response.ok) {
      removeSpinner();
      throw new Error('That image could not be generated');
    }

    const data = await response.json();
    // console.log(data);

    const imageUrl = data.data;

    document.querySelector('#image').src = imageUrl;

    removeSpinner();
  } catch (error) {
    document.querySelector('.msg').textContent = error;
  }
}

function showSpinner() {
  document.querySelector('.spinner').classList.add('show');
}

function removeSpinner() {
  document.querySelector('.spinner').classList.remove('show');
}

document.querySelector('#image-form').addEventListener('submit', onSubmit);
