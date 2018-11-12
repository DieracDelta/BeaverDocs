class RGAOp {
    INVALIDOP = -1;
    INSERTOP = 0;
    UPDATEOP = 1;
    // DELETEOP = 2;
    // READOP = 3;

    // type: type of op
    // isRemote: is remote operation
    // pos: for positioning s4vec
    // tombstone: for tombstones s4vec
    // obj: the content of the operation
    // i: the integer index
    constructor(type, isRemote, pos, tombstone, obj, i) {
        this.type = type;
        this.isRemote = isRemote;
        this.pos = pos;
        this.tombstone = tombstone;
        this.obj = obj;
        this.i = i;
    }
}