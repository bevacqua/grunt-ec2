'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var util = require('util');
var path = require('path');
var exec = require('./lib/exec.js');
var sshCredentials = require('./lib/sshCredentials.js');
var ssh = require('./lib/ssh.js');
var parse = require('./lib/parse.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_version', function(name){
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_version:name')
            ].join('\n'));
        }

        var done = this.async();

        sshCredentials(name, function (c) {

            if (!c) {
                grunt.fatal('This instance is refusing SSH connections for now');
            }

            grunt.log.writeln('Querying %s to get current version number over ssh...', chalk.cyan(c.id));

            var project = conf('PROJECT_ID');
            var commands = [
                util.format('readlink -f /srv/apps/%s/current | sed -e "s/.*v\///"', project)
            ];

            ssh(commands, name, done);
        });
    });
};
