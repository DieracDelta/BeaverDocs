const Helpers = require('./clientSideHelpers');
const assertion = require('../libraries/assertions');
const ops = require('../libraries/opTypes/Ops');

var codemirrorContent = document.getElementById("codemirror-textarea");

window.editor = CodeMirror.fromTextArea(codemirrorContent, {
    lineNumbers: true,
});

window.editor.on('cursorActivity', (editor) => {
    document.getElementById("relpos").innerHTML = "line: " +
        window.editor.getDoc().getCursor()["line"] +
        ", ch: " + window.editor.getDoc().getCursor()["ch"];
    document.getElementById("abspos").innerHTML = "absolute position: " +
        window.editor.getDoc().indexFromPos(window.editor.getDoc().getCursor());
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
        VectorClock: curPeerWrapper.crdt.siteVC
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