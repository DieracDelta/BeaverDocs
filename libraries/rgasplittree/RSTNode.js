const s3vector = require('../vectorclock/s3vector');


// key: s3vector key in dictionary between keys and objects 
// content: the list of elements (characters)
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
    if (this.content !== null) {
        this.length = this.content.length;
    } else {
        this.length = -1;
    }
}

RSTNode.prototype = {
    getContents: function () {
        if (!this.isTombstone) {
            return this.content.reduce((a, c) => a + c, "");
        } else {
            // return "RIP";
            return "";
        }
    },
    // delete should kill a node
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
    },
    toString: function () {
        return `\tNode with:\n\t\tkey:${this.key}\n\t\tcontent:${this.content}\
            \n\t\tnext link: ${this.nextLink}\n\t\tsplit link:${this.splitLink}
            \n\t\tis tombstone:${this.isTombstone}\n\t\t${this.idTree}\
            \n\t\tlength:${this.length}\n`;
    },
    getOffset: function () {
        if (this.key === null) {
            return 0;
        } else {
            return this.key.offset;
        }
    },
    printType: function () {
        return "Node";
    }
}

// are nodes a and b equal?
function equal(a, b) {
    if (a === null) {
        return b === null;
    }
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
    return s3vector.equal(a.key, b.key)
}

module.exports = {
    RSTNode,
    equal
}