'use strict';

var util = require('util');
var conf = require('./conf.js');
var parse = require('./parse.js');
var running = '[[ $(pm2 jlist) != "[]" ]]';

module.exports = {
    pm2_reload: function () {
        return util.format('%s && sudo pm2 reload all || echo "pm2 not started."', running);
    },
    pm2_start: function (name) {
        var args = parse.args({
            NODE_ENV: name
        },'--');
        var app_env = parse.args(
            conf('ENV')
        );
        return util.format('%s || sudo %s pm2 start %s/%s -i 2 --name %s -- %s || echo "pm2 already started."',
            running, app_env, conf('SRV_CURRENT'), conf('NODE_SCRIPT'), name, args
        );
    }
};