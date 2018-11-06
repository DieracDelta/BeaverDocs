// This is the client-side js?

// TODO: import various things...
import Peer from 'peerjs';
import Broadcast from './broadcast';
import Editor from './editor';
import Controller from './controller';

if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
  // do nothing.
  // no support.
} else {

  // TODO: do we need config iceservers?
  var peer = new Peer(
    host: location.hostname,
    port: location.port || (location.protocol === 'https:' ? 443 : 80),
    path: '/peerjs',
    debug: 1
  );

  var broadcast = new Broadcast(/*TODO*/);

  var editor = new Editor(/*TODO*/)

  new Controller(
    peer,
    broadcast,
    editor
  );

}




