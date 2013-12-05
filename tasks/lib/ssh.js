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

    var busy = true;
    var commands = [];
    var cancel;
    var shell;

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

        (options.dequeued || function () {})();
        write(command, {}, pwd.bind(null, next));
    }

    function pwd (done) {
        write('pwd', { chalk: 'magenta' }, prompt);

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
        if (cancel && busy) {
            cancel(done);
        } else {
            done();
        }
    }

    function ready (err, stream) {
        console.log('ready...');
        if (err) { console.log('Stream :: error :: '+  err); }
        shell = stream;
        shell.on('data', read.bind(null, options.chalk));
    }

    function write (command, options, done) {
        grunt.log.writeln(options.chalk ? chalk[options.chalk](command) : command);
        shell.write(command);

        // TODO: done when finished.
        done();
    }

    c.on('connect', function() {
        console.log('Connection :: connect');
    });
    c.on('ready', function() {
        console.log('Connection :: ready');
    });
    c.on('banner', function(message, lang) {
        console.log('Connection :: banner', lang);
        console.log(message);
    });
    c.on('error', function(err) {
        console.log('Connection :: error :: ' + err);
    });
    c.on('end', function() {
        console.log('Connection :: end');
    });
    c.on('close', function(had_error) {
        console.log('Connection :: close', had_error);
    });
    c.shell(ready);

    return {
        get busy () { return busy; },
        commands: commands,
        enqueue: enqueue,
        dequeue: dequeue,
        kill: kill
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
