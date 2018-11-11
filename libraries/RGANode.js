// an implementation of RGA crdt
class RGANode {
    // pointer to obj
    // sk for hash key and precedence of inserts
    // sp for precedence of deletes and updates
    // link is the next element in the linked list
    constructor(obj, key, tombstone, link) {
        // the actual content of the node
        this.obj = obj;
        this.key = key;
        this.tombstone = tombstone;
        this.link = link; // for linked list
    }
}