'use strict';

var util = require('util');
var chalk = require('chalk');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_assign_address', 'Allocates an IP and assigns it to your instance', function (id) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance id.',
                'e.g: ' + chalk.yellow('grunt ec2_assign_address:id')
            ].join('\n'));
        }

        grunt.log.writeln('Allocating Elastic IP Address...');

        var done = this.async();

        aws.log('ec2 allocate-address');
        aws.ec2.allocateAddress({}, aws.capture(assign));

        function assign (result) {
            var ip = result.PublicIp;
            var assignment = util.format('ec2_assign_existing_address:%s:%s', id, ip);

            grunt.log.ok('Allocated IP address %s', chalk.cyan(ip));
            grunt.task.run(assignment);
            done();
        }
    });
};
