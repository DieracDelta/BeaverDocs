const hashmap = require('../../node_modules/hashmap/hashmap');
const s3v = require('../vectorclock/s3vector');
const node = require('./RSTNode');
const ops = require('../opTypes/Ops');
const bbt = require('../trees/balancedbinary');
const replica = require('./RSTReplica');
const wrapper = require('./RSTWrapper');

// TODO more thorough
// test("testing RSTWrapper constructor", () => {
//     var test = new wrapper.RSTWrapper(new replica.RSTReplica(), 0);
//     expect(test.sid).toBe(0);
// })

// test("testing RSTWrapper local operations", () => {
//     // local INSERT ONLY ops
//     var insertOp1 = new ops.SeqOp(ops.opEnum.INSERT_OP, ["h"], 0, 1);
//     var test = new wrapper.RSTWrapper(new replica.RSTReplica(), 0);
//     test.localInsert(insertOp1);
//     expect(test.toString()).toBe("h");
//     expect(test.replica.root.printType()).toBe("tree node");
//     var insertOp2 = insertOp1.deepCopy()
//     insertOp2.contents = ["a"];
//     test.localInsert(insertOp2);
//     expect(test.toString()).toBe("ah");
//     expect(test.replica.root.printType()).toBe("tree node");
//     expect(test.replica.root.leftChild.parent).toBe(test.replica.root);
//     expect(test.replica.root.rightChild).toBeNull();
//     expect(test.replica.root.leftChild.printType()).toBe("tree node")


//     var insertOp3 = insertOp1.deepCopy();
//     insertOp3.contents = [' ', 'h', 'a', ' ', 'h', 'a', '!'];
//     insertOp3.pos = 2;
//     insertOp3.arg = 7;
//     test.localInsert(insertOp3);
//     expect(test.toString()).toBe("ah ha ha!");
//     var insertOp4 = insertOp1.deepCopy();
//     insertOp4.contents = ['.', ' ', 'A', 'm', 'u', 's', 'e', 'd', '?'];
//     insertOp4.pos = 2;
//     insertOp4.arg = 9;
//     test.localInsert(insertOp4);
//     expect(test.toString()).toBe("ah. Amused? ha ha!");

//     expect(test.replica.root.printType()).toBe("tree node");
//     expect(test.replica.root.leftChild.printType()).toBe("tree node");
//     expect(test.replica.root.rightChild.printType()).toBe("tree node");
//     expect(test.replica.root.leftChild.parent.printType()).toBe("tree node");
//     expect(test.replica.root.leftChild.parent).toBe(test.replica.root);
//     expect(test.replica.root.rightChild.parent.printType()).toBe("tree node");
//     expect(test.replica.root.rightChild.parent).toBe(test.replica.root);
//     expect(test.replica.root.rightChild.leftChild.printType()).toBe("tree node");
//     // console.log(test.replica.root.prettyPrint());
//     expect(test.replica.root.rightChild.leftChild.parent)
//         .toBe(test.replica.root.rightChild);
//     // local DELETE ONLY ops



//     var deleteOp1 = new ops.SeqOp(ops.opEnum.DELETE_OP, null, 0, 5);
//     test.localDelete(deleteOp1);
//     expect(test.toString()).toBe("mused? ha ha!");
//     var deleteOp2 = new ops.SeqOp(ops.opEnum.DELETE_OP, null, 6, 7);
//     test.localDelete(deleteOp2);
//     expect(test.toString()).toBe("mused?");

// });

// test("testing RSTWrapper deletes local operations", () => {
//     var insertOp1 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], 0, 10);
//     var test = new wrapper.RSTWrapper(new replica.RSTReplica(), 0);
//     test.applyLocal(insertOp1);
//     var insertOp2 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['2', '8'], 2, 2);
//     test.applyLocal(insertOp2);
//     expect(test.toString()).toBe("ab28cdefghij")
//     var insertOp3 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['7', '3'], 10, 2);
//     // console.log("before third insert");
//     test.applyLocal(insertOp3);
//     expect(test.toString()).toBe("ab28cdefgh73ij");
//     // console.log(test.replica.root.prettyPrint());
//     // console.log("length" + test.replica.root.rightChild.rightChild.leftChild.length);
//     // console.log("rep:" + test.replica.root.rightChild.rightChild.leftChild.rep.toString());
//     var delOp1 = new ops.SeqOp(ops.opEnum.DELETE_OP, null, 3, 8);
//     test.applyLocal(delOp1);
//     expect(test.toString()).toBe("ab23ij");
// });

