var ops = require("./Ops");
var vc = require("../vectorclock/vectorClock");
var s3v = require("../vectorclock/s3vector");

// RSTOPS TESTS
test('Testing RSTOp constructor', () => {
    var testvc = new vc.VectorClock([1]);
    var test = new ops.RSTOp(ops.opEnum.INSERT_OP, "hello world".split(""),
        new s3v.s3Vector(testvc, 1, 2), new s3v.s3Vector(testvc.deepCopy(), 3, 4),
        5, 6, 7, 8);
    expect(test.opType).toBe(ops.opEnum.INSERT_OP);
    expect(test.contents).toEqual(['h', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd']);
    expect(s3v.equal(test.vPos, new s3v.s3Vector(testvc.deepCopy(), 1, 2)))
        .toBe(true);
    expect(s3v.equal(test.vTomb, new s3v.s3Vector(testvc.deepCopy(), 3, 4)))
        .toBe(true);
    expect(test.offsetStart).toBe(5);
    expect(test.offsetEnd).toBe(6);
    expect(test.pos).toBe(7);
    expect(test.len).toBe(8);
});

test('Testing RSTOp getSid', () => {
    var testvc = new vc.VectorClock([1]);
    var test = new ops.RSTOp(ops.opEnum.INSERT_OP, "hello world",
        new s3v.s3Vector(testvc, 1, 2), new s3v.s3Vector(testvc.deepCopy(), 3, 4),
        5, 6, 7, 8);
    expect(test.getSID()).toBe(4);
});

// SEQOPS TESTS
test('Testing SeqOp constructor', () => {
    var test = new ops.SeqOp(ops.opEnum.INSERT_OP, "hi hi", 5, 20);
    expect(test.opType).toBe(ops.opEnum.INSERT_OP);
    expect(test.contents).toBe("hi hi");
    expect(test.pos).toBe(5);
    expect(test.arg).toBe(20);
});

test('Testing generateSeqOpsForInsert', () => {
    var test = ops.generateSeqOpsForInsert(5, "hi hi");
    expect(test.opType).toBe(ops.opEnum.INSERT_OP);
    expect(test.contents).toEqual(['h', 'i', ' ', 'h', 'i']);
    expect(test.pos).toBe(5);
    expect(test.arg).toBe(0);
});

test('Testing generateSeqOpsForDelete', () => {
    var test = ops.generateSeqOpsForDelete(5, 10);
    expect(test.opType).toBe(ops.opEnum.DELETE_OP);
    expect(test.contents).toBeNull();
    expect(test.pos).toBe(5);
    expect(test.arg).toBe(10);
});