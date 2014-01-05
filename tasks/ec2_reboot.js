'use strict';

var chalk = require('chalk');
var aws = require('./lib/aws.js');
var lookup = require('./lib/lookup.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_reboot', 'Reboots the EC2 instance', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_reboot:name')
            ].join('\n'));
        }

        var done = this.async();

        lookup(name, function (instance) {
            var id = instance.InstanceId;
            var params = {
                InstanceIds: [id]
            };

            grunt.log.writeln('Rebooting EC2 instance %s...', chalk.magenta(id));
            aws.log('ec2 reboot-instances --instance-ids %s', id);
            aws.ec2.rebootInstances(params, aws.capture('Instance rebooted successfully', done));
        });
    });
};
