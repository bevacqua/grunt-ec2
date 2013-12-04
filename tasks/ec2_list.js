'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var exec = require('./lib/exec.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_list', 'Lists instances filtered by state. Defaults to `running` filter, use `all` to disable filter', function(state){
        conf.init(grunt);

        var done = this.async();
        var defaultState = 'running';
        var value = state === 'all' ? '' : state || defaultState;
        var filter = value ? ' --filters Name=instance-state-name,Values=' + value : '';
        var colorState = {
            pending: 'blue',
            running: 'green',
            stopping: 'yellow',
            stopped: 'magenta',
            'shutting-down': 'yellow',
            terminated: 'red'
        }

        grunt.log.writeln('Getting EC2 instances filtered by %s state...', chalk.cyan(value || 'any'));

        exec('aws ec2 describe-instances', [], { pipe: false }, function (stdout) {
            var result = JSON.parse(stdout);
            var instances = _.pluck(result.Reservations, 'Instances');
            var flat = _.flatten(instances);

            console.log('Found %s EC2 Instance(s)', flat.length);

            _.each(flat, function (instance) {
                console.log('%s %s (%s) [%s] on %s',
                    chalk.magenta(instance.InstanceId),
                    chalk.magenta(instance.ImageId),
                    chalk[colorState[instance.State.Name]](instance.State.Name),
                    chalk.cyan(instance.KeyName),
                    chalk.underline(instance.PublicIpAddress)
                );
            });

            done();
        });

    });
};