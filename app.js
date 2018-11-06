const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const peer = require('peer');

let listener;

app.get('/', function (req, res) {
  // TODO: render something?
  res.sendFile('views/index.js')
});

var srv = app.listen(port, function() {
    console.log('Listening on '+port)
})

app.use('/peerjs', peer.ExpressPeerServer(srv, {
    debug: true
}))

