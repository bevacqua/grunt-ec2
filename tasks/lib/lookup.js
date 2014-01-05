'use strict';

var _ = require('lodash');
var grunt = require('grunt');
var chalk = require('chalk');
var aws = require('./aws.js');

module.exports = function (name, done) {

    var params = {
        Filters: [{ Name: 'tag:Name', Values: [name] }]
    };

    grunt.log.writeln('Looking up EC2 instances named %s...', chalk.cyan(name));

    aws.log('ec2 describe-instances --filters Name=tag:Name,Values=%s', name);
    aws.ec2.describeInstances(params, aws.capture(parse));

    function parse (result) {
        var instances = _.pluck(result.Reservations, 'Instances');
        var flat = _.flatten(instances);
        if (flat.length > 1) {
            grunt.fatal('Found more than one instance tagged ' + chalk.magenta(name));
        } else if (flat.length === 0) {
            grunt.fatal('There are no instances tagged ' + chalk.magenta(name));
        }

        done(flat[0]);
    }
};
