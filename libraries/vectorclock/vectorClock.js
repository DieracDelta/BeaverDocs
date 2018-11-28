// implementation based on
// https://www.cs.rutgers.edu/~pxk/417/notes/clocks/index.html

// ids is an array of current ids (including node's id)
function VectorClock(ids) {
    this.mapping = {};
    for (var id of ids) {
        this.mapping[id] = 0;
    }
}

VectorClock.prototype = {
    // process a received VectorClock event
    // modifies in place the mapping
    processVector: function (otherVClock) {
        for (var otherId in otherVClock.mapping) {
            if (otherId in this.mapping) {
                if (this.mapping[otherId] < otherVClock.mapping[otherId]) {
                    this.mapping[otherId] = otherVClock.mapping[otherId];
                }

            } else {
                this.mapping[otherId] = otherVClock.mapping[otherId];
            }
        }
    },
    getSafe: function (id) {
        if (id in this.mapping) {
            return this.mapping[id];
        } else {
            // TODO should I add this to mapping
            return 0;
        }
    },
    // increment local vector
    increment: function (id) {
        if (id in this.mapping) {
            this.mapping[id]++;
        } else {
            this.mapping[id] = 1;
        }
    },
    // TODO
    // returns a deep copy of the current vector
    deepCopy: function () {
        var rVal = new VectorClock([]);
        rVal.processVector(this);
        return rVal;
    },
    toString: function () {
        var rStr = ""
        for (aId of Object.keys(this.mapping)) {
            rStr += `\n\t ID: ${aId}, Value: ${this.mapping[aId]}`
        }
        return rStr;
    }

}

// are the two vectorclocks concurrent?
function isConcurrent(vector1, vector2) {
    greater = false;
    less = false;

    allKeys = union(new Set(Object.keys(vector1.mapping)), new Set(Object.keys(vector2.mapping)));

    for (var akey of allKeys) {
        var v1val = 0;
        var v2val = 0;

        if (akey in vector1.mapping) {
            v1val = vector1.mapping[akey];
        }
        if (akey in vector2.mapping) {
            v2val = vector1.mapping[akey];
        }
        if (v1val > v2val) {
            greater = true;
        } else if (v1val < v2val) {
            less = true;
        }
    }

    return greater && less
}

// is vector1 ahead of vector2?
function proceeding(vector1, vector2){
    greater = false;
    less = false;

    allKeys = union(new Set(Object.keys(vector1.mapping)), new Set(Object.keys(vector2.mapping)));

    for (var akey of allKeys) {
        var v1val = 0;
        var v2val = 0;

        if (akey in vector1.mapping) {
            v1val = vector1.mapping[akey];
        }
        if (akey in vector2.mapping) {
            v2val = vector1.mapping[akey];
        }
        if (v1val > v2val) {
            greater = true;
        } else if (v1val < v2val) {
            less = true;
        }
    }

    return !greater
}

// set union copied off stack overflow
function union(setA, setB) {
    var _union = new Set(setA);
    for (var elem of setB) {
        _union.add(elem);
    }
    return _union;
}

module.exports = {
    VectorClock,
    isConcurrent
};