'use strict';

var chalk = require('chalk');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_delete_tag', 'Deletes the associated name tag for an instance', function (id) {
        conf.init(grunt);

        if (arguments.length < 1) {
            grunt.fatal([
                'You should provide an instance id.',
                'e.g: ' + chalk.yellow('grunt ec2_delete_tag:id')
            ].join('\n'));
        }

        grunt.log.writeln('Removing EC2 instance name tag from %s...', chalk.cyan(id));

        var done = this.async();
        var params = {
            Resources: [id],
            Tags: [{ Key: 'Name' }]
        };

        aws.log('ec2 delete-tags --resources %s --tags Key=Name', id);
        aws.ec2.deleteTags(params, aws.capture('Name tag removed.', done));
    });
};
