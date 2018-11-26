const crdt = require('../libraries/rgasplittree/RSTWrapper');
const replica = require("../libraries/rgasplittree/RSTReplica");
const ops = require("../libraries/opTypes/Ops");
const s3v = require("../libraries/vectorclock/s3vector");
const generate = require('nanoid/generate');
const peerjs = require('peerjs');
const PORT = 2718;
// TODO things to implement
// shared list of all peers
// TODO forward messages
// TODO message type enum
// TODO can't establish connection with yourself

function PeerWrapper(editor) {
    this.editor = editor;
    this.sid = generate('0123456789', 10);
    this.crdt = new crdt.RSTWrapper(new replica.RSTReplica(), this.sid);
    console.log("VECTOR CLOCK IS: " + this.crdt.siteVC.toString());

    this.peer = new peerjs(this.sid, {
        // host: '10.250.0.18',
        host: 'localhost',
        port: PORT,
        path: '/peerjs'
    });

    // mapping from id to dataConnection
    this.directlyConnectedPeers = {};

    this.view = {};
    this.viewSize = 2; // how many of the most recently seen peers to keep after a merge
    this.viewTimeInterval = 1000; // milliseconds


    this.peer.on('open', (id) => {
        console.log("Your ID is " + id);
        this.updateView(this.sid);
        this.startNewscast();
    });
    this.peer.on('connection', (conn) => {
        this.directlyConnectedPeers[conn.peer] = conn;
        this.PrettyPrintDirectPeerList();
        console.log("A new person has initiated a connection with you. Their ID is: " + String(conn.peer));
        this.addConnectionListeners(conn, conn.peer);
        this.broadcastPeerList();
    });
    this.peer.on('close', (conn) => {
        console.log("peer " + this.sid + " closed connection");
    });
    this.peer.on('disconnected', () => {
        console.log('peer now disconnected from broker server');
    });
}

