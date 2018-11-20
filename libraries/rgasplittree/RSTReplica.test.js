const s3v = require('../vectorclock/s3vector');
const node = require('./RSTNode');
const op = require('../opTypes/Ops');
const bbt = require('../trees/balancedbinary');
const replica = require('./RSTReplica');


test("testing RSTReplica constructor", () => {
    var rep = new replica.RSTReplica();
    expect(rep.dict).toEqual({});
    expect(node.equal(rep.head,
        new node.RSTNode(null, null, null, null, true, null))).toBe(true);
    expect(rep.root).toBeNull();
    expect(rep.size).toBe(0);
})