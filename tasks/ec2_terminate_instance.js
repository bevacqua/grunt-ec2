'use strict';

var chalk = require('chalk');
var exec = require('./lib/exec.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_terminate_instance', 'Terminates an instance', function(id){
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance id.',
                'e.g: ' + chalk.yellow('grunt ec2_terminate_instance:id')
            ].join('\n'));
        }

        grunt.log.writeln('Shutting down EC2 instance %s...', chalk.red(id));

        var done = this.async();

        exec('aws ec2 terminate-instances --instance-ids %s', [id], done);
    });
};
