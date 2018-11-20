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

test("testing RSTWrapper local insert", () => {
    var insertOp1 = new ops.SeqOp(ops.opEnum.INSERT_OP, ["h"], 0, 1);
    var test = new wrapper.RSTWrapper(new replica.RSTReplica(), 0);
    test.localInsert(insertOp1);
    expect(test.toString()).toBe("h");
    var insertOp2 = insertOp1.deepCopy()
    insertOp2.contents = ["a"];
    test.localInsert(insertOp2);
    expect(test.toString()).toBe("ah");
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
});