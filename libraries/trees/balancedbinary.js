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
    // adapted from https://gist.github.com/subeeshb/dd338088ab04607b18a1
    // prints the subtree starting at this node to stdout
    prettyPrint: function () {
        var _printNodes = function (levels) {
            rVal = "";
            for (var i = 0; i < levels.length; i++) {
                var spacerSize = Math.ceil(40 / ((i + 2) * 2));
                var spacer = (new Array(spacerSize + 1).join('  '));
                var lines = levels[i].map(function (val, index) {
                    return (index % 2 === 0) ? ' /' : '\\ ';
                });
                levels[i].unshift('');
                lines.unshift('');
                if (i > 0) {
                    rVal += lines.join(spacer) + "\n";
                }
                rVal += levels[i].join(spacer) + "\n";
            }
            return rVal;
        };

        var _extractNodes = function (node, depth, levels) {
            //traverse left branch
            if (!!node.leftChild) {
                levels = _extractNodes(node.leftChild, depth + 1, levels);
            }

            levels[depth] = levels[depth] || [];
            if (node.rep.isTombstone) {
                levels[depth].push("RIP");
            } else {
                levels[depth].push("LIVE");
            }

            //traverse right branch
            if (!!node.rightChild) {
                levels = _extractNodes(node.rightChild, depth + 1, levels);
            }

            return levels;
        };
        var levels = _extractNodes(this, 0, []);
        return _printNodes(levels);
    }
}

module.exports = {
    BalancedBinaryTree
}