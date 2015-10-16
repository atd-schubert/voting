/*jslint node:true*/

'use strict';

var Voter = require('../super-class');

var BooleanXorVoter = function () {
    Voter.apply(this, arguments);
};

BooleanXorVoter.prototype = {
    '__proto__': Voter.prototype,
    decide: function (cb) {
        Voter.prototype.decide.call(this, function (err, data) {
            var i, once;
            if (err) {
                return cb(err);
            }
            if (data.length === 0) {
                return cb(null, null);
            }
            for (i = 0; i < data.length; i += 1) {
                if (data[i]) {
                    if (once) {
                        return cb(null, false);
                    }
                    once = true;
                }
            }
            if (once) {
                return cb(null, true);
            }
            return cb(null, false);
        });
        return this;
    }
};

module.exports = BooleanXorVoter;