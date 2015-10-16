/*jslint node:true*/

'use strict';

var StatisticalVarianceVoter = require('./variance');
var StatisticalAverageVoter = require('./average');
var Voter = require('../super-class');

var StatisticalCoeddicentOfVariationVoter = function () {
    Voter.apply(this, arguments);
};

StatisticalCoeddicentOfVariationVoter.prototype = {
    '__proto__': Voter.prototype,
    decide: function (cb) {
        var self = this;
        StatisticalVarianceVoter.prototype.decide.call(this, function (err, variance) {
            if (err) {
                return cb(err);
            }
            if (variance === null) {
                return cb(null, null);
            }
            StatisticalAverageVoter.prototype.decide.call(self, function (err, average) {
                if (err) {
                    return cb(err);
                }
                if (average === null) {
                    return cb(null, null);
                }
                return cb(null, variance / average);
            });
        });
    }
};

module.exports = StatisticalCoeddicentOfVariationVoter;
