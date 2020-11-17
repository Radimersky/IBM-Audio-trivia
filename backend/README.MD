# IBM Watson text-to-speech API proxy server

Just and express app that authenticates and forwards requests to IBM TTS API

## How to run

* `npm install`
* `npm start`
* server listens on [http://localhost:5000](http://localhost:5000)

Example call: `http://localhost:5000/api/v1/synthesize?text=Hello%20cruel%20world&voice=en-US_AllisonV3Voice&accept=audio/mp3`