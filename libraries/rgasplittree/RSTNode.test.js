const RSTNode = require('./RSTNode');
const s3v = require('../vectorclock/s3vector');
const vc = require('../vectorclock/vectorClock');

// TODO be a bit more fancy with the fields (e.g. not just null)
test("testing RSTNode constructor", () => {
    var vcKey = new vc.VectorClock([0, 1, 2]);
    vcKey.increment(2);
    var key = new s3v.s3Vector(vcKey, 12, 1);
    const content = ['f', 'o', 'o', 'b', 'a', 'r'];
    var test = new RSTNode.RSTNode(key, content, null, null, false, null);
    expect(s3v.equal(test.key, key)).toBe(true);
    expect(test.content).toEqual(content);
    expect(test.nextLink).toBeNull();
    expect(test.splitLink).toBeNull();
    expect(test.isTombstone).toEqual(false);
    expect(test.idTree).toBeNull();
    expect(test.length).toBe(6);

    var test2 = new RSTNode.RSTNode(key, null, null, null, true, null);
    expect(s3v.equal(test2.key, key)).toBe(true);
    expect(test2.content).toBeNull();
    expect(test2.nextLink).toBeNull();
    expect(test2.splitLink).toBeNull();
    expect(test2.isTombstone).toEqual(true);
    expect(test2.idTree).toBeNull();
    expect(test2.length).toBe(-1);
});

test("testing RSTNode getcontents method", () => {
    var vcKey = new vc.VectorClock([0, 1, 2]);
    vcKey.increment(2);
    var key = new s3v.s3Vector(vcKey, 12, 1);
    const content = ['f', 'o', 'o', 'b', 'a', 'r'];
    var test1 = new RSTNode.RSTNode(key, content, null, null, false, null);
    expect(test1.getContents()).toEqual("foobar");
    var test2 = new RSTNode.RSTNode(key, content, null, null, true, null);
    expect(test2.getContents()).toEqual("RIP");
});

test("testing RSTNode kill method", () => {
    var vcKey = new vc.VectorClock([0, 1, 2]);
    vcKey.increment(2);
    var key = new s3v.s3Vector(vcKey, 12, 1);
    const content = ['f', 'o', 'o', 'b', 'a', 'r'];
    var test1 = new RSTNode.RSTNode(key, content, null, null, false, null);
    test1.kill();
    expect(test1.isTombstone).toBe(true);
    expect(test1.content).toBeNull();
    expect(test1.idTree).toBeNull()
});

// TODO test the linked list and split list reps

test("hash", () => {
    var vcKey = new vc.VectorClock([0, 1, 2]);
    vcKey.increment(2);
    var key = new s3v.s3Vector(vcKey, 12, 1);
    const content = ['f', 'o', 'o', 'b', 'a', 'r'];
    var test1 = new RSTNode.RSTNode(key, content, null, null, false, null);
    expect(test1.hash()).toBe(267 + test1.key.hash());
    var test2 = new RSTNode.RSTNode(null, null, null, null, true, null);
    expect(test2.hash()).toBe(267);
});

// TODO test equal method