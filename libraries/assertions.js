// compares a to b; if not the same, throw the message
function assert(a, b) {
    if (a !== b) {
        const msg = "expected: \n\t" + b + "\nbut got: \n\t" + a;
        throw new Error(msg);
    }
}

module.exports = {
    assert
}