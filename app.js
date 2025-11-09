const recordButton = document.getElementById('recordButton');
const cancelButton = document.getElementById('cancelButton');
const statusText = document.getElementById('status');
const recognizedTextEl = document.getElementById('recognizedText');
const translatedTextEl = document.getElementById('translatedText');
const apiKeyInput = document.getElementById('apiKey');
const rememberCheckbox = document.getElementById('rememberKey');
const toggleKeyButton = document.getElementById('toggleKey');
const languageASelect = document.getElementById('languageA');
const languageBSelect = document.getElementById('languageB');
const languageTemplate = document.getElementById('languageOptions');

let mediaRecorder;
let mediaStream;
let recordingTimeout;
let audioChunks = [];
let isRecording = false;
let cancelled = false;

function populateLanguageOptions() {
  languageASelect.innerHTML = '';
  languageBSelect.innerHTML = '';
  const options = Array.from(languageTemplate.content.querySelectorAll('option'));
  for (const option of options) {
    languageASelect.append(option.cloneNode(true));
    languageBSelect.append(option.cloneNode(true));
  }
  languageASelect.value = 'English';
  languageBSelect.value = 'Spanish';
}

function loadStoredApiKey() {
  const stored = localStorage.getItem('gpt-translator-api-key');
  if (stored) {
    apiKeyInput.value = stored;
    rememberCheckbox.checked = true;
  }
}

function saveApiKeyPreference() {
  if (rememberCheckbox.checked) {
    localStorage.setItem('gpt-translator-api-key', apiKeyInput.value.trim());
  } else {
    localStorage.removeItem('gpt-translator-api-key');
  }
}

function setStatus(message) {
  statusText.textContent = message;
}

function resetOutputs() {
  recognizedTextEl.textContent = '—';
  translatedTextEl.textContent = '—';
}

async function startRecording() {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    alert('Please enter your OpenAI API key.');
    apiKeyInput.focus();
    return;
  }

  if (languageASelect.value === languageBSelect.value) {
    alert('Language A and Language B must be different.');
    return;
  }

  if (typeof MediaRecorder === 'undefined') {
    alert('MediaRecorder is not supported in this browser. Please try a modern browser such as Chrome or Edge.');
    return;
  }

  resetOutputs();
  saveApiKeyPreference();

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Microphone access is not supported in this browser.');
      return;
    }
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    console.error(error);
    alert('Microphone access is required to record audio.');
    return;
  }

  audioChunks = [];
  cancelled = false;
  mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });

  mediaRecorder.addEventListener('dataavailable', (event) => {
    if (event.data && event.data.size > 0) {
      audioChunks.push(event.data);
    }
  });

  mediaRecorder.addEventListener('stop', async () => {
    clearTimeout(recordingTimeout);
    stopStream();
    isRecording = false;
    recordButton.textContent = 'Start Listening';

    if (cancelled) {
      setStatus('Recording cancelled');
      return;
    }

    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    if (audioBlob.size === 0) {
      setStatus('No audio captured. Try again.');
      return;
    }

    try {
      setStatus('Transcribing speech…');
      const transcript = await transcribeAudio(audioBlob, apiKey);
      recognizedTextEl.textContent = transcript || '—';
      if (!transcript) {
        setStatus('Could not understand audio.');
        return;
      }
      setStatus('Translating…');
      const translation = await translateText(transcript, apiKey);
      translatedTextEl.textContent = translation || '—';
      if (translation) {
        setStatus('Translation complete');
      } else {
        setStatus('Translation failed.');
      }
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Something went wrong');
      translatedTextEl.textContent = '—';
    }
  });

  mediaRecorder.start();
  isRecording = true;
  recordButton.textContent = 'Stop';
  setStatus('Listening… tap stop when finished');

  recordingTimeout = setTimeout(() => {
    if (isRecording) {
      stopRecording();
    }
  }, 15000);
}

function stopStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
  }
}

function cancelRecording() {
  if (isRecording) {
    cancelled = true;
    stopRecording();
  }
}

async function transcribeAudio(audioBlob, apiKey) {
  const formData = new FormData();
  if (typeof File === 'function') {
    const file = new File([audioBlob], 'speech.webm', { type: audioBlob.type || 'audio/webm' });
    formData.append('file', file);
  } else {
    formData.append('file', audioBlob, 'speech.webm');
  }
  formData.append('model', 'gpt-4o-mini-transcribe');
  formData.append('response_format', 'verbose_json');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Unable to transcribe audio');
  }

  return data.text || data.transcript || '';
}

async function translateText(text, apiKey) {
  const languageA = languageASelect.value;
  const languageB = languageBSelect.value;

  const systemPrompt = `You are a translation engine mediating between two languages. ` +
    `Language A: ${languageA}. Language B: ${languageB}. ` +
    `When the user provides an utterance, first detect which language it is written in. ` +
    `If the text is in Language A, translate it into Language B. ` +
    `If the text is in Language B, translate it into Language A. ` +
    `If the text is in any other language, translate it into Language B. ` +
    `Always output only the translation, with no commentary, no quotes, and no notes.`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: [
            { type: 'text', text: systemPrompt },
          ],
        },
        {
          role: 'user',
          content: [
            { type: 'text', text },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Translation failed');
  }

  if (typeof data.output_text === 'string') {
    return data.output_text.trim();
  }

  const firstText = data.output?.find?.((item) => item.type === 'output_text');
  if (firstText?.text) {
    return firstText.text.trim();
  }

  const choiceText = data.choices?.[0]?.message?.content;
  if (typeof choiceText === 'string') {
    return choiceText.trim();
  }

  return '';
}

function toggleKeyVisibility() {
  const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
  apiKeyInput.setAttribute('type', type);
}

recordButton.addEventListener('click', () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

cancelButton.addEventListener('click', cancelRecording);
rememberCheckbox.addEventListener('change', saveApiKeyPreference);
toggleKeyButton.addEventListener('click', toggleKeyVisibility);

populateLanguageOptions();
loadStoredApiKey();
