// TODO write a function to balance this tree
// weighted binary tree structure 
// as described in "High Responsiveness for Group Editing CRDTs"

// rep: the node that the binarytree contains

// leftChild: left child BalancedBinaryTree node
function BalancedBinaryTree(rep, leftChild, rightChild, parent) {
    this.rep = rep;
    if (this.rep !== null) {
        this.rep.idTree = this;
    }
    this.leftChild = leftChild;
    this.rightChild = rightChild;
    this.parent = parent;
    this.length = 0;

    if (this.rep !== null) {
        this.length += this.rep.length;
    }

    if (this.leftChild !== null) {
        this.leftChild.parent = this;
        this.length += this.leftChild.rep.length;
    }
    if (this.rightChild !== null) {
        this.rightChild.parent = this;
        this.length += this.rightChild.rep.length;
    }

}

BalancedBinaryTree.prototype = {
    toString: function () {
        rVal = "";
        if (this.leftChild !== null) {
            rVal += this.leftChild.toString();
        }
        if (this.rep !== null) {
            rVal += this.rep.getContents();
        }
        if (this.rightChild !== null) {
            rVal += this.rightChild.toString()
        }
        return rVal;
    },
    printType: function () {
        return "tree node";
    },
    // prints the subtree starting at this node to stdout
    prettyPrint: function () {
        // list of lists of nodes (one list for each level)
        var levels = [
            [this]
        ];
        var i = 0;
        var shouldContinue = true;
        while (shouldContinue) {
            shouldContinue = false;
            cur_level_nodes = levels[i];
            next_level_nodes = [];
            for (j = 0; j < 2 * cur_level_nodes.length; j++) {
                next_level_nodes.push(null);
            }
            for (j = 0; j < cur_level_nodes.length; j++) {
                if (cur_level_nodes[j] !== null) {
                    if (cur_level_nodes[j].leftChild !== null) {
                        shouldContinue = true;
                        next_level_nodes[2 * j] = cur_level_nodes[j].leftChild;
                    }
                    if (cur_level_nodes[j].rightChild !== null) {
                        shouldContinue = true;
                        next_level_nodes[2 * j + 1] = cur_level_nodes[j].rightChild;
                    }
                }
            }
            levels.push(next_level_nodes);
            i++;
        }
        levels.reverse()
        // allow 5 things for each character
        var total_width = levels[0].length;
        var rVal = "";
        for (var i of levels) {
            node_width = 10 * total_width / i.length; // five characters per furthest down node
            level_above_str = "";
            level_str = "";
            everyOther = true;
            for (var j of i) {
                if (i.length != 1) {
                    if (everyOther) {
                        level_above_str += " ".repeat(((node_width / 2) | 0) - 1) + "/" + " ".repeat(((node_width / 2) | 0));
                    } else {
                        level_above_str += " ".repeat(((node_width / 2) | 0) - 1) + "\\" + " ".repeat(((node_width / 2) | 0));
                    }
                }
                everyOther = !everyOther;
                if (j === null) {
                    level_str += " ".repeat(((node_width / 2) | 0) - 1) + "-" + " ".repeat(((node_width / 2) | 0));
                } else if (j.rep.isTombstone) {
                    level_str += " ".repeat(((node_width / 2) | 0) - 1) + "d" + " ".repeat(((node_width / 2) | 0));
                } else {
                    level_str += " ".repeat(((node_width / 2) | 0) - 1) + "a" + " ".repeat(((node_width / 2) | 0));
                }
            }
            rVal = level_above_str + "\n" + level_str + "\n" + rVal;
        }
        return rVal;
    }
}

module.exports = {
    BalancedBinaryTree
}