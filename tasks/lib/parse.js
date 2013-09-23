'use strict';

var _ = require('lodash');

module.exports = {
    env: function (dictionary) {
        var pairs = [];

        _.forIn(dictionary, function (value, key) {
            pairs.push(key + '=' + JSON.stringify(value));
        });

        return pairs.join(' ');
    }
};