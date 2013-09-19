'use strict';

var _ = require('lodash');
var grunt = require('grunt');
var chalk = require('chalk');
var exec = require('./exec.js');

module.exports = function(name, done){

    grunt.log.writeln('Looking up EC2 instances named %s...', chalk.cyan(name));

    exec('aws ec2 describe-instances --filters Name=tag:Name,Values=%s', [name], parse, true);

    function parse(stdout){
        var result = JSON.parse(stdout);
        var instances = _.pluck(result.Reservations, 'Instances');
        var flat = _.flatten(instances);
        if (flat.length > 1) {
            grunt.fatal('Found more than one instance tagged ' + chalk.magenta(name));
        }

        done(flat[0]);
    }
};
