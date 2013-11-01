'use strict';

var chalk = require('chalk');
var exec = require('./lib/exec.js');
var lookup = require('./lib/lookup.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_reboot', 'Reboots the EC2 instance', function(name){
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

            grunt.log.writeln('Rebooting EC2 instance %s...', chalk.magenta(id));
            exec('aws ec2 reboot-instances --instance-ids %s', [id], done);
        });
    });
};
