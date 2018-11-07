// $(document).ready(function(){
//   var code = $("#codemirror-textarea")[0];
//   var editor = CodeMirror.fromTextArea(code, {
//     lineNumbers: true
//   });
// });
var colors = ["#FF8C9A", "#BF9BD8", "#53CCE0", "#637CEA", "#A2BEED"];
var all_users = document.getElementsByClassName("btn-peer");
console.log("hi");
for (i = 0; i < all_users.length; i++) {
  console.log("hi");
  var random_color = colors[Math.floor(Math.random() * colors.length)];
  all_users[i].style.borderLeft = "2em solid" + random_color;
}

var peer = new Peer({key: 'lwjd5qra8257b9'});
var conn = peer.connect('lwjd5qra8257b9');
conn.on('open', function() {
  // Receive messages
  conn.on('data', function(data) {
    console.log('Received', data);
  });

  // Send messages
  conn.send('Hello!');
});

var code = document.getElementById("codemirror-textarea");
var editor = CodeMirror.fromTextArea(code, {
  lineNumbers: true
});
