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
  generateTextRequest(prompt);
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
  } catch (error) {
    console.log(prompt);
    document.querySelector('.msg').textContent = error;
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
