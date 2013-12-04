'use strict';

var Connection = require('ssh2');
var grunt = require('grunt');
var chalk = require('chalk');
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

function api (commands, options, done) {
    options = options || {};

    var c = prepare(options, ready, done);

    function ready () {
        grunt.verbose.writeln('Executing some command(s) over ssh\n', commands);
        next();
    }

    function next () {

        if (commands.length === 0) {
            return done();
        }

        var command = commands.shift();

        grunt.log.writeln(chalk.underline(chalk.yellow('[ssh]')), chalk.magenta(command));

        c.exec(command, { pty: true }, function (err, stream) {
            if (err) { grunt.fatal(err); }

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
                    grunt.fatal(command, chalk.red('exit code ' + code));
                } else {
                    next();
                }

            });
        });
    }

    return c;
}

api.connect = prepare;

module.exports = api;
