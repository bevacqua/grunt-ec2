'use strict';

var grunt = require('grunt');
var chalk = require('chalk');
var util = require('util');
var exec = require('child_process').exec;
var conf = require('./conf.js');

module.exports = function(command, args, done, suppress){
    args.unshift(command);

    var cmd = util.format.apply(util, args);

    grunt.log.writeln(chalk.magenta(cmd));

    var proc = exec(cmd, { maxBuffer: 10000 * 1024, env: conf() }, callback);

    if (suppress !== true) {
        proc.stdout.on('data', function (data) {
            grunt.log.writeln(data);
        });
    }

    proc.stderr.on('data', function (data) {
        grunt.log.writeln(chalk.yellow(data));
    });

    function callback (err, stdout) {
        if (err) { grunt.fatal(err); }

        if (suppress !== true) {
            done();
        } else {
            done(stdout);
        }
    }

    return proc;
};
