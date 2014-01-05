'use strict';

var chalk = require('chalk');
var moment = require('moment');
var sshCredentials = require('./lib/sshCredentials.js');
var ssh = require('./lib/ssh.js');
var conf = require('./lib/conf.js');

function now () {
    return chalk.cyan(moment().format());
}

function wait (fn, duration) {
    setTimeout(fn, (duration || 3) * 1000);
}

module.exports = function (grunt) {

    grunt.registerTask('ec2_wait', 'Waits for an instance to report a public DNS and be accessible through `ssh`', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_wait:name')
            ].join('\n'));
        }

        var done = this.async();

        function waitForDNS () {

            sshCredentials(name, function (c) {
                if (!c) {
                    grunt.log.writeln('%s Waiting for DNS to warm up, retrying in 3s...', now());
                    wait(waitForDNS);
                    return;
                }

                grunt.log.ok('The instance is accessible through host: %s', chalk.cyan(c.host));

                waitForSSH();
            });
        }

        function waitForSSH () {

            grunt.log.writeln('%s Attempting to connect...', now());

            function noop () {}

            var connection = ssh.connect({ name: name, fatal: false }, noop, noop);

            connection.on('error', function () {
                grunt.log.writeln('%s Connection refused, retrying in 3s...', now());
                wait(waitForSSH);
            });

            connection.on('ready', function () {
                grunt.log.ok('Success, proceeding in 10s for good measure.');
                wait(done, 10); // apt-get failed if we didn't wait a bit.
            });
        }

        waitForDNS(); // first attempt
    });
};
