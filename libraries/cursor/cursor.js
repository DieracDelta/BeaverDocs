// const s3vector = require('../vectorclock/s3vector');
// const RSTNode = require('./RSTNode');
// const RSTOp = require('../opTypes/Ops');
// const bbt = require('../trees/balancedbinary');
// const hashmap = require('../../node_modules/hashmap/hashmap');
// const assertion = require('../assertions');

// node: the RSTnode the cursor is currently a part of
// offset: the current offset into the node
function CursorPos(node, offset) {
    this.node = node;
    this.offset = offset;
}


module.exports = {
    CursorPos
}