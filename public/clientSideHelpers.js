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
    this.peerCursors = {};

    // peers viewed
    // {
    //  peerId: timestamp,
    //  ...
    // }
    this.view = {};
    this.viewSize = 5; // how many of the most recently seen peers to keep after a merge
    this.viewTimeInterval = 1000; // milliseconds
    this.lastReconnectAttempt = 0; // which index of the sorted view you last attempted to connect to 
    this.reconnectInterval = null;


    this.peer.on('open', (id) => {
        console.log("Your ID is " + id);
        this.updateView(this.sid);
        this.startNewscast();
    });
    this.peer.on('connection', (conn) => {
        this.directlyConnectedPeers[conn.peer] = conn;
        var newColor = colorList[Math.floor(Math.random() * colorList.length)];
        this.peerColors[conn.peer] = newColor;
        console.log(conn.peer);
        console.log(typeof conn.peer);
        if (conn.peer in this.peerCursors) {
          this.peerCursors[conn.peer].clear();
        }
        this.peerCursors[conn.peer] = window.editor.setBookmark({
            line: 0,
            ch: 0
        }, {
            widget: this.createCursorElement(conn.peer)
        });
        console.log("A new person has initiated a connection with you. Their ID is: " + String(conn.peer));
        this.IconPrintDirectPeerList();
        this.addConnectionListeners(conn, conn.peer);
        this.broadcastPeerList();
        // should not destroy reconnectInterval here. Want to continue searching through view
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
    connect: function(id) {
        // don't connect to yourself...
        if (id == this.sid) return;

        console.log(this.directlyConnectedPeers)
        if (id in this.directlyConnectedPeers) {
            console.log("CLOSE");
            this.directlyConnectedPeers[id].close();
            this.peerCursors[id].clear();
            delete this.directlyConnectedPeers[id];
            delete this.peerColors[id];
            delete this.peerCursors[id];
        }
        console.log(this.directlyConnectedPeers);
        var conn = this.peer.connect(String(id));
        if (Object.keys(this.peerCursors).includes(conn.peer)) {
            this.peerCursors[conn.peer].clear();
        }
        // wait a bit to see if the connection opens
        // TODO: need to find a way to stall here for a bit and give
        // conn a chance to open
        // (setTimeout has issues, and sleep doesn't browserify)
        // if (!conn.open) return;
        var newColor = colorList[Math.floor(Math.random() * colorList.length)];
        this.peerColors[conn.peer] = newColor;
        this.peerCursors[conn.peer] = window.editor.setBookmark({
            line: 0,
            ch: 0
        }, {
            widget: this.createCursorElement(conn.peer)
        });
        this.IconPrintDirectPeerList();
        this.addConnectionListeners(conn, id);
        if (this.resetInterval != null) {
            clearInterval(this.resetInterval);
            this.resetInterval = null;
        }
    },
    createCursorElement: function (id) {
        console.log("adding cursor element");
        var cursorElement = document.createElement("span");
        cursorElement.style.borderLeftStyle = 'solid';
        cursorElement.style.borderLeftWidth = '2px';
        cursorElement.style.borderLeftColor = this.peerColors[id];
        cursorElement.style.padding = 0;
        cursorElement.style.zIndex = 0;
        return cursorElement;
    },
    IconPrintDirectPeerList: function () {
        document.getElementById('icon-peer-list').innerHTML = "";
        var allKeys = Object.keys(this.directlyConnectedPeers);
        for (i = 0; i < allKeys.length; i++) {
            document.getElementById('icon-peer-list').innerHTML += '<button class="btn-peer" style="border-left: 1.5em solid ' + this.peerColors[allKeys[i]] + '">' + allKeys[i] + '</button>';
        }
    },
    broadcast: function(data) {
        for (apeerID of Object.keys(this.directlyConnectedPeers)) {
            console.log("broadcasting" + JSON.stringify(data))
            this.directlyConnectedPeers[apeerID].send(data);
        }
    },
    relay: function(fromPeer, data) {
        for (apeerId of Object.keys(this.directlyConnectedPeers)) {
            if (apeerId !== fromPeer) {
                this.directlyConnectedPeers[apeerID].send(JSON.stringify(data));
            }
        }
    },
    addConnectionListeners: function(conn, id) {
        conn.on('open', () => {
            console.log("connected to " + id);
            this.directlyConnectedPeers[id] = conn;
            this.IconPrintDirectPeerList();
            this.updateView(id);
        });
        conn.on('data', (jsonData) => {
            this.updateView(conn.peer);
            console.log("received data: " + JSON.stringify(jsonData) + " from " + conn.peer);
            if (jsonData.messageType === MessageType.PeerListUpdate) {
                this.connectSet(jsonData.messageData);
            } else if (jsonData.messageType === MessageType.NewscastReq) {
                // send view back and merge views
                this.sendNewsResp(conn.peer);
                this.mergeViews(jsonData.messageData);
            } else if (jsonData.messageType === MessageType.NewscastResp) {
                this.mergeViews(jsonData.messageData);
            } else if (jsonData.messageType == MessageType.CursorPositionUpdate) {
                if (Object.keys(this.peerCursors).includes(conn.peer)) {
                    this.peerCursors[conn.peer].clear();
                    console.log("removed cursor");
                }
                this.peerCursors[conn.peer] = window.editor.setBookmark(jsonData.messageData, {widget: this.createCursorElement(conn.peer)});
                console.log(typeof jsonData);
                console.log(typeof jsonData.messageData)
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
                            var crdtPos = -1;
                            if (this.crdt.replica.cursor.node !== null) {
                                var crdtPos = this.crdt.replica.getOffset(this.crdt.replica.cursor.node.key) + this.crdt.replica.cursor.offset;
                            }
                            console.log("CRDT POS PRIOR TO INSERT: " + crdtPos);
                            this.crdt.integrateRemote(nextOp, jsonData.messagePeerID);
                            this.crdt.siteVC.processVector(this.Q[q][1]);
                        } else {
                            newQ.push(this.Q[q]);
                        }
                    }
                    this.Q = newQ;
                    this.editor.setValue(this.crdt.toString());
                    if (this.crdt.replica.head !== null) {
                        if (this.crdt.replica.cursor.node === null) {
                            this.crdt.replica.cursor.node = this.crdt.replica.head;
                        }
                        var crdtPos = this.crdt.replica.getOffset(this.crdt.replica.cursor.node.key) + this.crdt.replica.cursor.offset;
                        console.log("CRDT POS:" + crdtPos);
                        this.editor.setCursor(this.editor.posFromIndex(crdtPos));
                    }
                }
            }
        });
        conn.on('close', () => {
            console.log("closed connection with peer " + conn.peer);
            this.peerCursors[conn.peer].clear();
            delete this.directlyConnectedPeers[conn.peer];
            delete this.peerColors[conn.peer];
            delete this.peerCursors[conn.peer];
            console.log(this.directlyConnectedPeers);
            this.IconPrintDirectPeerList();
            this.reconnectIfNecessary();
        });
        conn.on('disconnected', () => {
            console.log("got disconnected");
            this.peerCursors[conn.peer].clear();
            delete this.directlyConnectedPeers[conn.peer];
            delete this.peerColors[conn.peer];
            delete this.peerCursors[conn.peer];
            this.IconPrintDirectPeerList();
            this.removeFromView(id);
            this.reconnectIfNecessary();
        });
    },
    broadcastCursorPosition: function () {
        console.log("broadcasting cursor position: ");
        console.log(window.editor.getDoc().getCursor());
        this.broadcast({
            messageType: MessageType.CursorPositionUpdate,
            messageData: {
                line: window.editor.getDoc().getCursor().line,
                ch: window.editor.getDoc().getCursor().ch
            }
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
        // adds id to this.view and sets timestamp
        // otherwise updates the timestamp
        this.view[id] = Date.now();
    },
    mergeViews: function (otherView) {
        var mostRecent = Object.assign({}, this.view);
        // merge this.view and otherView
        for (var id of Object.keys(otherView)) {
            if (Object.keys(mostRecent).includes(id)) {
                if (otherView[id] > mostRecent[id]) {
                      mostRecent[id] = otherView[id];
                }
            } else {
                mostRecent[id] = otherView[id];
            }
        }
        // filter down to viewSize
        while (Object.keys(mostRecent).length > this.viewSize) {
            // find earliest timestamp in mostRecent
            var earliestTimestamp = Number.MAX_VALUE;
            var earliestId = 0;
            for (var id2 of Object.keys(mostRecent)) {
              if (mostRecent[id2] < earliestTimestamp) {
                  earliestId = id2;
                  earliestTImestamp = mostRecent[id2];
              }
            }
            delete mostRecent[earliestId];
            // check if otherView[id] is later
        }
        this.view = mostRecent;
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
            if (peer) {
                this.sendNewsReq(peer);
            }
        }, this.viewTimeInterval);
    },
    pickRandomPeer: function () {
        const keys = Object.keys(this.directlyConnectedPeers);
        const key = keys[Math.floor(Math.random() * keys.length)];
        console.log("newscasting to : " + key);
        return this.directlyConnectedPeers[key];
    },
    sendNewsReq: function (peer) {
        var cloneView = Object.assign({}, this.view);
        // add yourself to the view you send
        cloneView[this.sid] = Date.now();
        this.broadcast({
            messageType: MessageType.NewscastReq,
            messageData: cloneView
        });
    },
    sendNewsResp: function (peer) {
        var cloneView = Object.assign({}, this.view);
        cloneView[this.sid] = Date.now();
        this.broadcast({
            messageType: MessageType.NewscastResp,
            messageData: cloneView
        });
    },
    reconnectIfNecessary: function () {
        console.log("RECONNECTING");
        console.log(Object.keys(this.directlyConnectedPeers).length);
        if (Object.keys(this.directlyConnectedPeers).length == 0) {
            // go through view and try connecting to everyone in order.
            // (going through people in order is a simple attempt at avoiding
            //  partitions)
            var keys = Object.keys(this.view).sort();
            // rotate keys so that it starts from your peer id.
            // (e.x. if my id is c and the peers I've seen are a, b, d, e,
            //  I want keys to be [d, e, a, b]
            var myLoc = 0;
            for (var i = 0; i < keys.length; i++) {
                if (keys[i] > this.sid) {
                    myLoc = i;
                    break;
                }
            }
            keys = keys.slice(myLoc, keys.length).concat(keys.slice(0, myLoc));

            this.lastReconnectAttempt = 0;
            setInterval(() => {
                this.incrementReconnectAttempt(keys.length);
                if (keys[this.lastReconnectAttempt] == this.sid) {
                    this.incrementReconnectAttempt(keys.length);
                }
                if (!Object.keys(this.directlyConnectedPeers).includes(keys[this.lastReconnectAttempt])) {
                    this.connect(String(keys[this.lastReconnectAttempt]));
                }
            }, 1500); // given 1.5 seconds to try to create each connection
        }
    },
    incrementReconnectAttempt: function (wrapLength) {
        this.lastReconnectAttempt = (this.lastReconnectAttempt + 1) % wrapLength;
    }

}

// operation types
var MessageType = {
    "PeerListUpdate": 0,
    "BroadcastUpdate": 1,
    "SequenceOp": 2,
    "NewscastReq": 3,
    "NewscastResp": 4,
    "CursorPositionUpdate": 5
}
Object.freeze(MessageType);

module.exports = {
    PeerWrapper,
    MessageType
};
