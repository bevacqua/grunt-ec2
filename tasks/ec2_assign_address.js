'use strict';

var chalk = require('chalk');
var exec = require('./lib/exec.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_assign_address', function(id){
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance id.',
                'e.g: ' + chalk.yellow('grunt ec2_assign_address:id')
            ].join('\n'));
        }

        grunt.log.writeln('Allocating Elastic IP Address...');

        var done = this.async();

        exec('aws ec2 allocate-address', [], next, true);

        function next (stdout) {
            var result = JSON.parse(stdout);
            var ip = result.PublicIp;

            grunt.log.writeln('Associating EC2 instance %s to IP %s', chalk.cyan(id), chalk.cyan(ip));

            exec('aws ec2 associate-address --instance-id %s --public-ip %s', [id, ip], done);
        }
    });
};
