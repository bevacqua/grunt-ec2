'use strict';

var grunt = require('grunt');
var chalk = require('chalk');
var util = require('util');
var exec = require('child_process').exec;
var conf = require('./conf.js');

module.exports = function (command, args, opts, done) {

    if (arguments.length < 3) {
        throw new Error('exec(command, args[, opts], done) improperly invoked.');
    } else if (arguments.length === 3) {
        done = opts;
        opts = {};
    }

    args.unshift(command);

    var cmd = util.format.apply(util, args);
    var cfg = { env: conf() };

    if (opts.buffer) {
        cfg.maxBuffer = opts.buffer;
    }

    grunt.log.writeln(chalk.underline.yellow('[cmd]'), chalk.magenta(cmd));

    var proc = exec(cmd, cfg, callback);

    if (opts.pipe !== false) {
        proc.stdout.on('data', function (data) {
            grunt.log.writeln(data);
        });
    }

    proc.stderr.on('data', function (data) {
        grunt.log.writeln(chalk.yellow(data));
    });

    function callback (err, stdout) {
        if (err) { grunt.fatal(err); }

        if (opts.pipe !== false) {
            done();
        } else {
            done(stdout);
        }
    }

    return proc;
};
