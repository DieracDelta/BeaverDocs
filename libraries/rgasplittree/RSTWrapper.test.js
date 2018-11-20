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
    var insertOp = new ops.SeqOp(ops.opEnum.INSERT_OP, ["h"], 0, 1);
    var test = new wrapper.RSTWrapper(new replica.RSTReplica(), 0);
    test.localInsert(insertOp);
    expect(test.toString()).toBe("h");
});