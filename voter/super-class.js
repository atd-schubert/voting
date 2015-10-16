/*jslint node:true*/

'use strict';

//var EventEmitter = require('events').EventEmitter;
var async = require('async');

/**
 * Voter super class
 * @param {{}} [opts] -
 * @constructor
 */
var VoterClass = function (opts) {
    opts = opts || {};

    this.decisionBasis = opts.decisionBasis || [];
    if (opts.hasOwnProperty('persistsEvaluation')) {
        this.persistsEvaluation = opts.persistsEvaluation;
    }
    if (opts.hasOwnProperty('onlyOneArgument')) {
        this.onlyOneArgument = opts.onlyOneArgument;
    }
};
/*jslint unparam:true*/ // just for addAsyncBasis!
VoterClass.prototype = {
    // Methods
    /**
     * Add a value or an asynchronous function as decision basis
     * @param {Function|*} AsyncFnOrValue - Asynchronous function or value
     * @returns {VoterClass}
     */
    addDecisionBasis: function (AsyncFnOrValue) {
        this.decisionBasis.push.apply(this.decisionBasis, arguments);
        return this;
    },
    /**
     * Add another voter. Its decision is decision basis for this voter.
     * This is a kind of nested voter.
     * @param {VoterClass} voter - Add a voter as
     * @returns {VoterClass}
     */
    addSubVoter: function (voter) {
        this.addDecisionBasis(function (cb) {
            voter.decide(cb);
        });
        return this;
    },
    /**
     * Remove whole decision basis or a special entry from decision basis if a parameter is given.
     * @param {Number} [n] - Remove just the given position of the decision basis
     * @returns {VoterClass}
     */
    clearBasis: function (n) {
        if (n || n === 0) {
            this.decisionBasis.splice(n, 1);
            return this;
        }
        this.decisionBasis = [];
        return this;
    },
    /**
     * The default decide make from VoterClass (super class) returns an array of the values from the decisions basis.
     * By default elements with null get spliced.
     * @param {VoterClass~decideCallback} cb - Callback with decision
     * @param {boolean} [obtainNull=false] - Should null values obtain?
     * @returns {*}
     */
    decide: function (cb, obtainNull) {
        var asyncArr = [],
            i,
            mkAsyncFn,
            self = this;

        mkAsyncFn = function (n) {
            return function (cb) {
                self.evaluateBasis(n, cb);
            };
        };

        for (i = 0; i < this.decisionBasis.length; i += 1) {
            asyncArr.push(mkAsyncFn(i));
        }
        return async.parallel(asyncArr, function (err, data) {
            var cleanedData = [];
            if (err) {
                return cb(err);
            }
            for (i = 0; i < data.length; i += 1) {
                if (data[i] !== null || obtainNull) {
                    cleanedData.push(data[i]);
                }
            }
            /**
             * @callback VoterClass~decideCallback
             * @param {Error|null} error - Error if there was one
             * @param {*} decision - The decision that results the voter
             */
            return cb(null, cleanedData);
        });
    },
    /**
     * Evaluate a decision basis.
     * @param {number} n - Position of decision basis that should be evaluated
     * @param {VoterClass~evaluateBasisCallback} cb - Callback from evaluation
     * @returns {*}
     */
    evaluateBasis: function (n, cb) {
        var self = this,
            target = this.decisionBasis[n];

        if (typeof target === 'function') {
            return target(function (err, data) {
                var i;
                if (err) {
                    return cb(err);
                }
                if (self.persistsEvaluation) {
                    if (self.onlyOneArgument || arguments.length === 1) {
                        self.decisionBasis[n] = data;
                    } else {
                        self.decisionBasis[n] = [];
                        for (i = 1; i < arguments.length; i += 1) {
                            self.decisionBasis[n].push(arguments[i]);
                        }
                    }
                }
                /**
                 * @callback VoterClass~evaluateBasisCallback
                 * @param {Error|null} error - Error if there was one
                 * @param {*} value - The value that evaluation results
                 */
                return cb(null, self.decisionBasis[n]);
            });
        }
        return cb(null, target);
    },

    // Properties
    /**
     * List of decision basis
     * @type {(Function|*)[]}
     */
    decisionBasis: [],
    /**
     * Should the evaluated value replace the async function
     */
    persistsEvaluation: true,
    /**
     * Should only the second argument from decision callback be used as value?
     * If not it uses all parameters excerpts the first (error) one. If there is more then one it will group them in an
     * array.
     */
    onlyOneArgument: true
};

/*jslint unparam:false*/
module.exports = VoterClass;