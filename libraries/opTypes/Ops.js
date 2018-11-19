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

// Op type that can be applied to replica
// opType: operation type
// contents: contents of block (type list of chars)
// vpos: position s3vec
// vTomb: tombstone s3vec
// offsetStart: Starting offset (type int)
// offsetStart: ending offset (type int)
// pos: position (type int)
// len: length (type int)
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
    getSID: function () {
        return this.vTomb.sid;
    }
}

// Op type that is easy to generate
function SeqOp(opType, contents, pos, arg) {
    this.opType = opType;
    this.contents = contents;
    this.pos = pos;
    this.arg = arg;
}

// TODO move these outside SeqOp
// TODO implement the rest of the operations
// integer position
// string contents
function generateSeqOpsForInsert(position, contents) {
    return new SeqOp(opEnum.INSERT_OP, contents.split(""), position, 0);
}

// integer position
// integer offset
function generateSeqOpsForDelete(position, offset) {
    return new SeqOp(opEnum.DELETE_OP, null, position, offset)
}

module.exports = {
    opEnum,
    RSTOp,
    SeqOp,
    generateSeqOpsForDelete,
    generateSeqOpsForInsert
}