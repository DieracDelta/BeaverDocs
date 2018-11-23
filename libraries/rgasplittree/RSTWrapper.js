const vc = require('../vectorclock/vectorClock');
const s3v = require('../vectorclock/s3vector');
const Ops = require('../opTypes/Ops');
const Replica = require('./RSTReplica');
const RSTNode = require('./RSTNode');


// intuitively this wrapers the replica and performs the necessary insortion/deletion logic
function RSTWrapper(replica, sid) {
    this.replica = replica;
    // sid aka replica number
    this.sid = sid;
    this.siteVC = new vc.VectorClock([]);
}

RSTWrapper.prototype = {
    // apply sequence operation to local replica
    // op: SeqOp
    // returns list of RSTops to broadcast to replicas
    applyLocal: function (op) {
        // TODO deal with other cases
        switch (op.opType) {
            case Ops.opEnum.INSERT_OP:
                return this.localInsert(op);
            case Ops.opEnum.DELETE_OP:
                return this.localDelete(op);
            default:
                return null;
        }
    },
    // takes a sequence operation to apply to local replica
    // returns a list of RSTOps to broadcast to remote replicas
    localInsert: function (op) {
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
                op.pos, 0
            );
        this.replica.apply(rstOp);
        return [rstOp];
    },
    // takes a sequence operation to apply to local replica
    // returns a list of RSTOps to broadcast to remote replicas
    // TODO I guess I don't neeed to increment the global vc on delete operations??
    localDelete: function (op) {
        listOfOps = []
        var startPos = this.replica.findPositionInLocalTree(op.pos + 1);
        var endPos = this.replica.findPositionInLocalTree(op.pos + op.arg);
        var startNode = startPos.node;
        var endNode = endPos.node;

        if (RSTNode.equal(startNode, endNode)) {
            var temp = startNode.key;
            var vPos = new s3v.s3Vector(null, temp.offset, temp.sid);
            vPos.sum = temp.sum;
            var rOp = new Ops.RSTOp(
                Ops.opEnum.DELETE_OP, null, vPos, vPos, startPos.offset,
                endPos.offset, 0, 0
            );
            this.replica.apply(rOp);
            console.log("1: replica looks like: " + this.replica.toString());
            listOfOps.push(rOp);
        } else {
            var temp = startNode.key;
            var vPos = new s3v.s3Vector(null, temp.offset, temp.sid);
            vPos.sum = temp.sum;
            var rOp = new Ops.RSTOp(
                Ops.opEnum.DELETE_OP, null, vPos, vPos, startPos.offset,
                endNode.length, 0, 0
            );
            this.replica.apply(rOp);
            console.log("2: replica looks like: " + this.replica.toString());
            listOfOps.push(rOp);

            var tempNode = startNode.getNextAliveLinkedListNode();
            console.log("temp node: " + tempNode.toString());

            while (tempNode !== null && !RSTNode.equal(tempNode, endNode)) {
                var temp2 = startNode.key;
                var vPos2 = new s3v.s3Vector(null, temp2.offset, temp2.sid);
                vPos2.sum = temp2.sum;
                var rOp2 = new Ops.RSTOp(
                    Ops.opEnum.DELETE_OP, null, vPos2, vPos2, 0,
                    endNode.length, 0, 0
                );
                this.replica.apply(rOp2);
                console.log("3: replica looks like: " + this.replica.toString());
                listOfOps.push(rOp2);
                tempNode = tempNode.getNextAliveLinkedListNode();
            }

            if (endPos.offset !== 0) {
                var temp3 = startNode.key;
                var vPos3 = new s3v.s3Vector(null, temp3.offset, temp3.sid);
                vPos3.sum = temp3.sum;
                var rOp3 = new Ops.RSTOp(
                    Ops.opEnum.DELETE_OP, null, vPos3, vPos3, 0,
                    endPos.offset, 0, 0
                );
                this.replica.apply(rOp3);
                console.log("4: replica looks like: " + this.replica.toString());
                listOfOps.push(rOp3);
            }
        }
        return listOfOps;
    },
    // integrate a remote operation into replica
    // op: RSTOp
    integrateRemote: function (op) {
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
    }
}





module.exports = {
    RSTWrapper
}