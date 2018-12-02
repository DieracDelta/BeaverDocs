const vc = require('../vectorclock/vectorClock');
const s3v = require('../vectorclock/s3vector');
const Ops = require('../opTypes/Ops');
const Replica = require('./RSTReplica');
const RSTNode = require('./RSTNode');
const assertion = require('../assertions');


// intuitively this wrapers the replica and performs the necessary insortion/deletion logic
function RSTWrapper(replica, sid) {
    this.replica = replica;
    // sid aka replica number
    this.sid = sid;
    this.siteVC = new vc.VectorClock([this.sid]);
}

RSTWrapper.prototype = {
    // apply sequence operation to local replica
    // op: SeqOp
    // returns list of RSTops to broadcast to replicas
    applyLocal: function (op) {
        // console.log("222APPLYING INSERT!!")
        // console.log("OP to apply locally: " + op.toString());
        this.checkRep();
        // TODO deal with other cases
        switch (op.opType) {
            case Ops.opEnum.INSERT_OP:
                // console.log("APPLYING INSERT!!")
                return this.localInsert(op);
            case Ops.opEnum.DELETE_OP:
                // console.log("APPLYING DELETE!!")
                return this.localDelete(op);
            default:
                // console.log("FAILL!! with optype: " + op.opType)
                assertion.assert(false, true);
                return null;
        }
    },
    // takes a sequence operation to apply to local replica
    // returns a list of RSTOps to broadcast to remote replicas
    localInsert: function (op) {
        this.checkRep();
        // of type replica.Position
        var pos = this.replica.findPositionInLocalTree(op.pos);
        var vPos = null;

        if (!(op.pos <= 0 || this.replica.root === null)) {
            var temp = pos.node.key;
            vPos = new s3v.s3Vector(null, temp.offset, temp.sid);
            vPos.sum = temp.sum;
        }

        this.localIncrement(this.sid);
        var vTomb = new s3v.s3Vector(this.siteVC, 0, this.sid);
        var rstOp =
            new Ops.RSTOp(
                Ops.opEnum.INSERT_OP, op.contents, vPos, vTomb, pos.offset, 0,
                op.pos, op.length
            );
        this.replica.apply(rstOp);
        this.checkRep();
        // console.log("returning: " + rstOp.toString());
        return [rstOp];
    },
    // takes a sequence operation to apply to local replica
    // returns a list of RSTOps to broadcast to remote replicas
    // TODO I guess I don't neeed to increment the global vc on delete operations??
    localDelete: function (op) {
        // this.localIncrement(this.sid);
        this.checkRep();
        listOfOps = []
        var startPos = this.replica.findPositionInLocalTree(op.pos + 1);
        var endPos = this.replica.findPositionInLocalTree(op.pos + op.arg);
        var startNode = startPos.node;
        // console.log("START NODE: " + startNode.toString());
        var endNode = endPos.node;
        // console.log("END NODE: " + endNode.toString());

        if (RSTNode.equal(startNode, endNode)) {
            var temp = startNode.key;
            var vPos = new s3v.s3Vector(null, temp.offset, temp.sid);
            vPos.sum = temp.sum;
            var rOp = new Ops.RSTOp(
                Ops.opEnum.DELETE_OP, null, vPos, vPos, startPos.offset,
                endPos.offset, 0, 0
            );
            this.replica.apply(rOp);
            // console.log("1: replica looks like: " + this.replica.toString());\
            this.localIncrement(this.sid)
            listOfOps.push(rOp);
        } else {
            var temp = startNode.key;
            var vPos = new s3v.s3Vector(null, temp.offset, temp.sid);
            vPos.sum = temp.sum;
            var rOp = new Ops.RSTOp(
                Ops.opEnum.DELETE_OP, null, vPos, vPos, startPos.offset,
                startNode.length, 0, 0
            );
            // console.log("YEEEET");
            this.replica.apply(rOp);
            // console.log("2: replica looks like: " + this.replica.toString());
            this.localIncrement(this.sid);
            listOfOps.push(rOp);

            var tempNode = startNode.getNextAliveLinkedListNode();
            this.checkRep();
            // console.log("temp node: " + tempNode.toString());

            while (tempNode !== null && !RSTNode.equal(tempNode, endNode)) {
                var temp2 = tempNode.key;
                var vPos2 = new s3v.s3Vector(null, temp2.offset, temp2.sid);
                vPos2.sum = temp2.sum;
                var rOp2 = new Ops.RSTOp(
                    Ops.opEnum.DELETE_OP, null, vPos2, vPos2, 0,
                    tempNode.length, 0, 0
                );
                this.checkRep()
                // console.log("3: operation to apply: " + rOp2.toString());

                this.replica.apply(rOp2);
                // console.log("3: replica looks like: " + this.replica.toString());
                this.localIncrement(this.sid)
                listOfOps.push(rOp2);
                tempNode = tempNode.getNextAliveLinkedListNode();
            }

            if (endPos.offset !== 0) {
                var temp3 = endNode.key;
                var vPos3 = new s3v.s3Vector(null, temp3.offset, temp3.sid);
                vPos3.sum = temp3.sum;
                var rOp3 = new Ops.RSTOp(
                    Ops.opEnum.DELETE_OP, null, vPos3, vPos3, 0,
                    endPos.offset, 0, 0
                );
                // console.log("4: operation to apply: " + rOp3.toString());
                // assertion.assert(false);
                this.replica.apply(rOp3);
                this.localIncrement(this.sid);
                // console.log("4: replica looks like: " + this.replica.toString());
                listOfOps.push(rOp3);
            }
        }
        this.checkRep();

        return listOfOps;
    },
    // integrate a remote operation into replica
    // op: RSTOp
    integrateRemote: function (op) {
        console.log(op.vTomb);
        this.localIncrement(op.vTomb.sid);
        this.replica.apply(op);
    },
    // increments the global vector
    localIncrement: function (id) {
        if (id in this.siteVC.mapping) {
            this.siteVC.mapping[id]++;
        } else {
            this.siteVC.mapping[id] = 1;
        }
        // TODO
    },
    toString: function () {
        return this.replica.toString();
    },
    toStringDebug: function () {
        // TODO include more than just the contents (e.g. all metadata)
    },
    checkRep: function () {
        if (this.replica !== null) {
            this.replica.checkRep();
        }
    }
}





module.exports = {
    RSTWrapper
}