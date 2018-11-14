class RGAReplica {
    constructor() {
        // wtf is this
        this.rga = {};
        // head of rga
        this.head = null;
    }
    // LOCAL OPS

    // finds the node at index i (not counting tombstones)
    // int i
    // returns null if nothing is found
    findlist(i) {
        var n = this.head;
        var k = 0;
        while (n !== null) {
            // skip ts
            if (n.obj !== null) {
                k++;
                if (i === k) {
                    return n;
                }
            }
            n = n.link; // next node in linked list
        }
        return null;
    }

    // RGAnode n
    findlink(n) {
        // if n is ts, return null
        if (n.obj === null) {
            return null;
        }
        // else literally return n
        return n;
    }

    // LOCAL OPS
    // TODO maybe add asserts to everything

    // inserts op to local rga data structure
    // op contains the integer index, i
    // and the obj field, among other things
    // returns success
    insertLocal(op) {
        // create the new node
        var newNode = new RGANode(op.obj, op.pos, null, null);
        // if the head is null (not created)
        // TODO do I even need this tho
        if (this.head === null) {
            this.head = newNode;
        } else if (op.i === 0) {
            newNode.link = this.head.next;
            head.link = newNode;
        } else {
            var refer_n = findlist(op.i);
            if (refer_n === null) {
                return false;
            } else {
                newNode.link = refer_n.link;
                refer_n.link = newNode;
            }
        }
        this.rga[op.tombstone.toString()] = newNode;
    }

    // delete op to local rga data structure
    // returns success
    deleteLocal(op) {
        var deadNode = findlist(op.i);
        // node at index i doesn't exist
        if (deadNode === null) {
            return false;
        }
        deadNode.obj = null;
        deadNode.tombstone = op.tombstone;
    }


    // accept a remote operation for insertion
    insertRemote(op) {

        var ins;
        var ref;
        // if the position (vector) is null, referring to head
        if (op.pos !== null) {
            ins = head;
        } else {
            // referring to hash
            if (op.pos.toString() in this.rga.keys()) {
                ins = this.rga[op.pos.toString()];
            } else {
                ins = null;
            }
        }









        // var tombstone = op.tombstone;
        // var pos = op.pos;
        // var newNode = new RGANode(op.obj, tombstones4v, null, null);
        // var ins;
        // var ref;
        // if (pos !== null) {
        //     // find left object in hash table
        //     ref = this.rga[pos.toString()];
        //     while (ref !== null && ref.key !== pos) {
        //         ref = ref.next;
        //     }
        //     if (ref === null) {
        //         // ERROR!
        //         // TODO figure out how to throw exception
        //         return false;
        //     }
        // }
        // var prev;
        // var next;

        // if()


    }

    // accept a remote operation for deletion
    deleteRemote(i, o) {

    }
}