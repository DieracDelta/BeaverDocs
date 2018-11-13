const s3vector = require('../vectorclock/s3vector');


// key: s3vector key in dictionary between keys and objects 
// content: the list of elements
// nextLink: pointer to next node in rga linked list
// offset: offset of node within node originally inserted by user
// splitLink: node containing next part of block
// isTombstone: for ease of implementation, include isTombstone
// tree: pointer to identifier tree structure
function RSTNode(key, content, nextLink, splitLink, isTombstone, idTree) {
    // note key contains offset
    this.key = key;
    this.content = content;
    this.nextLink = nextLink;
    this.splitLink = splitLink;
    this.isTombstone = isTombstone;
    this.idTree = idTree;
    // don't need to pass length in since we can get it from content
    this.length = this.content.length;
}

RSTNode.prototype = {
    getContents: function () {
        if (!this.isTombstone) {
            return this.content.reduce((a, c) => a + c, "");
        } else {
            return "RIP";
        }
    },
    kill: function () {
        // null everything out
        this.isTombstone = true;
        this.content = null;
        this.idTree = null;
    },
    // returns either null or the next alive node in the linked list rep
    getNextAliveLinkedListNode: function () {
        var cur = this.nextLink;
        while (cur !== null && cur.isTombstone) {
            cur = cur.nextLink;
        }
        return cur;

    },
    // returns either null or the next alive node in the split rep
    getNextAliveSplitListNode: function () {
        var cur = this.splitLink;
        while (cur !== null && cur.isTombstone) {
            cur = cur.splitLink;
        }
        return cur;
    },
    hash: function () {
        return 267 + ((this.key !== null) ? this.key.hash() : 0);
    }
}

// are nodes a and b equal?
function equal(a, b) {
    if (a.key === null) {
        if (b.key === null) {
            return true;
        } else {
            return false;
        }
    }
    if (b.key === null) {
        return false;
    }
    return s3vector.equals(a.key, b.key)
}

module.exports = {
    RSTNode,
    equal
}