'use strict';

var chalk = require('chalk');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_terminate_instance', 'Terminates an instance', function (id) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance id.',
                'e.g: ' + chalk.yellow('grunt ec2_terminate_instance:id')
            ].join('\n'));
        }

        grunt.log.writeln('Shutting down EC2 instance %s...', chalk.red(id));

        var done = this.async();
        var params = {
            InstanceIds: [id]
        };

        aws.log('ec2 terminate-instances --instance-ids %s', id);
        aws.ec2.terminateInstances(params, aws.capture('Instance terminated.', done));
    });
};
