'use strict';

var util = require('util');
var chalk = require('chalk');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_run_instance', 'Spins up an EC2 instance, gives a name tag and assigns an IP', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide a name for the instance.',
                'e.g: ' + chalk.yellow('grunt ec2_run_instance:name')
            ].join('\n'));
        }

        grunt.log.writeln('Launching EC2 %s instance', chalk.cyan(conf('AWS_INSTANCE_TYPE')));

        var done = this.async();
        var params = {
            ImageId: conf('AWS_IMAGE_ID'),
            InstanceType: conf('AWS_INSTANCE_TYPE'),
            MinCount: 1,
            MaxCount: 1,
            KeyName: name,
            SecurityGroups: [conf('AWS_SECURITY_GROUP')]
        };
        var cmd = 'ec2 run-instances --image-id %s --instance-type %s --count %s --key-name %s --security-groups %s';
        aws.log(cmd, params.ImageId, params.InstanceType, params.MinCount, params.KeyName, params.SecurityGroups[0]);
        aws.ec2.runInstances(params, aws.capture(next));

        function next (result) {
            var elastic = conf('ELASTIC_IP');
            var id = result.Instances[0].InstanceId;
            var tasks = [
                util.format('ec2_create_tag:%s:%s', id, name)
            ];

            if (elastic) {
                tasks.push('ec2_assign_address:' + id);
            }

            grunt.log.ok('Instance requested, initializing...');
            grunt.task.run(tasks);
            done();
        }
    });
};
