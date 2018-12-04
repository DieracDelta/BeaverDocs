const Helpers = require('./clientSideHelpers');
const assertion = require('../libraries/assertions');
const ops = require('../libraries/opTypes/Ops');
// const rep = require('../libraries/rgasplittree/RSTReplica');

var codemirrorContent = document.getElementById("codemirror-textarea");
var last_pos = 0

window.editor = CodeMirror.fromTextArea(codemirrorContent, {
    lineNumbers: true,
});

document.getElementById('inscpos').onclick = function () {
    // TODO add in regex match as in id checking
    var cur_pos = parseInt(document.getElementById('cpos').value);
    // console.log("inserting at : " + cur_pos);
    // console.log("eq 0" + (cur_pos === 0));
    // console.log("eq 0 parseint" + (parseInt(cur_pos) === 0));
    console.log("cur pos is: " + cur_pos);
    if (cur_pos < 10000) {
        curPeerWrapper.crdt.replica.insertCursor(cur_pos);
        window.editor.setCursor(cur_pos);
    }
    console.log("crdt looks like: " + curPeerWrapper.crdt.replica.ppLinkedList());
    console.log("and the key is: " + curPeerWrapper.crdt.replica.cursor.node.key.toString());
    console.log("cursor now at: " + curPeerWrapper.crdt.replica.getOffset(curPeerWrapper.crdt.replica.cursor.node.key) + curPeerWrapper.crdt.replica.cursor.offset);
}

// cut and paste code from here: 
// https://stackoverflow.com/questions/40282995/how-can-i-act-on-cursor-activity-originating-from-mouse-clicks-and-not-keyboard
// to detect clicks
// on the click look at the position of the cursor
window.editor.on('cursorActivity', (editor) => {
    document.getElementById("relpos").innerHTML = "line: " +
        window.editor.getDoc().getCursor()["line"] +
        ", ch: " + window.editor.getDoc().getCursor()["ch"];
    document.getElementById("abspos").innerHTML = "absolute position: " +
        window.editor.getDoc().indexFromPos(window.editor.getDoc().getCursor());
    // var cur_pos = window.editor.getDoc().indexFromPos(window.editor.getDoc().getCursor());
    // if (curPeerWrapper.crdt.replica.cursor.node !== null) {
    //     var blah = curPeerWrapper.crdt.replica.getOffset(curPeerWrapper.crdt.replica.cursor.node.key) + curPeerWrapper.crdt.replica.cursor.offset;
    //     console.log("crdt offset" + blah);
    //     console.log("editor offset " + cur_pos);
    //     // if (blah === cur_pos) {
    //     curPeerWrapper.crdt.replica.insertCursor(cur_pos);
    //     window.editor.setCursor(cur_pos);
    //     // }
    //     console.log("moved cursor! cursor");
    // } else {
    //     console.log("null cursor!");
    // }
    // var delta = last_pos - cur_pos;
    // var last_pos = cur_pos;
});

// morally speaking, this is the right place to do things
window.editor.on('keyHandled', (editor, c, e) => {
    if (c === "Right") {
        console.log("right yeet")
        var delta = 1;
        curPeerWrapper.crdt.replica.moveCursor(delta);
        if (curPeerWrapper.crdt.replica.cursor.node !== null) {
            var pos = curPeerWrapper.crdt.replica.getOffset(curPeerWrapper.crdt.replica.cursor.node)
            console.log("crdt pos is:" + pos);
            window.editor.setCursor(pos);
        } else {
            console.log("null!");
        }
    }

    if (c === "Left") {
        console.log(curPeerWrapper.crdt.replica.root.prettyPrint());
        console.log("left yeet")
        var delta = -1;
        curPeerWrapper.crdt.replica.moveCursor(delta);
        if (curPeerWrapper.crdt.replica.cursor.node !== null) {
            window.editor.setCursor(curPeerWrapper.crdt.replica.getOffset(curPeerWrapper.crdt.replica.cursor.node))
        } else {
            console.log("null!");
        }
    }

});

window.editor.on('change', (editor, obj) => {
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
    // var removedText = obj.removed;

    if (obj.origin === "+delete") {
        seqops = new ops.generateSeqOpsForDelete(fromAbs, toAbs);
        // console.log("DELETE SSEQ OP IS: " + seqops.toString());
    } else if (obj.origin === "+input") {
        seqops = new ops.generateSeqOpsForInsert(fromAbs, insertedText.reduce(
            (a, b) => a + b, ""
        ));
    } else {
        console.log("unsupported operation!");
        //assertion.assert(true, false);
        return;
    }
    var rops = curPeerWrapper.crdt.applyLocal(seqops);
    // console.log("ASDF" + curPeerWrapper.)
    var broadcastObj = {
        MessageType: Helpers.MessageType.SequenceOp,
        RemoteOps: rops,
        VectorClock: curPeerWrapper.crdt.siteVC,
        messagePeerID: curPeerWrapper.sid
    };
    curPeerWrapper.broadcast(broadcastObj);
    // console.log("remote ops" + rops.toString());
    // for (var op of seqops) {
    //     curPeerWrapper.crdt.applyLocal(op)
    // }
    // console.log(`at this point, the crdt looks like: \n\t\
    //     ${curPeerWrapper.crdt.replica.root.prettyPrint()}`);
});

function getPos() {
    console.log(editor.getDoc().getCursorPosition().indexFromPos())
}

var curPeerWrapper = null;
document.getElementById('init').onclick = function () {
    curPeerWrapper = new Helpers.PeerWrapper(window.editor);
    document.getElementById('init').disabled = true;
    document.getElementById('myID').innerHTML = "id: " + String(curPeerWrapper.sid);
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
        document.getElementById(errors).innerHTML = "peer not yet initialized!";
    } else {
        var idRegex = /^([0-9]){10}$/;
        var inputID = document.getElementById('joinIDInput').value;
        if (!idRegex.test(String(inputID))) {
            document.getElementById('errors').innerHTML = 'Invalid ID';
        } else {
            curPeerWrapper.connect(inputID);
            // curPeerWrapper.PrettyPrintDirectPeerList();
            console.log("successfully connect to " + inputID);
            document.getElementById('joinIDInput').innerHTML = "";
            //document.getElementById('join').disabled = true;
        }
    }
}

document.getElementById('broadcast').onclick = function () {
    if (curPeerWrapper === null) {
        document.getElementById(errors).innerHTML = "peer not yet initialized!";
    } else {
        // curPeerWrapper.broadcast(document.getElementById('codeInput').value);
        curPeerWrapper.broadcast(editor.getValue());
    }

}



document.getElementById('init').click();