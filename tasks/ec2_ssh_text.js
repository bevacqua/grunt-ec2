'use strict';

var util = require('util');
var chalk = require('chalk');
var sshCredentials = require('./lib/sshCredentials.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_ssh_text', 'Displays a verbose command with which you can establish an `ssh` connection to the instance', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_ssh_text:name')
            ].join('\n'));
        }

        var done = this.async();

        sshCredentials(name, function (c) {
            if (!c) {
                grunt.fatal('This instance is refusing SSH connections for now');
            }

            var command = util.format('ssh -o StrictHostKeyChecking=no -i %s %s@%s', c.privateKeyFile, c.username, c.host);

            grunt.log.writeln('Connect to the %s instance using:', chalk.cyan(c.id));
            grunt.log.ok(chalk.blue(command));

            done();
        });

    });
};
