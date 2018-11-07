const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const path = require('path');

const peer = require('peer');

app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/codemirror', express.static(path.join(__dirname, 'public/codemirror')));

app.get('/', function (req, res) {
  // TODO: render something?
  res.sendFile('index.html', {root: path.join(__dirname, '/public')})
});

var srv = app.listen(port, function() {
    console.log('Listening on ' + port)
})

app.use('/peerjs', peer.ExpressPeerServer(srv, {
    debug: true
}))

