'use strict';

var chalk = require('chalk');
var lookup = require('./lib/lookup.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_shutdown', 'Terminates an instance, deleting its associated key-pair, IP address, and name tag', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_shutdown:name')
            ].join('\n'));
        }

        var done = this.async();

        lookup(name, function (instance) {
            var elastic = conf('ELASTIC_IP');
            var id = instance.InstanceId;
            var ip = instance.PublicIpAddress;
            var tasks = [
                'ec2_terminate_instance:' + id,
                'ec2_delete_keypair:' + name,
                'ec2_delete_tag:' + id
            ];

            if (elastic) {
                tasks.push('ec2_release_address:' + ip);
            }

            grunt.log.writeln('Queuing termination task for instance %s...', chalk.red(id));
            grunt.task.run(tasks);
            done();
        });

    });
};
