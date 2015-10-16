/*jslint node:true*/

'use strict';

var Voter = require('../super-class');
var StatisticalAverageVoter = require('./average');

var StatisticalVarianceVoter = function () {
    Voter.apply(this, arguments);
};

StatisticalVarianceVoter.prototype = {
    '__proto__': Voter.prototype,
    decide: function (cb) {
        var self = this;
        StatisticalAverageVoter.prototype.decide.call(this, function (err, average) {
            if (err) {
                return cb(err);
            }
            if (average === null) {
                return cb(null, null);
            }
            Voter.prototype.decide.call(self, function (err, data) {
                var i,
                    sum = 0,
                    diff;
                if (err) {
                    return cb(err);
                }
                if (data.length === 0) {
                    return cb(null, null);
                }
                for (i = 0; i < data.length; i += 1) {
                    diff = data[i] - average;
                    sum += diff * diff;
                }

                return cb(null, (sum / data.length));
            });
        });
    }
};

module.exports = StatisticalVarianceVoter;
