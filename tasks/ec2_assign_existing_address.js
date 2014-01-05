'use strict';

var chalk = require('chalk');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_assign_existing_address', function (id,ip) {
        conf.init(grunt);

        if (arguments.length < 2) {
            grunt.fatal([
                'You should provide an instance id and the IP you want to assign to it.',
                'e.g: ' + chalk.yellow('grunt ec2_assign_existing_address:id:ip')
            ].join('\n'));
        }

        grunt.log.writeln('Associating EC2 instance %s to IP %s', chalk.cyan(id), chalk.cyan(ip));

        var done = this.async();
        var params = {
            InstanceId: id,
            PublicIp: ip
        };

        aws.log('ec2 associate-address --instance-id %s --public-ip %s', id, ip);
        aws.ec2.associateAddress(params, aws.capture('Instance associated with public IP.', done));
    });
};
