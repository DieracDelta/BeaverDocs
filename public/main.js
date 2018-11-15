const Helpers = require('./clientSideHelpers');
console.log("yeet-1");
var curPeerWrapper = null;
document.getElementById('init').onclick = function () {
    curPeerWrapper = new Helpers.PeerWrapper();
    document.getElementById('init').disabled = true;
    document.getElementById('myID').innerHTML = "Your ID: " + String(curPeerWrapper.sid);
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
            curPeerWrapper.PrettyPrintPeerList();
            console.log("successfully conntect to " + inputID);
        }
    }
}

document.getElementById('broadcast').onclick = function () {
    if (curPeerWrapper === null) {
        document.getElementById(errors).innerHTML = "peer not yet initialized!";
    } else {
        curPeerWrapper.broadcast(document.getElementById('joinIDInput').value);
    }

}