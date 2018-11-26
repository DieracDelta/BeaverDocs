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
// offsetEnd: ending offset (type int)
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
    if (contents !== null) {
        this.len = contents.length;
    }
}

RSTOp.prototype = {
    getSID: function () {
        return this.vTomb.sid;
    },
    toString: function () {
        var operationType = "INSERT"
        if (this.opType === opEnum.DELETE_OP) {
            operationType = "DELETE"
        }
        var vpos = (this.vPos !== null) ? this.vPos.toString() : null;
        var vtomb = (this.vTomb !== null) ? this.vTomb.toString() : null;
        return `RSTOP:\n\top type:${operationType}\n\tcontents: ${this.contents}\
        \n\tvPos:${vpos}\n\tvTomb:${vtomb}\
        \n\toffsetStart:${this.offsetStart}\n\toffsetEnd:${this.offsetEnd}\
        \n\tpos:${this.pos}
        \n\tlen:${this.len}`;
    }
}

// Op type that is easy to generate
function SeqOp(opType, contents, pos, arg) {
    this.opType = opType;
    this.contents = contents;
    this.pos = pos;
    this.arg = arg;
}

SeqOp.prototype = {
    deepCopy: function () {
        return new SeqOp(this.opType, this.contents.slice(), this.pos, this.arg);
    },
    toString: function () {
        var operationType = "INSERT"
        if (this.opType === opEnum.DELETE_OP) {
            operationType = "DELETE"
        }
        return `SEQOP:\n\top type:${operationType}\n\t\
        contents: ${this.contents}\
        \n\tpos:${this.pos}
        \n\tlen:${this.arg}`;
    }
}

// TODO move these outside SeqOp
// TODO implement the rest of the operations
// integer position
// string contents
function generateSeqOpsForInsert(position, contents) {
    console.log("the contents are" + typeof (contents));
    var rVal = new SeqOp(opEnum.INSERT_OP, contents.split(""),
        position, contents.split("").length
    );
    console.log("op is: " + rVal.toString());
    return rVal;
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