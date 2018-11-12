// vClock is vectorclock
// offset is integer offset into rgasplittree as described in paper
// sid is integer site id
var V3Vector = function (vClock, offset, sid) {
    this.sum = 0;
    for (var i of vClock.mapping.keys()) {
        this.sum += vClock.mapping[i];
    }
    this.sid = sid;
    this.offset = offset;
}

V3Vector.prototype = {
    // TODO
    toString() {
        return "";
    },
    hashCode() {
        var rVal = 3;
        rVal = 79 * rVal + this.sid;
        rVal = 79 * rVal + this.sum;
        rVal = 79 * rVal + this.offset;
    }
}

// true iff s4Vector a preceeds s4Vector b
function preceeds(a, b) {
    if (a.sum < b.sum) {
        return true;
    }
    if (a.sum == b.sum && a.sid < b.sid) {
        return true;
    }
    if (a.sum == b.sum && a.sid == b.sid && a.offset < b.offset) {
        return true;
    }
    return false;
}

function equal(a, b) {
    return a.sum == b.sum && a.sid == b.sid && a.offset == b.offset;
}