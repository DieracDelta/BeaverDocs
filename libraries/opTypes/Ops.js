// operation types
var opEnum = {
    "INVALID_OP": -1,
    "INSERT_OP": 0,
    "DELETE_OP": 1,
    "REPLACE_OP": 2,
    "UPDATE_OP": 3,
    "MOVE_OP": 4,
    "NOOP": 5,
    "REVERT_OP": 6,
    "UNDO_OP": 7
}
Object.freeze(opEnum);

// opType: operation type
// contents: contents of block
// vpos: position s3vec
// vTomb: tombstone s3vec
// offsetStart: Starting offset
// offsetStart: ending offset
// pos: position
// len: length
function RSTOp(opType, contents, vPos, vTomb, offsetStart, offsetEnd, pos, len) {
    this.opType = opType;
    this.contents = contents;
    this.vPos = vPos;
    this.vTomb = vTomb;
    this.offsetStart = offsetStart;
    this.offsetEnd = offsetEnd;
    this.pos = pos;
    this.len = len;
}

RSTOp.prototype = {
    getSID = function () {
        return this.vTomb.sid;
    }
}

function SeqOp(opType, contents, pos, arg) {
    this.opType = opType;
    this.contents = contents;
    this.pos = pos;
    this.arg = arg;
}

SeqOp.prototype = {
    // TODO move these outside SeqOp
    // TODO implement the rest of the operations
    // integer position
    // string contents
    generateSeqOpsForInsert: function (position, contents) {
        return new SeqOp(opEnum.INSERT_OP, contents.split(""), position, 0);
    },
    // integer position
    // integer offset
    generateSeqOpsForDelete: function (position, offset) {
        return new SeqOp(opEnum.DELETE_OP, null, position, offset)
    }
}

module.exports = {
    opEnum,
    RSTOp,
    SeqOp
}