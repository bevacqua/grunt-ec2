'use strict';

var _ = require('lodash');
var grunt = require('grunt');
var chalk = require('chalk');
var Connection = require('ssh2');
var sshCredentials = require('./sshCredentials.js');

function prepare (options, ready, done) {
    options = options || {};

    var c = new Connection();

    c.on('ready', ready);
    c.on('close', done);

    if (options.fatal !== false) {
        c.on('error', grunt.fatal);
    }

    sshCredentials(options.name, function(credentials) {

        if (!credentials) {
            grunt.fatal('This instance is refusing SSH connections for now');
        }

        c.connect(credentials);
    });

    return c;
}

function exec (c, command, options, done) {

    if (done === void 0) { // shift
        done = options;
        options = void 0;
    }

    options = options || {};

    c.exec(command, { pty: true }, function (err, stream) {
        if (err) { return blown(err); }

        stream.on('data', function (data, extended) {
            var out = String(data);

            if (extended === 'stderr') {
                grunt.log.write(chalk.yellow(out));
            } else {
                grunt.log.write(out);
            }
        });

        stream.on('exit', function (code) {

            if (code !== 0) {
                blown(command, chalk.red('exit code ' + code));
            } else {
                done();
            }

        });
    });

    function blown () {
        var args = _.toArray(arguments);

        if (options.fatal !== false) {
            grunt.fatal.apply(grunt, args);
        } else {
            grunt.log.error.call(grunt.log, args);
            done();
        }
    }
}

function api (commands, options, done) {
    options = options || {};

    var c = prepare(options, ready, done);

    function ready () {
        grunt.verbose.writeln('Executing some command(s) over ssh\n', commands);
        next();
    }

    function next () {

        if (commands.length === 0) {
            return c.end();
        }

        var command = commands.shift();

        grunt.log.writeln(chalk.underline(chalk.yellow('[ssh]')), chalk.magenta(command));

        exec(c, command, next);
    }

    return c;
}

api.connect = prepare;
api.exec = exec;

module.exports = api;
