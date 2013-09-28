'use strict';

var _ = require('lodash');
var path = require('path');
var util = require('util');
var async = require('async');
var ssh = require('./ssh.js');
var rsync = require('./rsync.js');

module.exports = function (steps, name, done, fatal) {

    async.eachSeries(steps, function (step, next) {
        var r = step.rsync;
        if (r) {
            ssh([ util.format('sudo mkdir -p %s', r.dest) ], name, transfer, fatal);
        } else {
            var commands = _.flatten(step);
            ssh(commands, name, next, fatal);
        }

        function transfer () {
            rsync(name, r, move);
        }

        function move () {
            var parent = path.relative(path.dirname(r.local), r.local);
            var remoteSync = r.remote + '/' + parent;

            ssh([ util.format('sudo cp -r %s/* %s', remoteSync, r.dest) ], name, next, fatal);
        }
    }, done);

};