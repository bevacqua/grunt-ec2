'use strict';

var chalk = require('chalk');
var lookup = require('./lib/lookup.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2-shutdown', 'Terminates an instance, deleting its associated key-pair, IP address, and name tag', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2-shutdown:name')
            ].join('\n'));
        }

        var done = this.async();

        lookup(name, function (instance) {
            var elastic = conf('ELASTIC_IP');
            var id = instance.InstanceId;
            var ip = instance.PublicIpAddress;
            var tasks = [
                'ec2-terminate-instance:' + id,
                'ec2-delete-keypair:' + name,
                'ec2-delete-tag:' + id
            ];

            if (elastic) {
                tasks.push('ec2-release-address:' + ip);
            }

            grunt.log.writeln('Queuing termination task for instance %s...', chalk.red(id));
            grunt.task.run(tasks);
            done();
        });

    });
};
