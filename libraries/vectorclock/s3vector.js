const vc = require('./vectorClock.js');

// vClock is vectorclock
// offset is integer offset into rgasplittree as described in paper
// sid is integer site id
var s3Vector = function (vClock, offset, sid) {
    if (vClock !== null) {
        this.sum = 0;
        for (var i in vClock.mapping) {
            this.sum += vClock.mapping[i];
        }
    } else {
        this.sum = 0;
    }
    this.sid = sid;
    this.offset = offset;
}

s3Vector.prototype = {
    // TODO
    toString() {
        return `S3 Vector with \n\tsum:${this.sum}\
            \n\tsid:${this.sid}\n\toffset:${this.offset}`;
    },
    hash() {
        var rVal = 3;
        rVal = 79 * rVal + this.sid;
        rVal = 79 * rVal + this.sum;
        rVal = 79 * rVal + this.offset;
        return rVal;
    }
}

// true iff s4Vector a preceeds s4Vector b
// TODO it would be good to do some sort of type checking here
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

module.exports = {
    s3Vector,
    preceeds,
    equal
}