var _this = this;

const generate = require('nanoid/generate');
const peerjs = require('peerjs');
const PORT = 2718;
// TODO things to implement
// shared list of all peers
// TODO forward messages
// TODO message type enum
// TODO can't establish connection with yourself

function PeerWrapper() {
    this.sid = generate('0123456789', 10);
    this.peerId = new peerjs(this.sid, {
        // host: '10.250.0.18',
        host: 'localhost',
        port: PORT,
        path: '/peerjs'
    });
    // mapping from id to dataConnection
    this.directlyConnectedPeers = {};
    this.peerId.on('open', id => {
        console.log("Your ID is " + id);
    });
    this.peerId.on('connection', conn => {
        this.directlyConnectedPeers[conn.peer] = conn;
        this.PrettyPrintDirectPeerList();
        console.log("A new person has initiated a connection with you. Their ID is: " + String(conn.peer));
        this.addConnectionListeners(conn);
        this.broadcastPeerList();
    });
    this.peerId.on('close', () => {
        console.log("peerId " + this.sid + " closed connection");
    });
    this.peerId.on('disconnected', () => {
        console.log('peerId now disconnected from broker server');
    });
}

PeerWrapper.prototype = {
    // connect to peer with id
    // id: ten digit integer
    connectSet: function (peerList) {
        console.log("checking peer set");
        for (var i = 0; i < peerList.length; i++) {
            if (!this.indirectlyConnectedPeers.includes(peerList[i])) {
                this.connect(peerList[i]);
            }
        }
    },
    connect: function (id) {
        console.log(this.directlyConnectedPeers);
        if (id in this.directlyConnectedPeers) {
            this.directlyConnectedPeers[id].close();
            delete this.directlyConnectedPeers[id];
        }
        console.log(this.directlyConnectedPeers);
        var conn = this.peerId.connect(String(id));
        conn.on('open', () => {
            if (id in this.directlyConnectedPeers) {
                this.directlyConnectedPeers[id].close();
                delete this.directlyConnectedPeers[id];
            }
            console.log("connected to " + id);
            this.directlyConnectedPeers[id] = conn;
            this.PrettyPrintDirectPeerList();
        });
        this.addConnectionListeners(conn);
    },
    PrettyPrintDirectPeerList: function () {
        document.getElementById('directPeerList').innerHTML = Object.keys(this.directlyConnectedPeers).reduce((a, c) => a + "\n\t" + c, "Directly Connected Peers:");
    },
    broadcast: function (data) {
        for (apeerID of Object.keys(this.directlyConnectedPeers)) {
            console.log("broadcasting" + JSON.stringify(data));
            //data = stringifyIfObject(data)
            console.log(this.directlyConnectedPeers[apeerID].open);
            //while (!this.directlyConnectedPeers[apeerID].open) { /*wait*/ }
            this.directlyConnectedPeers[apeerID].send(data);
        }
    },
    relay: function (fromPeer, data) {
        for (apeerId of Object.keys(this.directlyConnectedPeers)) {
            if (apeerId !== fromPeer) {
                this.directlyConnectedPeers[apeerID].send(JSON.stringify(data));
            }
        }
    },
    addConnectionListeners: conn => {
        conn.on('data', jsonData => {
            console.log("received data: " + JSON.stringify(jsonData) + " from " + conn.peer);
            document.getElementById('broadcasted').innerHTML = JSON.stringify(jsonData);
            if (jsonData.MessageType === MessageType.PeerListUpdate) {
                _this.connectSet(jsonData.messageData);
            }
        });
        conn.on('close', () => {
            console.log("closed connection with peer " + conn.peer);
            delete _this.directlyConnectedPeers[conn.peer];
            console.log(_this.directlyConnectedPeers);
            _this.PrettyPrintDirectPeerList();
        });
        conn.on('disconnected', () => {
            console.log("got disconnected");
            delete _this.directlyConnectedPeers[conn.peer];
            _this.PrettyPrintDirectPeerList();
        });
    },
    broadcastPeerList: function () {
        console.log("broadcasting list");
        this.broadcast({
            messageType: MessageType.PeerListUpdate,
            messageData: Object.keys(this.directlyConnectedPeers)
        });
    }

    // // set union copied off stack overflow
    // function union(setA, setB) {
    //     var _union = new Set(setA);
    //     for (var elem of setB) {
    //         _union.add(elem);
    //     }
    //     return _union;
    // }
};function stringifyIfObject(obj) {
    if (typeof obj == "object") return JSON.stringify(obj);else {
        alert("found already stringified object");
        return obj;
    }
}

function random_item(items) {
    return items[Math.floor(Math.random() * items.length)];
}

// operation types
var MessageType = {
    "PeerListUpdate": 0,
    "BroadcastUpdate": 1
};
Object.freeze(MessageType);

module.exports = {
    PeerWrapper,
    MessageType
};