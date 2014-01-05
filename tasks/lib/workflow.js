'use strict';

var _ = require('lodash');
var path = require('path');
var util = require('util');
var chalk = require('chalk');
var async = require('async');
var grunt = require('grunt');
var conf = require('./conf.js');
var ssh = require('./ssh.js');
var rsync = require('./rsync.js');

function iif (value, commands) {
    return conf(value) ? commands : [];
}

function iif_not (value, commands) {
    return conf(value) ? [] : commands;
}

function api (steps, options, done) {
    var i = 0;

    grunt.verbose.writeln('Following a workflow with %s steps', chalk.cyan(steps.length));

    async.eachSeries(steps, function (step, next) {

        grunt.verbose.writeln('Executing workflow step %s...', chalk.cyan(++i));

        var r = step.rsync;
        if (r) {
            ssh([ util.format('sudo mkdir -p %s', r.dest) ], options, transfer);
        } else {
            var commands = _.flatten(step);
            ssh(commands, options, next);
        }

        function transfer () {
            rsync(options.name, r, move);
        }

        function move () {
            var parent = path.relative(path.dirname(r.local), r.local);
            var remoteSync = util.format('%s%s', r.remote, parent ? '/' + parent : '');

            ssh([ util.format('sudo cp -r %s/* %s', remoteSync, r.dest) ], options, next);
        }
    }, done);

}

api.if_has = iif;
api.if_not = iif_not;

module.exports = api;
