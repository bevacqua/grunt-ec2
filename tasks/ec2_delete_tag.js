'use strict';

var chalk = require('chalk');
var exec = require('./lib/exec.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_delete_tag', function(id, name){
        conf.init(grunt);

        if (arguments.length < 2) {
            grunt.fatal([
                'You should provide an instance id.',
                'e.g: ' + chalk.yellow('grunt ec2_delete_tag:id')
            ].join('\n'));
        }

        grunt.log.writeln('Removing EC2 instance name tag from %s...', chalk.cyan(id));

        var done = this.async();

        exec('aws ec2 delete-tags --resources %s --tags Key=Name', [id], done);
    });
};
