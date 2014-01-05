'use strict';

var chalk = require('chalk');
var util = require('util');
var sshCredentials = require('./lib/sshCredentials.js');
var ssh = require('./lib/ssh.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_version', 'Get the version number currently deployed to EC2', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_version:name')
            ].join('\n'));
        }

        var done = this.async();

        sshCredentials(name, function (c) {

            if (!c) {
                grunt.fatal('This instance is refusing SSH connections for now');
            }

            grunt.log.writeln('Querying %s to get current version number over ssh...', chalk.cyan(c.id));

            var current = conf('SRV_CURRENT');
            var commands = [
                util.format('readlink -f %s | sed -e "s/.*v\\///"', current)
            ];

            ssh(commands, { name: name }, done);
        });
    });
};
