/*jslint node: true*/
/*global describe, it, before, after, beforeEach, afterEach*/

'use strict';

var voter = require('../');

var asyncTrueFn = function (cb) {
    setTimeout(function () {
        return cb(null, true);
    }, 1);
};
var asyncFalseFn = function (cb) {
    setTimeout(function () {
        return cb(null, false);
    }, 1);
};
var asyncNullFn = function (cb) {
    setTimeout(function () {
        return cb(null, null);
    }, 1);
};

describe('Voting', function () {
    describe('Basic Voter class methods', function () {
        var handle = {},
            andVoter = new voter.boolean.And();

        it('should perform boolean and decision', function (done) {
            andVoter.addDecisionBasis(true, asyncTrueFn);
            andVoter.decide(function (err, decision) {
                if (err) {
                    return done(err);
                }
                if (decision === true) {
                    return done();
                }
                return done(new Error('Wrong decision'));
            });
        });
        it('should perform boolean and decision again with new basis', function (done) {
            andVoter.addDecisionBasis(true, asyncTrueFn);
            andVoter.decide(function (err, decision) {
                if (err) {
                    return done(err);
                }
                if (decision === true) {
                    return done();
                }
                return done(new Error('Wrong decision'));
            });
        });
        it('should execute decision basis function once', function (done) {
            var executed,
                fn = function (cb) {
                    handle.test(cb);
                };
            handle.test = function (cb) {
                executed = true;
                return cb(null, true);
            };
            andVoter.addDecisionBasis(fn);
            andVoter.decide(function (err, decision) {
                if (err) {
                    return done(err);
                }
                if (decision === true && executed) {
                    return done();
                }
                return done(new Error('Decision basis was not executed'));
            });
        });
        it('should not execute decision basis function again', function (done) {
            var executed;
            handle.test = function (cb) {
                executed = true;
                return cb(null, true);
            };
            andVoter.decide(function (err, decision) {
                if (err) {
                    return done(err);
                }
                if (decision === true && !executed) {
                    return done();
                }
                return done(new Error('Decision basis was executed again!'));
            });
        });
        it('should perform boolean and decision again with new basis but with a false', function (done) {
            andVoter.addDecisionBasis(asyncFalseFn);
            andVoter.decide(function (err, decision) {
                if (err) {
                    return done(err);
                }
                if (decision === false) {
                    return done();
                }
                return done(new Error('Wrong decision'));
            });
        });
    });
    describe('Boolean Voter', function () {
        describe('AND', function () {
            var booleanVoter = new voter.boolean.And();

            it('should perform boolean and decision only with true', function (done) {
                booleanVoter.addDecisionBasis(true, asyncTrueFn);
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === true) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should perform boolean and decision again with false', function (done) {
                booleanVoter.clearBasis();
                booleanVoter.addDecisionBasis(true, asyncTrueFn, asyncFalseFn);
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === false) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should perform decision without basis to null', function (done) {
                booleanVoter.clearBasis();
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === null) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
        });
        describe('OR', function () {
            var booleanVoter = new voter.boolean.Or();

            it('should perform boolean or decision only with false', function (done) {
                booleanVoter.addDecisionBasis(false, asyncFalseFn);
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === false) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should perform boolean or decision with true', function (done) {
                booleanVoter.clearBasis();
                booleanVoter.addDecisionBasis(false, asyncTrueFn);
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === true) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should perform decision without basis to null', function (done) {
                booleanVoter.clearBasis();
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === null) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
        });
        describe('XOR', function () {
            var booleanVoter = new voter.boolean.Xor();

            it('should perform boolean or decision only with false', function (done) {
                booleanVoter.addDecisionBasis(false, asyncFalseFn);
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === false) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should perform boolean or decision with true', function (done) {
                booleanVoter.clearBasis();
                booleanVoter.addDecisionBasis(false, asyncTrueFn);
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === true) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should perform decision without basis to null', function (done) {
                booleanVoter.clearBasis();
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === null) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should perform boolean or decision with multiple true', function (done) {
                booleanVoter.clearBasis();
                booleanVoter.addDecisionBasis(false, asyncTrueFn, true);
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === false) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
        });
        describe('ratio', function () {
            var booleanVoter = new voter.boolean.Ratio();

            it('should perform boolean ratio decision only with false', function (done) {
                booleanVoter.addDecisionBasis(false, asyncFalseFn);
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === 0) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should perform boolean ratio decision with true', function (done) {
                booleanVoter.clearBasis();
                booleanVoter.addDecisionBasis(true, asyncTrueFn);
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === 1) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should perform boolean ratio decision mixed', function (done) {
                booleanVoter.clearBasis();
                booleanVoter.addDecisionBasis(true, asyncTrueFn, false, asyncFalseFn);
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === 0.5) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should perform decision without basis to null', function (done) {
                booleanVoter.clearBasis();
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === null) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should not evaluate decision basis with result null', function (done) {
                booleanVoter.clearBasis();
                booleanVoter.addDecisionBasis(true, asyncTrueFn, false, asyncFalseFn, asyncNullFn);
                booleanVoter.decide(function (err, decision) {
                    if (err) {
                        return done(err);
                    }
                    if (decision === 0.5) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
        });
    });
    describe('Statistical Voter', function () {
        describe('Average', function () {
            var statisticalVoter = new voter.statistics.Average();
            it('should get the average', function (done) {
                statisticalVoter.addDecisionBasis(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
                statisticalVoter.decide(function (err, average) {
                    if (err) {
                        return done(err);
                    }
                    if (average === 5) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should get null when no values are given', function (done) {
                statisticalVoter.clearBasis();
                statisticalVoter.decide(function (err, ratio) {
                    if (err) {
                        return done(err);
                    }
                    if (ratio === null) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
        });
        describe('Variance', function () {
            var statisticalVoter = new voter.statistics.Variance();
            it('should get the variance', function (done) {
                statisticalVoter.addDecisionBasis(0, 2);
                statisticalVoter.decide(function (err, variance) {
                    if (err) {
                        return done(err);
                    }
                    if (variance === 1) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should get null when no values are given', function (done) {
                statisticalVoter.clearBasis();
                statisticalVoter.decide(function (err, ratio) {
                    if (err) {
                        return done(err);
                    }
                    if (ratio === null) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
        });
        describe('Coefficient of Variance', function () {
            var statisticalVoter = new voter.statistics.Cv();
            it('should get the cv', function (done) {
                statisticalVoter.addDecisionBasis(0, 2);
                statisticalVoter.decide(function (err, cv) {
                    if (err) {
                        return done(err);
                    }
                    if (cv === 1) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
            it('should get null when no values are given', function (done) {
                statisticalVoter.clearBasis();
                statisticalVoter.decide(function (err, ratio) {
                    if (err) {
                        return done(err);
                    }
                    if (ratio === null) {
                        return done();
                    }
                    return done(new Error('Wrong decision'));
                });
            });
        });
    });
});