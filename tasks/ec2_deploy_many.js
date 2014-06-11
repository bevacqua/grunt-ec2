'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2-deploy-many', 'Deploys multiple Instances', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2-deploy-many:name')
            ].join('\n'));
        }

        var done = this.async();
        var params = {
            Filters: [{ Name: 'tag:Name', Values: [name] }]
        };

        grunt.log.writeln('Getting EC2 description for %s instance...', chalk.cyan(name));

        aws.log('ec2 describe-instances --filters Name=tag:Name,Values=%s', name);
        aws.ec2.describeInstances(params, aws.capture(function (result) {
            var instances = _.pluck(result.Reservations, 'Instances');
            var flat = _.flatten(instances);

            var instanceNames = [];
            for (var i = 0; i < flat.length; i++) {
                instanceNames.push(flat[i]['Tags'][0]['Value']);
            }

            grunt.log.writeln('Deploying to instances: %s', chalk.cyan(instanceNames));

            for (var j = 0; j < instanceNames.length; j++) {
                grunt.task.run('ec2-deploy:' + instanceNames[i]);
            }

            done();
        }));
    });
};
