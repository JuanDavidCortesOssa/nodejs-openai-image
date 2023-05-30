
const RTCPeerConnection = (window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection).bind(window);

const KEY = "a2V2aW5AZ29sLWJhbGwuY29t:7pHGpm1AybkvBcn9pKUip";
const URLG = "https://api.d-id.com"


let peerConnection;
let streamId;
let sessionId;
let sessionClientAnswer;
let idAnimation;

let lewandowskiImage = "s3://d-id-images-prod/google-oauth2|114193409010492803366/img_d5TmRDAKr7Z2Casd3e7JU/pupulox_a_photo_of_robert_lewandowsky_as_a_soccer_player_d563c6ef-8f5e-4a68-95d4-209a045fb4c2_720.png";
let cartoonlewa = "s3://d-id-images-prod/google-oauth2|114193409010492803366/img_2w8swQXD98x3FLdzKf5pe/grid_0_720.png";
let normalTEst = "s3://d-id-images-prod/google-oauth2|114193409010492803366/img_qIoT4_XQw0_J-OaOaqism/Diomedes-Diaz-Maestre-El-Cacique-de-La-Junta-scaled.jpg";

let currentPlayer = "s3://d-id-images-prod/google-oauth2|106512935259841632356/img_5hxRWSYfMo8tzp3MV5pWd/descarga__2_.png";
const talkVideo = document.getElementById('talk-video');
talkVideo.setAttribute('playsinline', '');

function setVideoElement(stream) {
  if (!stream) return;
  talkVideo.srcObject = stream;

  // safari hotfix
  if (talkVideo.paused) {
    talkVideo.play().then(_ => {}).catch(e => {});
  }
}

startConnection().then(()=>{console.log("loaded")}).catch((err) =>{console.log(err);});
async function startConnection() {
  showSpinner();
  if (peerConnection && peerConnection.connectionState === 'connected') {
    return;
  }

  stopAllStreams();
  closePC();

  const sessionResponse = await fetch(`${URLG }/talks/streams`, {
    method: 'POST',
    headers: {'Authorization': `Basic ${KEY}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      source_url: cartoonlewa 
    }),
  });

  
  const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json()
  streamId = newStreamId;
  sessionId = newSessionId;
  
  try {
    sessionClientAnswer = await createPeerConnection(offer, iceServers);
  } catch (e) {
    console.log('error during streaming setup', e);
    stopAllStreams();
    closePC();
    return;
  }

  const sdpResponse = await fetch(`${URLG }/talks/streams/${streamId}/sdp`,
    {
      method: 'POST',
      headers: {Authorization: `Basic ${KEY}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({answer: sessionClientAnswer, session_id: sessionId})
    });

    removeSpinner();
};
function stopAllStreams() {
  if (talkVideo.srcObject) {
    console.log('stopping video streams');
    talkVideo.srcObject.getTracks().forEach(track => track.stop());
    talkVideo.srcObject = null;
  }
}

function onIceGatheringStateChange() {
  //iceGatheringStatusLabel.innerText = peerConnection.iceGatheringState;
  //iceGatheringStatusLabel.className = 'iceGatheringState-' + peerConnection.iceGatheringState;
}
function onIceCandidate(event) {
  console.log('onIceCandidate', event);
  if (event.candidate) {
    const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
    
    fetch(`${URLG}/talks/streams/${streamId}/ice`,
      {
        method: 'POST',
        headers: {Authorization: `Basic ${KEY}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({ candidate, sdpMid, sdpMLineIndex, session_id: sessionId})
      }); 
  }
}
function onIceConnectionStateChange() {
  //iceStatusLabel.innerText = peerConnection.iceConnectionState;
  //iceStatusLabel.className = 'iceConnectionState-' + peerConnection.iceConnectionState;
  if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
    stopAllStreams();
    closePC();
  }
}
function onConnectionStateChange() {
  // not supported in firefox
  //peerStatusLabel.innerText = peerConnection.connectionState;
  //peerStatusLabel.className = 'peerConnectionState-' + peerConnection.connectionState;
}
function onSignalingStateChange() {
  //signalingStatusLabel.innerText = peerConnection.signalingState;
  //signalingStatusLabel.className = 'signalingState-' + peerConnection.signalingState;
}
function onTrack(event) {
  const remoteStream = event.streams[0];
  setVideoElement(remoteStream);
}

async function createPeerConnection(offer, iceServers) {
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection({iceServers});
    peerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
    peerConnection.addEventListener('icecandidate', onIceCandidate, true);
    peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
    peerConnection.addEventListener('connectionstatechange', onConnectionStateChange, true);
    peerConnection.addEventListener('signalingstatechange', onSignalingStateChange, true);
    peerConnection.addEventListener('track', onTrack, true);
  }

  await peerConnection.setRemoteDescription(offer);
  console.log('set remote sdp OK');

  const sessionClientAnswer = await peerConnection.createAnswer();
  console.log('create local sdp OK');

  await peerConnection.setLocalDescription(sessionClientAnswer);
  console.log('set local sdp OK');

  return sessionClientAnswer;
}

function closePC(pc = peerConnection) {
  if (!pc) return;
  console.log('stopping peer connection');
  pc.close();
  pc.removeEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
  pc.removeEventListener('icecandidate', onIceCandidate, true);
  pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
  pc.removeEventListener('connectionstatechange', onConnectionStateChange, true);
  pc.removeEventListener('signalingstatechange', onSignalingStateChange, true);
  pc.removeEventListener('track', onTrack, true);
  console.log('stopped peer connection');
  if (pc === peerConnection) {
    peerConnection = null;
  }
}

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
    formData.append('audio', new Blob([audio], { type: 'audio/mpeg' }), "sound.mp3");

    console.log("here",formData)

    /*var result =  await fetch(`/openai/saveAudios`, {
      method: 'POST',
      body : formData
    }).then((response) => response.json()).then(async (data) =>{

      var audioUrl = data;
  
      console.log(audioUrl);*/

    var result =  await fetch(`${URLG}/audios`, {
      method: 'POST',
      headers:{'Authorization': `Basic ${KEY}`},
      body : formData
    }).then((response) => response.json()).then(async (data) =>{

      var audioUrl = data.url;
       
      console.log(audioUrl);
      if (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') {

        console.log("inside if");
        const talkResponse = await fetch(`${URLG}/talks/streams/${streamId}`,
          {
            method: 'POST',
            headers: { Authorization: `Basic ${KEY}`, 'Content-Type': 'application/json' },
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
          }).then((response) => response.json()).then(async (data) =>{ 
            console.log("HEEEEREE",data);
            talkVideo.play();});
      }      
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
