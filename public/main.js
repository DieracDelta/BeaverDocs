const Helpers = require('./clientSideHelpers');
const assertion = require('../libraries/assertions');
const ops = require('../libraries/opTypes/Ops');

var codemirrorContent = document.getElementById("codemirror-textarea");
var last_pos = 0;

window.editor = CodeMirror.fromTextArea(codemirrorContent, {
    lineNumbers: true,
});

var curPeerWrapper = null;
curPeerWrapper = new Helpers.PeerWrapper(window.editor);

document.getElementById('myID').innerHTML = "id: " + String(curPeerWrapper.sid);


// document.getElementById('inscpos').onclick = function () {
//     // TODO add in regex match as in id checking
//     var cur_pos = parseInt(document.getElementById('cpos').value);
//     // var cur_pos = window.editor.getDoc().indexFromPos(window.editor.getDoc().getCursor());
//     // console.log("MOTHER FUCKER" + cur_pos);
//     // console.log("cur pos is: " + cur_pos);
//     if (cur_pos < 10000) {
//         curPeerWrapper.crdt.replica.insertCursor(cur_pos);
//         window.editor.setCursor({
//             line: 0,
//             ch: cur_pos
//         });
//     }
// console.log("crdt looks like: " + curPeerWrapper.crdt.replica.ppLinkedList());
// console.log("and the key is: " + curPeerWrapper.crdt.replica.cursor.node.key.toString());
// console.log("cursor now at: " + curPeerWrapper.crdt.replica.getOffset(curPeerWrapper.crdt.replica.cursor.node.key) + curPeerWrapper.crdt.replica.cursor.offset);
// }

// var lastActivityWasInsertOrDelete = false;

window.editor.on('beforeChange', (editor, c) => {
    // console.log(c);
    // if (c.origin === '+input' || c.origin === '+delete') {
    //     var cur_pos = window.editor.getDoc().indexFromPos({
    //         ch: c.from.ch,
    //         line: c.from.line
    //     })
    //     if (cur_pos < 10000) {
    //         console.log("CURRENT POS: " + cur_pos)
    //         curPeerWrapper.crdt.replica.insertCursor(cur_pos);
    //         window.editor.setCursor({
    //             line: 0,
    //             ch: cur_pos
    //         });
    //         if (curPeerWrapper.crdt.replica.cursor.node !== null) {
    //             var crdtcurpos = curPeerWrapper.crdt.getOffset(curPeerWrapper.crdt.replica.node.key)
    //             console.log("inserting CRDT AT YEET: " +
    //                 curPeerWrapper.crdt.replica.cursor.offset + crdtcurpos)
    //             console.log("inserting LOCAL AT YEET: " + cur_pos)
    //         }
    //     }
    // }

    // console.log("C ORGIN IS: " + c.origin)
    if (c.origin === '+input' || c.origin === '+delete') {
        // lastActivityWasInsertOrDelete = true;
        //     var cur_pos = window.editor.getDoc().indexFromPos({
        //         ch: c.from.ch,
        //         line: c.from.line
        //     })
        //     if (cur_pos < 10000) {
        //         curPeerWrapper.crdt.replica.insertCursor(cur_pos);
        //         window.editor.setCursor({
        //             line: 0,
        //             ch: cur_pos
        //         });
        //         console.log("shit mate")
        //         if (curPeerWrapper.crdt.replica.cursor.node !== null) {
        //             console.log("inserting CRDT AT YEET: " + curPeerWrapper.crdt.replica.cursor.offset + curPeerWrapper.crdt.replica.getOffset(curPeerWrapper.crdt.replica.cursor.node.key));
        //             console.log("inserting LOCAL AT YEET: " + cur_pos);
        //         }
        //         console.log("sad")
        //     }
    }
});



var movedByMouse = false;

window.editor.on("mousedown", function () {
    movedByMouse = true;
});

editor.on("keydown", function () {
    if (isMovementKey(event.which)) {
        movedByMouse = false;
    }
});

editor.on("beforeChange", function () {
    movedByMouse = false;
});

function isMovementKey(keyCode) {
    return 33 <= keyCode && keyCode <= 40;
};

// cut and paste code from here: 
// https://stackoverflow.com/questions/40282995/how-can-i-act-on-cursor-activity-originating-from-mouse-clicks-and-not-keyboard
// to detect clicks
// on the click look at the position of the cursor
window.editor.on('cursorActivity', (editor) => {
    console.log("MOTHER FUCKER")
    document.getElementById("relpos").innerHTML = "line: " +
        window.editor.getDoc().getCursor()["line"] +
        ", ch: " + window.editor.getDoc().getCursor()["ch"];
    document.getElementById("abspos").innerHTML = "absolute position: " +
        window.editor.getDoc().indexFromPos(window.editor.getDoc().getCursor());
    curPeerWrapper.broadcastCursorPosition();

    if (movedByMouse) {
        movedByMouse = false;
        if (!window.editor.getSelection()) {
            var cur_pos = window.editor.indexFromPos(window.editor.getDoc().getCursor());
            if (cur_pos < 10000) {
                curPeerWrapper.crdt.replica.insertCursor(cur_pos);
                window.editor.setCursor({
                    line: window.editor.posFromIndex(cur_pos).line,
                    ch: window.editor.posFromIndex(cur_pos).ch
                });
                // console.log("shit mate")
                // if (curPeerWrapper.crdt.replica.cursor.node !== null) {
                // console.log("inserting CRDT AT YEET: " + curPeerWrapper.crdt.replica.cursor.offset + curPeerWrapper.crdt.replica.getOffset(curPeerWrapper.crdt.replica.cursor.node.key));
                // console.log("inserting LOCAL AT YEET: " + cur_pos);
                // }
                // console.log("sad")
            }
        }

    }

});

