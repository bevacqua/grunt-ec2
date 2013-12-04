'use strict';

var _ = require('lodash');
var grunt = require('grunt');
var chalk = require('chalk');
var util = require('util');
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

        stream.on('data', function (data, extended) {
            var out = String(data);

            if (extended === 'stderr') {
                grunt.log.write(chalk.yellow(out));
            } else {
                grunt.log.write(options.chalk ? chalk[options.chalk](out) : out);
            }
        });

        stream.on('exit', function (code) {

            if (code !== 0) {
                blown(command, chalk.red('exit code ' + code));
            } else {
                done();
            }

        });

        options.cancel = function (done) {
            stream.once('close', done);
            stream.end();
        };
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

function stream (c, options) {

    options = options || {};

    var busy = true;
    var commands = [];
    var latest;

    function enqueue (command) {
        commands.push(command);
        dequeue();
    }

    function dequeue () {
        if (busy) { return; }

        var command = commands.shift();
        if (command) {
            busy = true;
        } else {
            return;
        }

        latest = { fatal: false };
        (options.dequeued || function () {})();
        exec(c, command, latest, pwd.bind(null, next));
    }

    function pwd (done) {
        latest = { fatal: false, chalk: 'magenta' };
        exec(c, 'pwd', latest, prompt);

        function prompt () {
            var message = chalk.cyan('» ');

            if (commands.length) {
                message += util.format('(%s queued command(s) pending)', chalk.magenta(commands.length));
            }

            grunt.log.write(message);
            done();
        }
    }

    function next () {
        busy = false;
        dequeue();
    }

    function kill (done) {
        if (latest && latest.cancel && busy) {
            latest.cancel(done);
        } else {
            done();
        }
    }

    pwd(next);

    return {
        get busy () { return busy; },
        commands: commands,
        enqueue: enqueue,
        dequeue: dequeue,
        kill: kill
    };
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
api.stream = stream;

module.exports = api;
