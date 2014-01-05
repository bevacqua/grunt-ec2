'use strict';

var _ = require('lodash');
var grunt = require('grunt');
var chalk = require('chalk');
var Connection = require('ssh2');
var sshCredentials = require('./sshCredentials.js');

function prepare (options, ready, done) {
    options = options || {};

    var c = new Connection();

    c.on('ready', ready.bind(null, c));
    c.on('end', done);

    if (options.fatal !== false) {
        c.on('error', grunt.fatal);
    }

    sshCredentials(options.name, function (credentials) {

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

    grunt.verbose.writeln('exec() on `%s`', command);

    c.exec(command, { pty: true }, function (err, stream) {
        if (err) { return blown(err); }

        stream.on('data', read.bind(null, options.chalk));
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
            grunt.log.writeln.call(grunt.log, args);
            done();
        }
    }
}

function interactive (c, options) {

    options = options || {};

    var shell;
    var aborting = false;

    c.shell(ready);

    function ready (err, stream) {
        if (err) { grunt.fatal('Connection error.\n\n',  err); }

        grunt.log.ok('Connection established! Use ctrl+c twice to exit ssh session');

        shell = stream;
        shell.on('data', read.bind(null, options.chalk));
        shell.on('error', fatal);
        shell.on('exit', exitCommand);

        resume();
    }

    function resume () {
        process.stdin.resume();
        process.stdin.on('data', write);
        process.on('SIGINT', sigint);
    }

    function write (data) {
        aborting = false;
        shell.write(data);
    }

    function sigint () {
        if (!shell) { return; }
        if (aborting) { return exit(); }

        aborting = true;

        shell.write('\x03'); // SIGINT

        grunt.log.write('\nEnter %s again to exit session\n%s',
            chalk.red('ctrl+c'),
            chalk.cyan('» ')
        );
    }

    function exitCommand (code) {
        if (code !== null) {
            exit();
        }
    }

    function exit () {
        grunt.log.writeln();
        grunt.log.ok('Exiting ssh session...');
        c.end();

        shell = void 0;
    }

    function fatal (err) {
        grunt.fatal('Connection error.\n\n',  err);
    }
}

function read (chalkType, data, type) {
    var stdout = String(data);

    if (type === 'stderr') {
        grunt.log.write(chalk.yellow(stdout));
    } else {
        grunt.log.write(chalkType ? chalk[chalkType](stdout) : stdout);
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

        grunt.log.writeln(chalk.underline.yellow('[ssh]'), chalk.magenta(command));

        exec(c, command, next);
    }

    return c;
}

api.connect = prepare;
api.exec = exec;
api.interactive = interactive;

module.exports = api;
