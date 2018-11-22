const s3vector = require('../vectorclock/s3vector');
const RSTNode = require('./RSTNode');
const RSTOp = require('../opTypes/Ops');
const bbt = require('../trees/balancedbinary');
const hashmap = require('../../node_modules/hashmap/hashmap');
const assertion = require('../assertions');

const printCall = false;
const findPositionInLocalTreeDebug = false;

function RSTReplica() {
    // TODO create your own version of dictionary that hashes s3vectors -> nodes
    this.dict = new hashmap.HashMap();
    // head of the linked list
    this.head = new RSTNode.RSTNode(null, null, null, null, true, null);
    // root of the tree
    this.root = null;
    this.size = 0;
}

RSTReplica.prototype = {
    // op: remote RSTOp to apply to local replica
    // returns boolean indicating success
    apply: function (op) {
        switch (op.opType) {
            case RSTOp.opEnum.DELETE_OP:
                return this.remoteDelete(op);
            case RSTOp.opEnum.INSERT_OP:
                return this.remoteInsert(op);
            default:
                // op irrelevant
                // only need delete and insert
                return false;
        }
    },
    // op: remote RSTOp to apply to local replica
    // returns boolean indicating success
    remoteInsert: function (op) {
        // if (this.root === null) {
        //     console.log("root is null");
        // } else {
        //     console.log("root len: " + this.root.rep.toString());
        // }
        // if (printCall) {
        // console.log("called remote insert\n");
        // }
        var insNode = new RSTNode.RSTNode(op.vTomb, op.contents, null, null, false, null)
        var refNode, nextNode, refTree;

        if (op.vPos === null) {
            refNode = this.head;
        } else {
            var netOffset = op.offsetStart + op.vPos.offset;
            refNode = this.getSuitableNode(this.dict.get(op.vPos.hash()), netOffset);
            this.remoteSplit(refNode, netOffset);
        }
        if (refNode.idTree !== null && refNode.idTree.rightChild !== null) {
            console.log("ref Node: " + refNode.idTree.rightChild.rep.toString());
        }

        nextNode = refNode.nextLink;
        while (nextNode !== null) {
            // TODO add into while statement :/
            if (s3vector.preceeds(nextNode.key, op.vTomb)) {
                break;
            }
            refNode = nextNode;
            nextNode = nextnode.nextLink;
        }

        refTree = refNode.getNextAliveLinkedListNode();

        this.insertInLocalTree(refTree, insNode);

        insNode.nextLink = nextNode;
        refNode.nextLink = insNode;
        this.dict.set(op.vTomb.hash(), insNode);
        this.size += insNode.length;
    },
    // perform remote delete
    remoteDelete: function (op) {
        if (printCall) {
            console.log("called remote delete\n");
        }
        var offsetStartAbs = op.offsetStart + op.vPos.offset - 1;
        var offsetStartRel = op.offsetStart - 1;
        var offsetEndAbs = op.offsetEnd + op.vPos.offset;
        var offsetEndRel = op.offsetEnd;

        var delNode = this.dict.get(op.vPos.hash());
        assertion.assert(delNode.printType(), "node");
        delNode = this.getSuitableNode(delNode, offsetStartAbs);
        assertion.assert(delNode.printType(), "node");

        if (offsetStartRel > 0) {
            this.remoteSplit(delNode, offsetStartAbs);
            delNode = delNode.splitLink;
        }
        assertion.assert(delNode.printType(), "node");
        while (delNode.getOffset() + delNode.length < offsetEndAbs) {
            if (!delNode.isTombstone) {
                this.size -= delNode.length;
                this.deleteInLocalTree(delNode);
            }
            delNode.kill();
            delNode = delNode.splitLink;
        }

        if (offsetEndRel > 0) {
            this.remoteSplit(delNode, offsetEndAbs);
            if (!delNode.isTombstone) {
                this.size -= delNode.length;
                this.deleteInLocalTree(delNode);
            }
            delNode.kill();
        }
    },
    // perform remote split, given node and offset
    // TODO need to go through and replace key.offset with conditional if the key is null
    // node is
    remoteSplit: function (node, offset) {
        if (printCall) {
            console.log("called remote split\n");
        }
        assertion.assert(node.printType(), "node");
        var end = null;
        if (offset - node.key.offset > 0 && node.length - offset + node.key.offset > 0) {
            var a = [];
            var b = [];

            if (!node.isTombstone) {
                a = node.content.slice(0, offset - node.key.offset);
                b = node.content.slice(offset - node.key.offset, node.length);
            }
            var temp = new s3vector.s3Vector(null, offset, node.key.sid);
            temp.sum = node.key.sum;
            end = new RSTNode.RSTNode(temp, b, node.nextLink, node.splitLink, node.isTombstone, node.idTree);
            // redundant?
            end.length = node.length - offset - node.key.offset;

            node.content = a;
            node.length = offset - node.key.offset;
            node.nextLink = end;
            node.splitLink = end;

            // TODO are we hashing on key or node?
            this.dict.set(node.key.hash(), node);
            this.dict.set(end.key.hash(), end);

            // if the node is visible, insert in a node
            if (!node.isTombstone) {
                var treeEnd = new bbt.BalancedBinaryTree(end, null, node.idTree.rightChild, null);
                node.idTree.rep = node;
                node.idTree.rightChild = treeEnd;
                treeEnd.parent = node.idTree;
            }
        }
    },
    // get the best node based 
    getSuitableNode: function (node, offsetToBeat) {
        if (printCall) {
            console.log("called get suitable node\n");
        }
        while (node.length + ((node.key !== null) ? node.key.offset : 0) < offsetToBeat) {
            node = node.splitLink;
        }
        return node;
    },
    // finds the Position in local replica
    // pos is int
    findPositionInLocalTree: function (pos) {
        if (printCall) {
            console.log("called find position in local tree\n");
        }
        var tree = this.root;
        if (pos <= 0 || this.root === null) {
            // TODO why is this null and not tree
            return new Position(null, 0);
        } else if (pos >= this.size) {
            tree = this.findMostRight(tree, 0);
            return new Position(tree.rep, tree.rep.length);
        } else {
            var counter = 0;
            // TODO print out the metadata and do a play-by-play compare
            while (
                !(tree.length - ((tree.rightChild === null) ? 0 : tree.rightChild.length) - tree.rep.length < pos &&
                    pos <= tree.length - ((tree.rightChild === null) ? 0 : tree.rightChild.length)
                )
            ) {
                if (findPositionInLocalTreeDebug) {
                    console.log("tree length:" + tree.length + "\n");
                    console.log("right child length: " + ((tree.rightChild === null) ? "null righchild" : tree.rightChild.length) + "\n");
                    console.log("tree rep length: " + tree.rep.length + "\n");
                    console.log("pos: " + pos + "\n");
                }
                if (pos <= tree.length - ((tree.rightChild === null) ? 0 : tree.rightChild.length) - tree.rep.length) {
                    tree = tree.leftChild;
                } else {
                    pos -= ((tree.leftChild === null) ? 0 : tree.leftChild.length) + tree.rep.length;
                    tree = tree.rightChild;
                    // console.log("THE TREE IS NULL O SHIT: " + tree);
                }
            }

            return new Position(tree.rep, pos -
                tree.length + ((tree.rightChild === null) ? 0 : tree.rightChild.length) +
                tree.rep.length);
        }
    },

    insertInLocalTree: function (nodeOld, nodeNew) {
        if (printCall) {
            console.log("called insert into local tree\n");
        }
        var tree = null;
        if (nodeOld !== null) {
            tree = nodeOld.idTree;
        }

        // TODO is null case here taken care of?
        newTree = new bbt.BalancedBinaryTree(nodeNew, null, null, null);

        var rootIsNull = this.root === null;
        if (rootIsNull || (nodeOld !== null && nodeOld === this.head)) {
            if (rootIsNull) {
                this.root = newTree;
            } else if (this.root.leftChild === null) {
                this.root.leftChild = newTree;
                if (newTree !== null) {
                    newTree.parent = this.root;
                }
            } else {
                var mostRight = findMostRight(this.root.leftChild, 0);
                mostRight.rightChild = newTree;
                if (newTree !== null) {
                    newTree.parent = mostRight;
                }
            }
        } else if (nodeOld === null) {
            var mostRight = this.findMostRight(this.root, 0);
            mostRight.rightChild = newTree;
            if (newTree !== null) {
                newTree.parent = mostRight;
            }
        } else {
            if (tree.leftChild === null) {
                tree.leftChild = newTree;
                newTree.parent = tree;
            } else {
                var mostRight = this.findMostRight(tree.leftChild, 0);
                mostRight.rightChild = newTree;
                newTree.parent = mostRight;
            }
        }

        newTree = newTree.parent;
        while (newTree !== null) {
            newTree.length += nodeNew.length;
            newTree = newTree.parent;
        }
    },
    deleteInLocalTree: function (nodeToDelete) {
        if (printCall) {
            console.log("called delete in local tree\n");
        }
        var tree = nodeToDelete.idTree;
        assertion.assert(tree.printType(), "tree node");
        var parent = null;
        var isRoot = tree === this.root;
        var hasRightChild = tree.rightChild !== null;
        var hasLeftChild = tree.leftChild !== null;
        var isLeaf = !hasRightChild && !hasLeftChild;
        var isLeftChild = false;

        if (!isRoot) {
            parent = tree.parent;
            assertion.assert(parent.printType(), "tree node");
            // TODO wtf is this logic...copied directly, but you should definitely simplify it...
            if (parent.leftChild === null) {
                isLeftChild = false;
                // TODO should actually test for equality by value, not just by reference
            } else if (parent.leftChild === tree) {
                isLeftChild = true;
            }
        }


        if (isRoot) {
            if (isLeaf) {
                this.root = null;
            } else if (hasLeftChild && !hasRightChild) {
                this.root = this.root.leftChild;
            } else if (!hasLeftChild && hasRightChild) {
                this.root = this.root.rightChild;
            } else {
                var leftMost = this.findMostLeft(tree.rightChild, this.root.leftChild.length)
                assertion.assert(leftMost.printType(), "tree node");
                leftMost.leftChild = this.root.leftChild;
                this.root.leftChild.parent = leftMost;
                this.root = this.root.rightChild;
            }
        } else if (isLeaf) {
            if (isLeftChild) {
                parent.leftChild = null;
            } else {
                parent.rightChild = null;
            }
        } else {
            if (!hasRightChild) {
                if (isLeftChild) {
                    // TODO for all of these check if we can access these fields...
                    parent.leftChild = tree.leftChild;
                    tree.leftChild.parent = parent;
                } else {
                    parent.rightChild = tree.leftChild;
                    tree.leftChild.parent = parent;
                }
            } else if (!hasLeftChild) {
                if (isLeftChild) {
                    parent.leftChild = tree.rightChild;
                    tree.rightChild.parent = parent;
                } else {
                    parent.rightChild = tree.rightChild;
                    tree.rightChild.parent = parent;
                }
            } else {
                var mostLeft = this.findMostLeft(tree.rightChild, tree.leftChild.length);
                assertion.assert(leftMost.printType(), "tree node");
                mostLeft.leftChild = tree.leftChild;
                tree.leftChild.parent = mostLeft;
                if (isLeftChild) {
                    parent.leftChild = tree.rightChild;
                    tree.rightChild.parent = parent.leftChild;
                } else {
                    parent.rightChild = tree.rightChild;
                    tree.rightChild.parent = parent.rightChild;
                }
            }
        }
        assertion.assert(parent.printType(), "tree node");

        // remove the length from everything
        while (parent !== null) {
            parent.length -= nodeToDelete.length;
            parent = parent.parent;
        }
    },
    // iterates through, adds i to all the right children and returns the rightmost
    // treeRoot is the root of the subtree 
    // i is an integer to be added to length of each left child
    findMostLeft: function (treeRoot, i) {
        if (printCall) {
            console.log("called find most left node\n");
        }
        var treeNode = treeRoot;
        while (treeNode.leftChild !== null) {
            treeNode.length += i;
            treeNode = treeNode.leftChild;
        }
        treeNode.length += i;
        return treeNode;
    },
    findMostRight: function (treeRoot, i) {
        if (printCall) {
            console.log("called find most right node\n")
        }
        var treeNode = treeRoot;
        while (treeNode.rightChild !== null) {
            treeNode.length += i;
            treeNode = treeNode.rightChild;
        }
        treeNode.length += i;
        return treeNode;
    },
    toString: function () {
        if (this.root === null) {
            return "";
        } else {
            return this.root.toString();
        }
    }
}

function Position(node, offset) {
    this.node = node;
    this.offset = offset;
}

Position.prototype = {
    toString: function () {
        return "\tnode: " +
            ((this.node === null) ? "null" : this.node.toString()) +
            "\n\toffset: " + this.offset.toString() + "\n";
    }

}

function hashmapEquals(a, b) {
    var alen = a.size;
    var blen = b.size;
    if (alen !== blen) {
        return false;
    }

    var akeys = a.keys().sort((a, b) => {
        return a - b;
    });
    var bkeys = b.keys().sort((a, b) => {
        return a - b;
    });

    for (i = 0; i < alen; i++) {
        if (!RSTNode.equal(akeys[i], bkeys[i])) {
            return false;
        }
    }

    return true;
}


module.exports = {
    RSTReplica,
    Position,
    hashmapEquals
}