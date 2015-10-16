# Voting - A voter library for async votes and async statistical analysis in javascript

## How to install

*This module is designed for [node.js](https://nodejs.org/), but it is also possible to use it in browsers. At the
moment this module does not serve a module for browsers, only a commonJS module. If you want to use it in a browser try
to 'compile' it for browsers with [browserify](http://browserify.org/).*

Require the package:

```bash
npm install --save voting
```

## How to use it generally / concept

*Voters use boolean values in general, but this module is enhanced with "statistical voters"*

### Use in node.js

At first you have to require this module.

```js
var voting = require('voting');
```

This module is structured in an associative array (object) and has the following build in voters:

- [boolean](#boolean-voters) - Voters that handle boolean decision basis.
    - [And](#and-voter): All decision basis must be true for a positive decision (logical and).
    - [Or](#or-voter):  One decision basis must be true for a positive decision (logical or).
    - [Ratio](#ratio-voter): Get the ratio between true and false decision basis.
    - [Xor](#xor-voter): Only one decision basis must be true for a positive decision (logical xor).
- [statistics](#statistical-voters) - Voters that evaluate decision basis statistically.
    - [Average](#average-voter): Get the average of all values as decision.
    - [Cv](#coefficient-of-variation-voter): Get the coefficient of variation of all values as decision.
    - [Variance](#variance-voter): Get the variance of all values as decision.

### Support of synchronous, asynchronous functions and values

The goal of this module is to provide an easy way to vote for decisions with asynchronous functions, but it should also
easy to handle values from synchronous functions.

### Persist evaluation

With standard configuration this module persists the evaluated value of a decision basis (abstention).

```js
anyVoter.clearBasis();
anyVoter.addDecisionBasis(function (cb) {
    cb(null, true);
});
console.log('This is a function: ', typeof anyVoter.decisionBasis[0]);

anyVoter.decide(function (err, decision) {
    if (err) {
        return console.error(err);
    }
    console.log('This is your decision: ', decision);
});
console.log('Now it is a boolean: ', typeof anyVoter.decisionBasis[0]);

```

If you do not want to persist values you can switch this option off

```js
anyVoter.persistsEvaluation = false;
```

### Handling of null values

In general `null` as value is interpreted as no or skipped decision basis.

```js
voter = new voting.boolean.And({
    decisionBasis: [true, null, true]
});
voter.decide(function (err, decision) {
    if (err) {
        return console.error(err);
    }
    console.log('The decision should be true even with a null', decision);
});
```

## Specific use

### Boolean votery

*more or less the classical voter*

#### And Voter

All decision basis must be true for a positive decision (logical and).

```js
var fs = require('fs');
var voting = require('voting');

var andVoter = new voting.boolean.And();

andVoter.addDecisionBasis(function existsTheFile(cb) {
    fs.exists('path/to/file', cb)
});
andVoter.addDecisionBasis(function isASettingDone(cb) {
    fs.readFile('path/to/config.json', function (err, data) {
        var json;
        if (err) {
            return cb(err);
        }
        try {
            json = JSON.parse(data);
        } catch (error) {
             cb(error);
        }
        cb(null, json.some.setting);
    });
});
andVoter.addDecisionBasis(something.synchronous());

andVoter.decide(function (err, decision) {
    if (err) {
        console.error('There was an error: ', error);
    }
    // Do something with the decision...
});

```

#### Or Voter

One decision basis must be true for a positive decision (logical or).

```js
var user = require('./user'); // Just an example
var resource = require('./resource'); // Just an example
var voting = require('voting');

var orVoter = new voting.boolean.Or();

orVoter.addDecisionBasis(user.granted);
orVoter.addDecisionBasis(function resourceNeedNoGranted(cb) {
    resource.acl.read(function (err, user, group, all) {
        if (err) {
            return cb(err);
        }
        cb(null, all);
    });
});

orVoter.decide(function (err, decision) {
    if (err) {
        console.error('There was an error: ', error);
    }
    // Do something with the decision...
});

```

#### Ratio Voter

Get the ratio between true and false decision basis.

```js
var socket = require('./socket'); // Just an example
var voting = require('voting');

var ratioVoter = new voting.boolean.Ratio();

var i;

for (i = 0; i < socket.users; i += 1) {
    ratioVoter.addDecisionBasis(socket.users[i].letVote); // True is yes, false is no, null is an abstention
}

ratioVoter.decide(function (err, decision) {
    if (err) {
        console.error('There was an error: ', error);
    }

    // Do something with the decision...
    if (decision >= 0.5) {
        // Decision accepted
    } else {
        // Decision rejected
    }
});

```

#### Xor Voter

Only one decision basis must be true for a positive decision (logical xor).

```js
var user = require('./user'); // Just an example
var voting = require('voting');

var xorVoter = new voting.boolean.Xor();

xorVoter.addDecisionBasis(user.isAllowedToDoSomething);
xorVoter.addDecisionBasis(user.hasAlreadyDoSomething);

// Allow only to do something once
xorVoter.decide(function (err, decision) {
    if (err) {
        console.error('There was an error: ', error);
    }
    // Do something with the decision...
});

```

### Statistical voters

    - [Average](#average-voter): Get the average of all values as decision.
    - [Cv](#coefficient-of-variation-voter): Get the coefficient of variation of all values as decision.
    - [Variance](#variance-voter): Get the variance of all values as decision.

#### Average Voter

Get the average of all values as decision.

```js
var profiles = require('./profiles'); // Just an example

var averageVoter = new voting.statistics.Average();

var i;

for (i = 0; i < profiles.length; i += 1) {
    averageVoter.addDecisionBasis(profiles[i].getAge());
}

averageVoter.decide(function (err, decision) {
    if (err) {
        console.error('There was an error: ', error);
    }
    // Do something with the decision...
});

```

#### Coefficient of variation Voter

Get the coefficient of variation of all values as decision.

*It works quite the same like the average example above but the result is the CV and the class to use is:
`voting.statistical.Cv()`*

#### Variance Voter

Get the variance of all values as decision.

*It works quite the same like the average example above but the result is the variance and the class to use is:
`voting.statistical.Variance()`*

## Create own voters

You can use the super class to augment new voters. Here an example how the AND voter is created

```js
var Voter = require('voting/voter/super-class');

var BooleanAndVoter = function () {
    Voter.apply(this, arguments);
};

BooleanAndVoter.prototype = {
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
                if (!data[i]) {
                    return cb(null, false);
                }
            }
            return cb(null, true);
        });
        return this;
    }
};
```
