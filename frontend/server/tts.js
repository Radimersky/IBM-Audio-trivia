const fs = require('fs');

var request = require('request').defaults({ encoding: null });
var options = {
    'method': 'POST',
    'url': 'https://api.eu-gb.text-to-speech.watson.cloud.ibm.com/instances/48095276-0ee2-4da8-b8be-35ae84a4371c/v1/synthesize',
    'headers': {
        'Content-Type': ['application/json', 'text/plain'],
        'Accept': 'audio/wav',
        'Authorization': 'Basic YXBpa2V5Okt6MDRtWHhILVhQQ3h1YzFZU3dKejA2Z2VubG51MW96WEZuZ0FKcUFOYnVP'
    },
    body: "{\"text\":\"Hello cruel world\"}"

};
request(options, function (error, response) {
    if (error) throw new Error(error);
    // fs.writeFileSync('./response.json', JSON.stringify(response));
    fs.writeFileSync('./hello_world.wav', response.body, 'binary');
});
