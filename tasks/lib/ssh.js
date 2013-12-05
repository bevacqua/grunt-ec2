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

    function cancel (done) {
        console.log('SIGHUP!');
        c.signal('HUP');
        c.once('data', done);
    }

    function ready (err, stream) {
        if (err) { grunt.fatal('Connection error.\n\n',  err); }

        shell = stream;
        shell.on('data', read.bind(null, options.chalk));
    }

    function write (command) {
        shell.write(command + '\n');
    }

    c.on('error', function(err) {
        grunt.fatal('Connection error.\n\n',  err);
    });

    c.shell(ready);

    return {
        write: write,
        cancel: cancel
    };
}

function read (chalkType, data, type) {
    var out = String(data);

    if (type === 'stderr') {
        grunt.log.write(chalk.yellow(out));
    } else {
        grunt.log.write(chalkType ? chalk[chalkType](out) : out);
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
api.interactive = interactive;

module.exports = api;
