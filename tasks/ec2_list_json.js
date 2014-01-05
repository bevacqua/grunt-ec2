'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_list_json', 'Lists instances filtered by state. Defaults to `running` filter, use `all` to disable filter. Prints JSON results', function (state) {
        conf.init(grunt);

        var done = this.async();
        var value = state === 'all' ? false : state || 'running';
        var filter = value ? ' --filters Name=instance-state-name,Values=' + value : '';
        var params = !value ? {} : {
            Filters: [{ Name: 'instance-state-name', Values: [value] }]
        };

        grunt.log.writeln('Getting EC2 instances filtered by %s state...', chalk.cyan(value || 'any'));

        aws.log('ec2 describe-instances' + filter);
        aws.ec2.describeInstances(params, aws.capture(function (result) {
            var instances = _.pluck(result.Reservations, 'Instances');
            var flat = _.flatten(instances);

            grunt.log.ok('Found %s EC2 Instance(s)', flat.length);

            console.log(JSON.stringify(flat, null, 2));

            done();
        }));
    });
};
