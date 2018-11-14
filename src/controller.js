//import CRDT from './libraries/crdt';
import UUID from 'uuid/v1';
import Editor from './editor';

class Controller {
  constructor(targetPeerId, host, peer, broadcast, editor, doc=document, win=window) {
    this.siteId = UUID();
    this.host = host;
    this.opBuffer = []; // list of operations (insertions/deletions)
                        // we need to apply.
    // this.calling = [];
    this.network = []; // list of other nodes in the network
    this.urlId = targetPeerId;


    // set up broadcast
    this.broadcast = broadcast;
    this.broadcast.controller = this;
    this.broadcast.bindServerEvents(targetPeerId, peer);

    // set up editor
    this.editor = editor;
    this.editor.controller = this;
    //this.editor.bindChangeEvent();

    if (targetPeerId == 0) this.editor.enableEditor();
    this.makeName(doc);


    //this.vector = new VersionVector(this.siteId);
    //this.crdt = new CRDT(this);

    //this.editor.bindButtons();
    //this.bindCopyEvent(doc);
  }

  makeName(doc=document) {
    this.editor.addUser(this.siteId);
  }

  addToNetwork(peerId, siteId, doc=document) {
    if (!this.network.find(obj => obj.siteId === siteId)) {
      this.network.push({ peerId, siteId });
      if (siteId !== this.siteId) {
        this.addToListOfPeers(siteId, peerId, doc);
      }

      this.broadcast.addToNetwork(peerId, siteId);
    }
  }
  addToListOfPeers(siteId, peerId, doc=document) {
    // 
    this.editor.addUser(siteId);
  }


  // SYNC FUNCTIONS
  handleSync(syncObj, doc=document, win=window) {
    if (syncObj.peerId != this.urlId) { this.updatePageURL(syncObj.peerId, win); }

    syncObj.network.forEach(obj => this.addToNetwork(obj.peerId, obj.siteId, doc));

    /*
    if (this.crdt.totalChars() === 0) {
      this.populateCRDT(syncObj.initialStruct);
      this.populateVersionVector(syncObj.initialVersions);
    }
    */
    this.editor.enableEditor();

    this.syncCompleted(syncObj.peerId);
  }

  syncCompleted(peerId) {
    const completedMessage = JSON.stringify({
      type: 'syncCompleted',
      peerId: this.broadcast.peer.id
    });

    let connection = this.broadcast.outConns.find(conn => conn.peer === peerId);

    if (connection) {
      connection.send(completedMessage);
    } else {
      connection = this.broadcast.peer.connect(peerId);
      this.broadcast.addToOutConns(connection);
      connection.on('open', () => {
        connection.send(completedMessage);
      });
    }
  }

  // UPDATE FUNCTIONS

  updatePageURL(id, win=window) {
    this.urlId = id;

    const newURL = this.host + '?' + id;
    win.history.pushState({}, '', newURL);
  }

  updateRootUrl(id, win=window) {
    if (this.urlId == 0) {
      this.updatePageURL(id, win);
    }
  }

  updateShareLink(id, doc=document) {
    const shareLink = this.host + '?' + id;
    const aTag = doc.querySelector('#myLink');
    const pTag = doc.querySelector('#myLinkInput');

    pTag.textContent = shareLink;
    aTag.setAttribute('href', shareLink);
  }

}

export default Controller;
