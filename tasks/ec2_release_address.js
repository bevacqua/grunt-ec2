'use strict';

var chalk = require('chalk');
var exec = require('./lib/exec.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_release_address', 'Releases an IP address', function(ip){
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide the IP.',
                'e.g: ' + chalk.yellow('grunt ec2_release_address:ip')
            ].join('\n'));
        }

        grunt.log.writeln('Releasing Elastic IP Address %s...', chalk.red(ip));

        var done = this.async();

        exec('aws ec2 release-address --public-ip %s', [ip], done);
    });
};
