const Helpers = require('./clientSideHelpers');

var codemirrorContent = document.getElementById("codemirror-textarea");
window.editor = CodeMirror.fromTextArea(codemirrorContent, {
  lineNumbers: true
});

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