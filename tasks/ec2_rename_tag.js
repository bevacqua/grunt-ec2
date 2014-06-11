'use strict';

var chalk = require('chalk');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');
var lookup = require('./lib/lookup.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2-rename-tag', 'Renames the associated name tag for an instance', function (old, replacement) {
        conf.init(grunt);

        if (arguments.length < 2) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2-rename-tag:old:replacement')
            ].join('\n'));
        }

        grunt.log.writeln('Renaming EC2 instance %s to %s', chalk.cyan(old), chalk.cyan(replacement));

        var done = this.async();

        lookup(old, function (instance) {
            var id = instance.InstanceId;

            var params = {
                Resources: [id],
                Tags: [{ Key: 'Name', Value: replacement }]
            };

            aws.log('ec2 create-tags --resources %s --tags Key=Name,Value=%s', id, replacement);
            aws.ec2.createTags(params, aws.capture('Instance tagged as %s', replacement, done));
        });


    });
};
