const vc = require('./vectorClock');
const s3v = require('./s3vector');

test('Testing s3v constructor', () => {
    var vecClock = new vc.VectorClock([]);
    vecClock.mapping[0] = 5;
    vecClock.mapping[1] = 10
    vecClock.mapping[2] = 300;
    var test = new s3v.s3Vector(vecClock, 20, 0);
    expect(test.offset).toBe(20);
    expect(test.sid).toBe(0);
    expect(test.sum).toBe(315);

    var test2 = new s3v.s3Vector(null, 30, 5);
    expect(test2.sum).toBe(0);
    expect(test2.offset).toBe(30);
    expect(test2.sid).toBe(5);
});

test('Testing s3v preceeds', () => {
    var test1 = new s3v.s3Vector(null, 5, 2);
    var test2 = new s3v.s3Vector(null, 5, 2);
    expect(s3v.preceeds(test1, test2)).toBe(false);
    test2.sum = 8;
    expect(s3v.preceeds(test1, test2)).toBe(true);
    expect(s3v.preceeds(test2, test1)).toBe(false);
    // TODO test the other conditionals to get full code coverage
});

test('Testing s3v equals', () => {
    var vecClock = new vc.VectorClock([]);
    vecClock.mapping[0] = 5;
    vecClock.mapping[1] = 10
    vecClock.mapping[2] = 300;
    var test1 = new s3v.s3Vector(vecClock, 20, 0);
    var test2 = new s3v.s3Vector(vecClock, 20, 0);
    expect(s3v.equal(test1, test2)).toBe(true);
    vecClock.increment(5);
    var test3 = new s3v.s3Vector(vecClock, 20, 0);
    expect(s3v.equal(test1, test3)).toBe(false);
    test2.offset = 50;
    expect(s3v.equal(test1, test2)).toBe(false);
    test2.offset = 20;
    test2.sid = 23;
    expect(s3v.equal(test1, test2)).toBe(false);
    test2.sid = 0;
    expect(s3v.equal(test1, test2)).toBe(true);
})

test('Testing s3v toString', () => {
    var vecClock = new vc.VectorClock([]);
    vecClock.mapping[0] = 5;
    vecClock.mapping[1] = 10
    vecClock.mapping[2] = 300;
    var test = new s3v.s3Vector(vecClock, 20, 0);
    var resultVal = "S3 Vector with \n\tsum:315\
            \n\tsid:0\n\toffset:20";
    expect(test.toString()).toBe(resultVal);
});

test('Testing s3v hash function', () => {
    var vecClock = new vc.VectorClock([]);
    vecClock.mapping[0] = 5;
    vecClock.mapping[1] = 10
    vecClock.mapping[2] = 300;
    var test = new s3v.s3Vector(vecClock, 20, 1);
    expect(test.hash()).toBe(1510263);
});