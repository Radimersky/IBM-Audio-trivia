if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express')
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1.js');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1.js');
const { IamAuthenticator } = require('ibm-watson/auth');

const cors = require('cors');
const formData = require("express-form-data");

const app = express();
const port = process.env.PORT || 5000;

// parse data with connect-multiparty.
app.use(formData.parse());
// delete from the request all empty files (size == 0)
app.use(formData.format());
// change the file objects to fs.ReadStream
app.use(formData.stream());
// union the body and the files
app.use(formData.union());

app.enable('trust proxy');

app.use(cors());

app.get('/', (req, res) => res.send('Hello World!'))

/**
 * Pipe the synthesize method
 */
app.get('/api/v1/synthesize', async (req, res, next) => {
  try {
    const { result } = await textToSpeech.synthesize(req.query);
    const transcript = result;
    transcript.on('response', (response) => {
      if (req.query.download) {
        response.headers['content-disposition'] = `attachment; filename=transcript.${getFileExtension(req.query.accept)}`;
      }
    });
    transcript.on('error', next);
    transcript.pipe(res);
  } catch (error) {
    res.send(error);
  }
});

/**
 * Recognize audio
 */
app.post('/api/v1/recognize', (req, res) => {
  try {
    const recognizeParams = {
      audio: req.files.audio, // ReadableStream
      contentType: 'audio/mpeg',
      model: 'en-US_BroadbandModel',
      // See more params at: https://cloud.ibm.com/apidocs/speech-to-text?code=node#recognize-audio
    };
    speechToText.recognize(recognizeParams)
        .then(speechRecognitionResults => {
          res.send(JSON.stringify(speechRecognitionResults, null, 2))
        })
        .catch(err => {
          res.send(err);
        });
  } catch (error) {
    res.send(error);
  }
});

const textToSpeech = new TextToSpeechV1({
  version: '2018-04-05',
  authenticator: new IamAuthenticator({
    apikey: process.env.TEXT_TO_SPEECH_IAM_APIKEY || 'type-key-here',
  }),
  url: process.env.TEXT_TO_SPEECH_URL,
});


const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.SPEECH_TO_TEXT_IAM_APIKEY || 'type-key-here',
  }),
  url: process.env.SPEECH_TO_TEXT_URL,
});



const getFileExtension = (acceptQuery) => {
  const accept = acceptQuery || '';
  switch (accept) {
    case 'audio/ogg;codecs=opus':
    case 'audio/ogg;codecs=vorbis':
      return 'ogg';
    case 'audio/wav':
      return 'wav';
    case 'audio/mpeg':
      return 'mpeg';
    case 'audio/webm':
      return 'webm';
    case 'audio/flac':
      return 'flac';
    default:
      return 'mp3';
  }
};

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

// Example API call: http://localhost:5000/api/v1/synthesize?text=Hello%20cruel%20world&voice=en-US_AllisonV3Voice&accept=audio%2Fmp3
