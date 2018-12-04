const crdt = require('../libraries/rgasplittree/RSTWrapper');
const replica = require("../libraries/rgasplittree/RSTReplica");
const ops = require("../libraries/opTypes/Ops");
const s3v = require("../libraries/vectorclock/s3vector");
const generate = require('nanoid/generate');
const peerjs = require('peerjs');
const PORT = 2718;
const vectorclock = require("../libraries/vectorclock/vectorClock");
// TODO things to implement
// shared list of all peers
// TODO forward messages
// TODO message type enum
// TODO can't establish connection with yourself

const colorList = ["#FF8C9A", "#BF9BD8", "#53CCE0", "#FFE663", "#A2D264", "#22AB9A",
    "#637CEA", "#A2BEED", "#FF82CC", "#4F5882", "#5BBDAE", "#FF0000",
    "#41E58B", "#FFB743", "#6E58FF", "#71899C", "#FF7E43", "#514F5E"
];

function PeerWrapper(editor) {
    this.editor = editor;
    this.sid = generate('0123456789', 10);
    this.crdt = new crdt.RSTWrapper(new replica.RSTReplica(), this.sid);
    console.log("VECTOR CLOCK IS: " + this.crdt.siteVC.toString());

    this.Q = [];

    this.peer = new peerjs(this.sid, {
        //host: '10.250.0.18',
        host: 'localhost',
        port: PORT,
        path: '/peerjs'
    });

    // mapping from id to dataConnection
    this.directlyConnectedPeers = {};

    // coloring
    this.color = "#293462";
    this.peerColors = {};
    document.getElementById('user-dot').style.backgroundColor = this.color;

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
        this.peerColors[conn.peer] = colorList[Math.floor(Math.random() * colorList.length)];
        this.IconPrintDirectPeerList();
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
            delete this.peerColors[id];
        }
        console.log(this.directlyConnectedPeers);
        var conn = this.peer.connect(String(id));
        this.addConnectionListeners(conn, id);
    },
    IconPrintDirectPeerList: function () {
        document.getElementById('icon-peer-list').innerHTML = "";
        var allKeys = Object.keys(this.directlyConnectedPeers);
        for (i = 0; i < allKeys.length; i++) {
            document.getElementById('icon-peer-list').innerHTML += '<button class="btn-peer" style="border-left: 1.5em solid ' + colorList[Math.floor(Math.random() * colorList.length)] + '">' + allKeys[i] + '</button>';
        }
    },
    broadcast: function (data) {
        for (apeerID of Object.keys(this.directlyConnectedPeers)) {
            console.log("broadcasting" + JSON.stringify(data))
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
            this.IconPrintDirectPeerList();
            this.updateView(id);
        });
        conn.on('data', (jsonData) => {
            console.log("received data: " + JSON.stringify(jsonData) + " from " + conn.peer);
            document.getElementById('broadcasted').innerHTML = JSON.stringify(jsonData);
            if (jsonData.MessageType === MessageType.PeerListUpdate) {
                this.connectSet(jsonData.messageData);
            } else if (jsonData.MessageType === MessageType.SequenceOp) {
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
                        // console.log("Y E E T");
                        vPos.offset = anOpSerialized.vPos.offset;
                        vPos.sum = anOpSerialized.vPos.sum;
                        vPos.sid = anOpSerialized.vPos.sid;
                    }
                    var vTomb = new s3v.s3Vector(null, -1, -1);
                    if (anOpSerialized.vTomb === null) {
                        vTomb = null;
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

                    var arrVc = new vectorclock.VectorClock([0]);
                    arrVc.mapping = jsonData.VectorClock.mapping;
                    this.Q.unshift([anOp, arrVc]);
                    var newQ = [];
                    console.log(this.Q);

                    for (var q in this.Q) {
                        console.log("External " + this.Q[q][1]);
                        console.log("causaul" + vectorclock.isCausual(this.Q[q][1], this.crdt.siteVC));

                        if (vectorclock.isCausual(this.Q[q][1], this.crdt.siteVC)) {
                            console.log("executing opp")
                            nextOp = this.Q[q][0];
                            this.crdt.integrateRemote(nextOp, jsonData.messagePeerID);
                            this.crdt.siteVC.processVector(this.Q[q][1]);
                            //var cur = this;
                            //this.editor.setValue(this.crdt.toString());
                            //this.editor.setCursor(cur);
                        } else {
                            newQ.push(this.Q[q]);
                        }
                    }
                    this.Q = newQ;
                    // var cur = this.editor.getCursor().indexFromPos();
                    // this.crdt.replica.insertCursor()
                    this.editor.setValue(this.crdt.toString());
                    if (this.crdt.replica.head !== null) {
                        if (this.crdt.replica.cursor.node === null) {
                            this.crdt.replica.cursor.node = this.crdt.replica.head;
                        }
                        this.editor.setCursor(this.editor.posFromIndex(this.crdt.replica.getOffset(this.crdt.replica.cursor.node)));
                    }
                }
            }
        });
        conn.on('close', () => {
            console.log("closed connection with peer " + conn.peer);
            delete this.directlyConnectedPeers[conn.peer];
            delete this.peerColors[conn.peer];
            console.log(this.directlyConnectedPeers);
            this.IconPrintDirectPeerList();
        });
        conn.on('disconnected', () => {
            console.log("got disconnected");
            delete this.directlyConnectedPeers[conn.peer];
            delete this.peerColors[conn.peer];
            this.IconPrintDirectPeerList();
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
