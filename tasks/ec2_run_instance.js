'use strict';

var util = require('util');
var chalk = require('chalk');
var exec = require('./lib/exec.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_run_instance', function(name){
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide a name for the instance.',
                'e.g: ' + chalk.yellow('grunt ec2_run_instance:name')
            ].join('\n'));
        }

        grunt.log.writeln('Launching EC2 %s instance', chalk.cyan(conf('AWS_INSTANCE_TYPE')));

        var done = this.async();

        exec('aws ec2 run-instances --image-id %s --instance-type %s --count %s --key-name %s --security-groups %s', [
            conf('AWS_IMAGE_ID'), conf('AWS_INSTANCE_TYPE'), 1, name, conf('AWS_SECURITY_GROUP')
        ], next, true);

        function next (stdout) {
            var result = JSON.parse(stdout);
            var id = result.Instances[0].InstanceId;
            var tasks = [
                util.format('ec2_create_tag:%s:%s', id, name),
                util.format('ec2_assign_address:%s', id),
            ];

            grunt.task.run(tasks);
            done();
        }
    });
};
