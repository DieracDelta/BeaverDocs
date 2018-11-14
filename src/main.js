const generate = require('nanoid/generate');
const peerjs = require('peer');

const sid = generate('0123456789', 10)

var newPeer = new Peer(sid, {
    host: '10.250.0.18',
    port: 9000,
    // path: '/myapp'
});