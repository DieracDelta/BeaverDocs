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
    isConcurrent(vector_2) {

    }


}