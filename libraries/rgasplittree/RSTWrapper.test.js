const hashmap = require('../../node_modules/hashmap/hashmap');
const s3v = require('../vectorclock/s3vector');
const node = require('./RSTNode');
const ops = require('../opTypes/Ops');
const bbt = require('../trees/balancedbinary');
const replica = require('./RSTReplica');
const wrapper = require('./RSTWrapper');

// TODO more thorough
test("testing RSTWrapper constructor", () => {
    var test = new wrapper.RSTWrapper(new replica.RSTReplica(), 0);
    expect(test.sid).toBe(0);
})

test("testing RSTWrapper local operations", () => {
    // local INSERT ONLY ops
    var insertOp1 = new ops.SeqOp(ops.opEnum.INSERT_OP, ["h"], 0, 1);
    var test = new wrapper.RSTWrapper(new replica.RSTReplica(), 0);
    test.localInsert(insertOp1);
    expect(test.toString()).toBe("h");
    expect(test.replica.root.printType()).toBe("tree node");
    var insertOp2 = insertOp1.deepCopy()
    insertOp2.contents = ["a"];
    test.localInsert(insertOp2);
    expect(test.toString()).toBe("ah");
    expect(test.replica.root.printType()).toBe("tree node");
    expect(test.replica.root.leftChild.parent).toBe(test.replica.root);
    expect(test.replica.root.rightChild).toBeNull();
    expect(test.replica.root.leftChild.printType()).toBe("tree node")


    var insertOp3 = insertOp1.deepCopy();
    insertOp3.contents = [' ', 'h', 'a', ' ', 'h', 'a', '!'];
    insertOp3.pos = 2;
    insertOp3.arg = 7;
    test.localInsert(insertOp3);
    expect(test.toString()).toBe("ah ha ha!");
    var insertOp4 = insertOp1.deepCopy();
    insertOp4.contents = ['.', ' ', 'A', 'm', 'u', 's', 'e', 'd', '?'];
    insertOp4.pos = 2;
    insertOp4.arg = 9;
    test.localInsert(insertOp4);
    expect(test.toString()).toBe("ah. Amused? ha ha!");

    expect(test.replica.root.printType()).toBe("tree node");
    expect(test.replica.root.leftChild.printType()).toBe("tree node");
    expect(test.replica.root.rightChild.printType()).toBe("tree node");
    expect(test.replica.root.leftChild.parent.printType()).toBe("tree node");
    expect(test.replica.root.leftChild.parent).toBe(test.replica.root);
    expect(test.replica.root.rightChild.parent.printType()).toBe("tree node");
    expect(test.replica.root.rightChild.parent).toBe(test.replica.root);
    console.log(test.replica.root.prettyPrint());
    // local DELETE ONLY ops
    // expect(test.replica.root)



    // var deleteOp1 = new ops.SeqOp(ops.opEnum.DELETE_OP, null, 3, 5);
    // test.localDelete(deleteOp1);
});