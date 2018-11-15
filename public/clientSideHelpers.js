const generate = require('nanoid/generate');
const peerjs = require('peerjs');
const PORT = 2718;
// TODO things to implement
// shared list of all peers
// TODO forward messages
// TODO message type enum
// TODO can't establish connection with yourself

function PeerWrapper() {
    this.sid = generate('0123456789', 10)
    this.mePeer = new peerjs(this.sid, {
        //host: '10.250.0.18',
        host: 'localhost',
        port: PORT,
        path: '/peerjs'
    });
    // mapping from id to dataConnection
    this.directlyConnectedPeers = {};
    this.mePeer.on('open', (id) => {
        console.log("sid for mePeer is" + id);
    });
    this.mePeer.on('connection', (conn) => {
        this.directlyConnectedPeers[conn.peer] = conn;
        this.PrettyPrintPeerList();
        console.log("connection established with " + String(conn));
        this.addConnectionListeners(conn);
        // conn.on('data', (jsonData) => {
        //     console.log("received data: " + jsonData + " from " + conn.peer);
        //     document.getElementById('broadcasted').innerHTML = JSON.parse(jsonData);
        // });
        // conn.on('close', () => {
        //     console.log("closed connection with peer " + conn.peer);
        //     delete this.directlyConnectedPeers[conn.peer]
        //     console.log(this.directlyConnectedPeers)
        //     console.log("hi")
        //     this.PrettyPrintPeerList();
        // });
        // conn.on('disconnected', () => {
        //     console.log("got disconnected");
        //     delete this.directlyConnectedPeers[conn.peer]
        //     this.PrettyPrintPeerList();
        // });
    });
    this.mePeer.on('close', () => {
        console.log("mePeer " + this.sid + " closed connection");
    });
    this.mePeer.on('disconnected', () => {
        console.log('mePeer now disconnected from broker server');
    });
}

PeerWrapper.prototype = {
    // connect to peer with id
    // id: ten digit integer
    connect: function (id) {
        console.log(this.directlyConnectedPeers)
        if (id in this.directlyConnectedPeers) {
            this.directlyConnectedPeers[id].close()
            delete this.directlyConnectedPeers[id];
        }
        console.log(this.directlyConnectedPeers)
        var conn = this.mePeer.connect(String(id));
        conn.on('open', () => {
            if (id in this.directlyConnectedPeers) {
                this.directlyConnectedPeers[id].close();
                delete this.directlyConnectedPeers[id];
            }
            console.log("connected to " + id);
            this.directlyConnectedPeers[id] = conn;
            this.PrettyPrintPeerList();
        });
        this.addConnectionListeners(conn);
    },
    PrettyPrintPeerList: function () {
        document.getElementById('directPeerList').innerHTML =
            Object.keys(this.directlyConnectedPeers).reduce((a, c) => a + "\n\t" + c, "Directly Connected Peers:");
    },
    broadcast: function (data) {
        for (apeerID of Object.keys(this.directlyConnectedPeers)) {
            this.directlyConnectedPeers[apeerID].send(JSON.stringify(data));
        }
    },
    relay: function (fromPeer, data) {
        for (apeerId of Object.keys(this.directlyConnectedPeers)) {
            if (apeerId !== fromPeer) {
                this.directlyConnectedPeers[apeerID].send(JSON.stringify(data));
            }
        }
    },
    addConnectionListeners: (conn) => {
        conn.on('data', (jsonData) => {
            console.log("received data: " + jsonData + " from " + conn.peer);
            document.getElementById('broadcasted').innerHTML = JSON.parse(jsonData);
        });
        conn.on('close', () => {
            console.log("closed connection with peer " + conn.peer);
            delete this.directlyConnectedPeers[conn.peer]
            console.log(this.directlyConnectedPeers)
            this.PrettyPrintPeerList();
        });
        conn.on('disconnected', () => {
            console.log("got disconnected");
            delete this.directlyConnectedPeers[conn.peer]
            this.PrettyPrintPeerList();
        });
    }
}

module.exports = {
    PeerWrapper
};

//export default PeerWrapper;