// compares a to b; if not the same, throw the message
function assert(a, b) {
    if (a != b) {
        const msg = "expected: \n\t" + b + "\nbut got: \n\t" + a;
        throw new Error(msg);
    }
}

// expected to only be used with nodes
function assertNotEqual(a, b) {
    if (a.toString() === b.toString()) {
        const msg = "expected: \n\t" + b.toString() + "\nbut got: \n\t" + a.toString;
        throw new Error(msg);
    }

}

module.exports = {
    assert,
    assertNotEqual
}