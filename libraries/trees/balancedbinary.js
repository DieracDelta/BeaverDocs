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

module.exports = {
    BalancedBinaryTree
}