// morally speaking, this is the right place to do things
window.editor.on('keyHandled', (editor, c, e) => {
    console.log('CHARCTER PRESSED ' + c);
    if (c.origin === 'setValue') {
        var cur_pos = window.editor.getDoc().indexFromPos({
            ch: c.from.ch,
            line: c.from.line
        })
        if (cur_pos < 10000) {
            curPeerWrapper.crdt.replica.insertCursor(cur_pos);
            window.editor.setCursor({
                line: window.editor.getDoc().posFromIndex(cur_pos).line,
                ch: window.editor.getDoc().posFromIndex(cur_pos).ch
            });
        }
    }
    if (c === "Right") {
        // console.log("right yeet")
        var delta = 1;
        curPeerWrapper.crdt.replica.moveCursor(delta);
        if (curPeerWrapper.crdt.replica.cursor.node !== null) {
            var pos = curPeerWrapper.crdt.replica.getOffset(curPeerWrapper.crdt.replica.cursor.node.key) +
                curPeerWrapper.crdt.replica.cursor.offset
            // console.log("crdt pos is:" + pos);
            window.editor.setCursor({
                line: window.editor.getDoc().posFromIndex(pos).line,
                ch: window.editor.getDoc().posFromIndex(pos).ch
            });
        } else {
            // console.log("null!");
        }
    }

    if (c === "Left") {
        console.log(curPeerWrapper.crdt.replica.root.prettyPrint());
        console.log("left yeet")
        var delta = -1;
        curPeerWrapper.crdt.replica.moveCursor(delta);
        if (curPeerWrapper.crdt.replica.cursor.node !== null) {
            var pos = curPeerWrapper.crdt.replica.getOffset(curPeerWrapper.crdt.replica.cursor.node.key) +
                curPeerWrapper.crdt.replica.cursor.offset
            console.log("Moving left to: " + pos);
            window.editor.setCursor({
                line: window.editor.getDoc().posFromEditor(pos).line,
                ch: window.editor.getDoc().posFromEditor(pos).ch
            })

        } else {
            console.log("null!");
        }
    }
});

// window.editor.lineSeparator = ",";

window.editor.on('change', (editor, obj) => {
    console.log("OBJ CHANGED: " + obj);
    document.getElementById("lastchange").innerHTML =
        (
            `Last change metadata: \
            \n\tFROM:${window.editor.getDoc().indexFromPos(obj.from)}\
            \n\tTO:${window.editor.getDoc().indexFromPos(obj.to)}\
            \n\tTEXT:${obj.text}\
            \n\tREMOVED:${obj.removed}\
            \n\tOPTYPE:${obj.origin}`
        );
    var seqops = -1;
    var fromAbs = window.editor.getDoc().indexFromPos(obj.from);
    console.log("fromAbs is" + fromAbs);
    var toAbs = obj.removed.length;
    var insertedText = obj.text;
    console.log("FROM: " + fromAbs);
    console.log("To: " + toAbs);
    console.log("INSERTED TEXT IS: " + obj.text);
    console.log("INSERTED TEXT LEN IS : " + obj.text.length);
    console.log("reduced thing is: " + insertedText.reduce((a, b) => a + b, ""))
    console.log("SHIT MAN " + (insertedText.reduce((a, b) => a + b, "") === "\n"))

    if (obj.origin === "+delete") {
        seqops = new ops.generateSeqOpsForDelete(fromAbs, toAbs);
    } else if (obj.origin === "+input") {
        console.log("SHIT MAN " + insertedText.reduce((a, b) => a + b, ""))
        var rText = insertedText.reduce((a, b) => a + b, "");
        if (insertedText.length == 2 && (rText == "")) {
            console.log("fuuuuck 2")
            rText = "\n";
        }
        seqops = new ops.generateSeqOpsForInsert(fromAbs, rText);
    } else {
        console.log("unsupported operation!");
        return;
    }
    var rops = curPeerWrapper.crdt.applyLocal(seqops);
    var broadcastObj = {
        MessageType: Helpers.MessageType.SequenceOp,
        RemoteOps: rops,
        VectorClock: curPeerWrapper.crdt.siteVC,
        messagePeerID: curPeerWrapper.sid
    };
    curPeerWrapper.broadcast(broadcastObj);
});

function getPos() {
    console.log(editor.getDoc().getCursorPosition().indexFromPos())
}

document.getElementById('copyID').onclick = function () {
    const el = document.createElement('textarea');
    el.value = curPeerWrapper.sid;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

document.getElementById('join').onclick = function () {
    if (curPeerWrapper === null) {
        console.log("peer not yet initialized!");
    } else {
        var idRegex = /^([0-9]){10}$/;
        var inputID = document.getElementById('joinIDInput').value;
        if (!idRegex.test(String(inputID))) {
            console.log("invalid id.")
        } else {
            curPeerWrapper.connect(inputID);
            // curPeerWrapper.PrettyPrintDirectPeerList();
            console.log("successfully connect to " + inputID);
            document.getElementById('joinIDInput').innerHTML = "";
            //document.getElementById('join').disabled = true;
        }
    }
}