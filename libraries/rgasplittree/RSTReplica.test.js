const s3v = require('../vectorclock/s3vector');
const node = require('./RSTNode');
const op = require('../opTypes/Ops');
const bbt = require('../trees/balancedbinary');
const replica = require('./RSTReplica');
const hashmap = require('../../node_modules/hashmap/hashmap');


// RST replica tests
test("testing RSTReplica constructor", () => {
    var rep = new replica.RSTReplica();
    expect(replica.hashmapEquals(rep.dict, new hashmap.HashMap())).toBe(true);
    expect(node.equal(rep.head,
        new node.RSTNode(null, null, null, null, true, null))).toBe(true);
    expect(rep.root).toBeNull();
    expect(rep.size).toBe(0);
})

test("testing RSTReplica toString method on empty replica", () => {
    var rep = new replica.RSTReplica();
    expect(rep.toString()).toEqual("");
});

// TODO test tostring on non-empty replica

// position tests
test("testing Position constructor", () => {
    var pos = new replica.Position(null, 5);
    expect(pos.node).toBeNull();
    expect(pos.offset).toBe(5);
});

test("testing Position toString method", () => {
    var pos = new replica.Position(null, 5);
    expect(pos.toString()).toEqual(
        "\tnode: " +
        "null" + "\n\toffset: " +
        "5" + "\n"
    );
});

test("testing insertIntoLocalTree", () => {

});

test("testing hashmapEquals method", () => {
    // TODO im lazy I don't wanna construct nodes
});


// to aid in testing, constructs an example tree
// TODO
function constructTree() {

}