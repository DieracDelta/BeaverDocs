const vc = require('./vectorClock');


test('Testing VectorClock constructor', () => {
    var a = [1, 2, 3];
    var test_vc = new vc.VectorClock(a);
    expect(test_vc.mapping[1]).toBe(0);
    expect(test_vc.mapping[2]).toBe(0);
    expect(test_vc.mapping[3]).toBe(0);
});

test('Testing VectorClock getSafe', () => {
    var a = [1, 2, 3];
    var test_vc = new vc.VectorClock(a);
    expect(test_vc.getSafe(1)).toBe(0);
    expect(test_vc.getSafe(2)).toBe(0);
    expect(test_vc.getSafe(3)).toBe(0);
    expect(test_vc.getSafe(4)).toBe(0);
    expect(test_vc.getSafe(5)).toBe(0);
});
test('Testing VectorClock increment', () => {
    var a = [1, 2, 3];
    var test_vc = new vc.VectorClock(a);
    test_vc.increment(1);
    test_vc.increment(1);
    test_vc.increment(5);
    expect(test_vc.getSafe(1)).toBe(2);
    expect(test_vc.getSafe(2)).toBe(0);
    expect(test_vc.getSafe(3)).toBe(0);
    expect(test_vc.getSafe(5)).toBe(1);
});

test('Testing VectorClock DeepCopy', () => {
    var a = [1, 2, 3];
    var old_vc = new vc.VectorClock(a);
    old_vc.increment(1);
    old_vc.increment(1);
    var new_vc = old_vc.deepCopy();
    new_vc.increment(1);
    expect(old_vc.getSafe(1)).toBe(2);
    expect(new_vc.getSafe(1)).toBe(3);
});

// TODO add tests for isConcurrent and union