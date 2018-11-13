// TODO js-ize this
class S4Vector {
    // TODO can I get ssn from vclock?
    // ssn is monotonically increasing session number for that site
    // vClock is vclock associated with this
    // sid is the site id
    // new RGAS4Vectors are constructed with ssn = 0
    constructor(vClock, ssn, sid) {
        if (vClock !== null && ssn !== null) {
            // separate things
            this.ssn = ssn;
            this.sid = sid;
            this.sum = 0;
            for (var i of vClock.mapping.keys()) {
                this.sum += vClock.mapping[i];
            }
            // "v_o[i]"
            this.seq = vClock.getSafe(sid)
        }
    }

    // toString for hashing
    toString() {
        return String(this.ssn) + "|" + String(this.sid) + "|" + String(this.sum) + "|" + String(this.seq);
    }

    // String2S4Vector to convert btwn the two
    static String2S4Vector(s) {
        var a = s.split("|");
        var rVal = new S4Vector();
        rVal.ssn = a[0];
        rVal.sid = a[1];
        rVal.sum = a[2];
        rVal.seq = a[3];

    }

    // TODO do I need compareTo??
    // true iff s4Vector a preceeds s4Vector b
    static preceeds(a, b) {
        if (a.ssn < b.ssn) {
            return true;
        }
        if ((a.ssn == b.ssn) && (a.sum < b.sum)) {
            return true;
        }
        if ((a.ssn == b.ssn) && (a.sum == b.sum) && a.sid < b.sid) {
            return true;
        }
        return false;
    }
}