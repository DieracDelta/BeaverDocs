const Helpers = require('./clientSideHelpers');

var codemirrorContent = document.getElementById("codemirror-textarea");
window.editor = CodeMirror.fromTextArea(codemirrorContent, {
  lineNumbers: true
});

window.editor.on('cursorActivity', (editor) => {
    document.getElementById("relpos").innerHTML = "line: " + window.editor.getDoc().getCursor()["line"] + ", ch: " + window.editor.getDoc().getCursor()["ch"];
    document.getElementById("abspos").innerHTML = "absolute position: " + window.editor.getDoc().indexFromPos(window.editor.getDoc().getCursor());
});

window.editor.on('change', (editor, obj) => {
    document.getElementById("lastchange").innerHTML = "Last change: ";
    if (obj["origin"] === "+input") {
        document.getElementById("lastchange").innerHTML += "+input ";
        document.getElementById("lastchange").innerHTML += obj["text"];
    } else if (obj["origin"] === "+delete") {
        document.getElementById("lastchange").innerHTML += "+delete ";
        document.getElementById("lastchange").innerHTML += obj["removed"];
    }
    console.log(obj);
});

function getPos() {
    console.log(editor.getDoc().getCursorPosition().indexFromPos())
}

var curPeerWrapper = null;
document.getElementById('init').onclick = function () {
    curPeerWrapper = new Helpers.PeerWrapper();
    document.getElementById('init').disabled = true;
    document.getElementById('myID').innerHTML = String(curPeerWrapper.sid);
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
            document.getElementById('join').disabled = true;
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