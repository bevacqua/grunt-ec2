'use strict';

var _ = require('lodash');
var util = require('util');
var conf = require('./conf.js');
var parse = require('./parse.js');
var running = '[[ $(pm2 jlist) != "[]" ]]';

module.exports = {
    pm2_reload: function () {
        return util.format('%s && sudo pm2 reload all || echo "pm2 not started."', running);
    },
    pm2_start: function (name) {
        var defaults = {
            NODE_ENV: name
        };
        var user = conf('ENV');
        var env = {};

        // user can override NODE_ENV if need be
        _.assign(env, defaults, user);

        return util.format('%s || sudo %s pm2 start %s/%s -i %s --name %s || echo "pm2 already started."',
            running, parse.toPairs(env), conf('SRV_CURRENT'), conf('NODE_SCRIPT'), conf('PM2_INSTANCES_COUNT'), name
        );
    }
};