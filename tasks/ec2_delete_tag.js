'use strict';

var chalk = require('chalk');
var exec = require('./lib/exec.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_delete_tag', function(id, name){
        conf.init(grunt);

        if (arguments.length < 2) {
            grunt.fatal([
                'You should provide an id, and the name you want to give to the instance.',
                'e.g: ' + chalk.yellow('grunt ec2_delete_tag:id:name')
            ].join('\n'));
        }

        grunt.log.writeln('Removing EC2 instance name tag %s for %s', chalk.cyan(name), chalk.cyan(id));

        var done = this.async();

        exec('aws ec2 delete-tags --resources %s --tags Key=Name,Value=%s', [id, name], done);
    });
};
