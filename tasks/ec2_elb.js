'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var util = require('util');
var conf  = require('./lib/conf.js');
var exec  = require('./lib/exec.js');

module.exports = function (grunt) {
    var map = {
        attach: 'register-instances-with-load-balancer',
        detach: 'deregister-instances-from-load-balancer'
    };

    function register (action) {

        var taskName = 'ec2_elb_' + action;
        var capitalized = action[0].toUpperCase() + action.substr(1);
        var description = util.format('%s instances to an AWS ELB load balancer');

        grunt.registerTask(taskName, description, function (name, elb) {
            conf.init(grunt);

            if (arguments.length === 0) {
                grunt.fatal([
                    'You should provide an instance name. ELB name parameter is optional.',
                    'e.g: ' + chalk.yellow(util.format('grunt %s:instance-name:elb-name?', taskName))
                ].join('\n'));
            }

            var balancer = elb || conf('AWS_ELB_NAME');
            var names = _.toArray(arguments);
            var done = this.async();

            grunt.log.writeln('%sing %s instances', capitalized, chalk.cyan(names.join(' ')));

            exec('aws elb %s --load-balancer-name %s --instances %s', [
                map[action], balancer, name
            ], function () {
                grunt.log.writeln('Done! Instance %sed.', action);
                done();
            });
        });
    }

    register('attach');
    register('detach');
};