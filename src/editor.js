class Editor {
  constructor(doc=document, win=window) {
    this.doc = doc;
    this.colors = ["#FF8C9A", "#BF9BD8", "#53CCE0", "#637CEA", "#A2BEED"];
    this.editorHtmlId = "Collab";
    this.controller = null;
  }

  addUser(id) {
    const button = this.doc.createElement('button');
    button.classList.add('btn-peer');
    button.innerHTML = id;

    const random_color = this.colors[Math.floor(Math.random() * this.colors.length)];
    button.style.borderLeft = "2em solid" + random_color;

    this.doc.getElementById('section-peers').appendChild(button);
  }

  enableEditor() {
    this.doc.getElementById(this.editorHtmlId).classList.remove('hide');
  }


}
export default Editor;
