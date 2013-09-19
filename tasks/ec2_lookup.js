'use strict';

var chalk = require('chalk');
var exec = require('./lib/exec.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_lookup', function(name){
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_lookup:name')
            ].join('\n'));
        }

        var done = this.async();

        grunt.log.writeln('Getting EC2 description for %s instance...', chalk.cyan(name));

        exec('aws ec2 describe-instances --filters Name=tag:Name,Values=%s', [name], done);
    });
};
