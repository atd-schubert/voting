/*jslint node:true*/

'use strict';

var Voter = require('../super-class');

var BooleanOrVoter = function () {
    Voter.apply(this, arguments);
};

BooleanOrVoter.prototype = {
    '__proto__': Voter.prototype,
    decide: function (cb) {
        Voter.prototype.decide.call(this, function (err, data) {
            var i;
            if (err) {
                return cb(err);
            }
            if (data.length === 0) {
                return cb(null, null);
            }
            for (i = 0; i < data.length; i += 1) {
                if (data[i]) {
                    return cb(null, true);
                }
            }
            return cb(null, false);
        });
        return this;
    }
};

module.exports = BooleanOrVoter;