// test("YAT yet antoher etest", () => {
//     var test = new wrapper.RSTWrapper(new replica.RSTReplica(), 0);
//     var insertOp1 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['h'], 0, 1);
//     test.localInsert(insertOp1);
//     // console.log("insert Op 1: " + insertOp1.toString());
//     // console.log("insert test 1 gives out: " + test.toString());
//     var insertOp2 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['e'], 1, 2);
//     // console.log("insert Op 2: " + insertOp2.toString());
//     test.localInsert(insertOp2);
//     // console.log("insert test 2 gives out: " + test.toString());
//     var insertOp3 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['l'], 2, 3);
//     // console.log("insert Op 3: " + insertOp3.toString());
//     test.localInsert(insertOp3);
//     // console.log("insert test 3 gives out: " + test.toString());
//     console.log("starting insert 4");
//     var insertOp4 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['l'], 3, 4);
//     // console.log("root: " + test.replica.root.length);
//     // console.log("right child: " + test.replica.root.rightChild.length);
//     // console.log("right right child : " + test.replica.root.rightChild.rightChild.length);
//     // TODO all the tree reps and the tree is the same
//     // so the error literally probablly happens on insert op 4
//     // console.log(test.replica.root.prettyPrint());
//     test.localInsert(insertOp4);
//     expect(test.toString() == "hell");
// });

test("oh here comes another test", () => {
    var test = new wrapper.RSTWrapper(new replica.RSTReplica(), 0);
    var insertOp1 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['h'], 0, 1);
    var insertOp2 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['e'], 1, 1);
    var insertOp3 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['l'], 2, 1);
    var insertOp4 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['l'], 3, 1);
    var insertOp5 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['o'], 4, 1);
    var insertOp6 = new ops.SeqOp(ops.opEnum.INSERT_OP, [' '], 5, 1);
    var insertOp7 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['w'], 6, 1);
    var insertOp8 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['o'], 7, 1);
    var insertOp9 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['r'], 8, 1);
    var insertOp10 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['l'], 9, 1);
    var insertOp11 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['d'], 10, 1);
    var insertOp12 = new ops.SeqOp(ops.opEnum.INSERT_OP, [' '], 11, 1);
    var insertOp13 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['<'], 12, 1);
    var insertOp14 = new ops.SeqOp(ops.opEnum.INSERT_OP, ['3'], 13, 1);
    test.applyLocal(insertOp1);
    test.applyLocal(insertOp2);
    test.applyLocal(insertOp3);
    test.applyLocal(insertOp4);
    test.applyLocal(insertOp5);
    test.applyLocal(insertOp6);
    test.applyLocal(insertOp7);
    test.applyLocal(insertOp8);
    test.applyLocal(insertOp9);
    test.applyLocal(insertOp10);
    test.applyLocal(insertOp11);
    test.applyLocal(insertOp12);
    test.applyLocal(insertOp13);
    test.applyLocal(insertOp14);
    console.log("yeet" + test.toString());
    expect(test.toString()).toBe("hello world <3");
    var delOp = new ops.SeqOp(ops.opEnum.DELETE_OP, null, 6, 6);
    test.applyLocal(delOp);
    console.log("post delete: " + test.toString());
});

test("integration testing between multiple peers", () => {
    var test1 = new wrapper.RSTWrapper(new replica.RSTReplica(), 0);
    var test2 = new wrapper.RSTWrapper(new replica.RSTReplica(), 1);
    var localInsertOps = new ops.generateSeqOpsForInsert(0, "hello world <3");
    var localDeleteOps = new ops.generateSeqOpsForDelete(6, 6);
    var remoteInsertOps = test1.applyLocal(localInsertOps);
    console.log(remoteInsertOps);
    test2.integrateRemote(remoteInsertOps[0]);
    expect(test2.toString()).toBe("hello world <3");
    var remoteDeleteOps = test2.applyLocal(localDeleteOps);
    test1.integrateRemote(remoteDeleteOps[0]);
    expect(test1.toString()).toBe("hello <3");

    // opposite order
    test3 = new wrapper.RSTWrapper(new replica.RSTReplica(), 2);
    test3.integrateRemote(remoteInsertOps[0]);
    test3.integrateRemote(remoteDeleteOps[0]);
    console.log(test3.toString());

    // different place deletes
    var localDelOp1 = new ops.generateSeqOpsForDelete(0, 1);
    var localDelOp2 = new ops.generateSeqOpsForDelete(3, 1);
    var localInsOp1 = new ops.generateSeqOpsForInsert(3, "f");
    var ld1 = test1.applyLocal(localDelOp1);
    var ld2 = test2.applyLocal(localDelOp2);
    var li1 = test1.applyLocal(localInsOp1);

    console.log(ld1.toString());
    console.log(ld2.toString());

    // nice
    test3.integrateRemote(ld1[0]);
    test3.integrateRemote(ld2[0]);
    test3.integrateRemote(li1[0]);
    console.log(test3.toString());
})