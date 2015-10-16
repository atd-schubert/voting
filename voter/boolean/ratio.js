/*jslint node:true*/

'use strict';

var Voter = require('../super-class');

var BooleanRatioVoter = function () {
    Voter.apply(this, arguments);
};

BooleanRatioVoter.prototype = {
    '__proto__': Voter.prototype,
    decide: function (cb) {
        Voter.prototype.decide.call(this, function (err, data) {
            var i,
                sum = 0;
            if (err) {
                return cb(err);
            }
            if (data.length === 0) {
                return cb(null, null);
            }
            for (i = 0; i < data.length; i += 1) {
                if (data[i]) {
                    sum += 1;
                }
            }
            return cb(null, sum / data.length);
        });
    }
};

module.exports = BooleanRatioVoter;
