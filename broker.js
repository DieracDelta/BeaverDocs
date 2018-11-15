// inspired by tutorial here: https://github.com/hjr265/arteegee
const PORT = 2718;


// initialize the server that bootstraps connections between peers
var express = require('express');

var app = express();

app.use(express.static('./public/'));

app.route('/').get(
    function (req, res) {
        res.sendFile('./index.html');
    }
)

var srv = app.listen(PORT, function () {
    console.log("listening on port " + PORT)
});


app.use('/peerjs', require('peer').ExpressPeerServer(srv, debug = true))