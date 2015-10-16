/*jslint node:true*/

'use strict';

var Voter = require('../super-class');

var StatisticalAverageVoter = function () {
    Voter.apply(this, arguments);
};

StatisticalAverageVoter.prototype = {
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
                sum += data[i];
            }

            return cb(null, (sum / data.length));
        });
    }
};

module.exports = StatisticalAverageVoter;
