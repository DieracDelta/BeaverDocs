// an implementation of RGA crdt



class RGANode {
    constructor(content, id, isTS, nextID) {
        this.content = content;
        this.id = id;
        this.isTS = isTS;
        this.nextID = nextID;
    }
}


class RGAID {
    // sid = upstream peer id
    // sum = sum of upstream vector clock value during insertion
    constructor(sid, sum) {
        this.sid = sid;
        this.sum = sum;
    }
}

class S4Vector {
    // 
    constructor(ssn, sid, sum, seq)
}


// true if rgaID1 precedes rgaID2 (i1 < i2)
// function precede(rgaID1, rgaID2) {
//     if (rgaID1.sum < rgaID2.sum) {
//         return true;
//     }
//     if ()
// }