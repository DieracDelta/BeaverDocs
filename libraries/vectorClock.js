// implementation based on
// https://www.cs.rutgers.edu/~pxk/417/notes/clocks/index.html

class VectorClock {
    // ids is a vector of current ids (including node's id)
    // selfID is the id of the current node
    constructor(ids, selfID) {
        this.mapping = {};
        for (var id of ids) {
            this.mapping[id] = 0;
        }
        this.selfID = selfID;
    }

    // process a received VectorClock event
    // modifies in place the mapping
    processVector(otherVClock) {
        for (var otherId of otherVClock.mapping) {
            if (otherId in this.mapping.keys()) {
                if (this.mapping[otherId] < otherVClock.mapping[otherId]) {
                    this.mapping[otherId] = otherVClock.mapping[otherId];
                }

            } else {
                this.mapping[otherId] = otherVClock.mapping[otherId];
            }
        }
    }

    // increment local vector
    increment() {
        this.mapping[this.selfID] += 1;
    }

    // returns a deep copy of the current vector
    deepCopy() {
        newMapping = {};
        for (var aKey of this.mapping) {
            newMapping[aKey] = this.mapping[aKey]
        }
        return (new VectorClock({}, this.selfID)).processVector(this)
    }

    // TODO
    static isConcurrent(vector_1, vector_2) {
        greater = false;
        less = false;


        allKeys = (new Set(vector1.mapping.keys())).union(new Set(vector2.mapping.keys()))

        for (var akey of allKeys) {
            var v1_val = 0;
            var v2_val = 0;

            if (akey in vector_1.mapping.keys) {
                v1_val = vector_1.mapping[akey];
            }
            if (akey in vector_2.mapping.keys) {
                v2_val = vector_1.mapping[akey];
            }
            if (v1_val > v2_val) {
                greater = true;
            } else if (v1_val < v2_val) {
                greater = false;
            }
        }

        return greater && less
    }
}

function union(setA, setB) {
    var _union = new Set(setA);
    for (var elem of setB) {
        _union.add(elem);
    }
    return _union;
}