PeerWrapper.prototype = {
    // connect to peer with id
    // id: ten digit integer
    connectSet: function (peerList) {
        console.log("checking peer set")
        for (var i = 0; i < peerList.length; i++) {
            if (!this.indirectlyConnectedPeers.includes(peerList[i])) {
                this.connect(peerList[i]);
            }
        }
    },
    connect: function (id) {
        console.log(this.directlyConnectedPeers)
        if (id in this.directlyConnectedPeers) {
            console.log("CLOSE");
            this.directlyConnectedPeers[id].close()
            delete this.directlyConnectedPeers[id];
        }
        console.log(this.directlyConnectedPeers)
        var conn = this.peer.connect(String(id));
        this.addConnectionListeners(conn, id);
    },
    // TODO should probably fix this...
    PrettyPrintDirectPeerList: function () {
        document.getElementById('directPeerList').innerHTML =
            Object.keys(this.directlyConnectedPeers).reduce((a, c) => a + "\n\t" + c, "Directly Connected Peers:");
    },
    broadcast: function (data) {
        for (apeerID of Object.keys(this.directlyConnectedPeers)) {
            console.log("broadcasting" + JSON.stringify(data))
            // console.log(this.directlyConnectedPeers[apeerID].open);
            // TODO does this need to be stringified
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
    addConnectionListeners: function (conn, id) {
        conn.on('open', () => {
            /* TODO: Why do we need this?
            if (id in this.directlyConnectedPeers) {
                console.log("CLOSE 2");
                this.directlyConnectedPeers[id].close();
                delete this.directlyConnectedPeers[id];
            }
            */
            console.log("connected to " + id);
            this.directlyConnectedPeers[id] = conn;
            this.PrettyPrintDirectPeerList();
            this.updateView(id);
        });
        conn.on('data', (jsonData) => {
            console.log("received data: " + JSON.stringify(jsonData) + " from " + conn.peer);
            document.getElementById('broadcasted').innerHTML = JSON.stringify(jsonData);
            if (jsonData.MessageType === MessageType.PeerListUpdate) {
                this.connectSet(jsonData.messageData);
            } else if (jsonData.MessageType === MessageType.SequenceOp) {
                // console.log("YEEEET * 69");
                // TODO this is where the ordering logic should go 
                // TODO this doesn't really make it work on multiple lines (only one) rn
                // TODO batching...
                // (shouldn't be the way it is rn)
                // use vector clock (this.VectorClock)
                for (anOpSerialized of jsonData.RemoteOps) {
                    var anOp = null;
                    var vPos = new s3v.s3Vector(null, -1, -1);
                    if (anOpSerialized.vPos === null) {
                        vPos = null
                    } else {
                        vPos.offset = anOpSerialized.vPos.offset;
                        vPos.sum = anOpSerialized.vPos.sum;
                        vPos.sid = anOpSerialized.vPos.sid;
                    }
                    var vTomb = new s3v.s3Vector(null, -1, -1);
                    if (anOpSerialized.vTomb === null) {
                        vTomb = null
                    } else {
                        vTomb.offset = anOpSerialized.vTomb.offset;
                        vTomb.sum = anOpSerialized.vTomb.sum;
                        vTomb.sid = anOpSerialized.vTomb.sid;
                    }

                    anOp = new ops.RSTOp(
                        anOpSerialized.opType,
                        anOpSerialized.contents,
                        vPos,
                        vTomb,
                        anOpSerialized.offsetStart,
                        anOpSerialized.offsetEnd,
                        anOpSerialized.pos,
                        anOpSerialized.len
                    );

                    this.crdt.integrateRemote(anOp);
                }
                this.editor.setValue(this.crdt.toString());
                // asdf
                var oldCursorPos = this.editor.getCursor().indexFromPos();
                // TODO
                // var newCursorPos = oldCursorPos;
                // if(anOpSerialized.opType === ops.opEnum.INSERT_OP){
                //     newCursorPos += anOpSerialized.cont

                // }
                this.editor.setCursor(oldCursorPos);
            }
        });
        conn.on('close', () => {
            console.log("closed connection with peer " + conn.peer);
            delete this.directlyConnectedPeers[conn.peer]
            console.log(this.directlyConnectedPeers)
            this.PrettyPrintDirectPeerList();
        });
        conn.on('disconnected', () => {
            console.log("got disconnected");
            delete this.directlyConnectedPeers[conn.peer]
            this.PrettyPrintDirectPeerList();
            this.removeFromView(id);
        });
    },
    broadcastPeerList: function () {
        console.log("broadcasting list")
        this.broadcast({
            messageType: MessageType.PeerListUpdate,
            messageData: Object.keys(this.directlyConnectedPeers)
        });
    },
    updateView: function (id) {
        // if id not in this.views,
        //  adds id to this.view and sets timestamp
        // otherwise updates the timestamp
        this.view[id] = Date.now();
    },
    removeFromView: function (id) {
        delete this.view[id];
    },
    startNewscast: function () {
        // we should never really need to stop this...
        // (we'll only need to stop when our peer dies
        //  i.e. we close our browser.)
        setInterval(() => {
            const peer = this.pickRandomPeer();
            //console.log("newscast : " + peer);
            if (peer) {
                //sendNewsReq(peer);
            }
        }, this.viewTimeInterval);
    },
    pickRandomPeer: function () {
        const keys = Object.keys(this.directlyConnectedPeers);
        const key = keys[Math.floor(Math.random() * keys.length)];
        console.log("newscasting to : " + key);
        return this.directlyConnectedPeers[key];
    }

}

// // set union copied off stack overflow
// function union(setA, setB) {
//     var _union = new Set(setA);
//     for (var elem of setB) {
//         _union.add(elem);
//     }
//     return _union;
// }
/*
function stringifyIfObject(obj){
    if(typeof obj == "object")
        return JSON.stringify(obj);
    else{
        alert("found already stringified object")
        return obj;
    }
}
*/

/*
function random_item(items)
{
return items[Math.floor(Math.random()*items.length)];
}
*/

// operation types
var MessageType = {
    "PeerListUpdate": 0,
    "BroadcastUpdate": 1,
    "SequenceOp": 2
}
Object.freeze(MessageType);

module.exports = {
    PeerWrapper,
    MessageType
};