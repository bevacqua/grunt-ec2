'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');
var prettyprint = require('./lib/prettyprint.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_lookup', 'Gets instance filtered by name tag', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_lookup:name')
            ].join('\n'));
        }

        var done = this.async();
        var params = {
            Filters: [{ Name: 'tag:Name', Values: [name] }]
        };

        grunt.log.writeln('Getting EC2 description for %s instance...', chalk.cyan(name));

        aws.log('ec2 describe-instances --filters Name=tag:Name,Values=%s', name);
        aws.ec2.describeInstances(params, aws.capture(print));

        function print (result) {
            var instances = _.pluck(result.Reservations, 'Instances');
            var flat = _.flatten(instances);

            _.each(flat, prettyprint.instance);

            done();
        }
    });
};
