'use strict';

var chalk = require('chalk');
var ssh = require('./lib/ssh.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_ssh_text', 'Establishes an `ssh` connection to the instance, letting you work on it directly', function(name){
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_ssh:name')
            ].join('\n'));
        }

        var done = this.async();

        ssh.prepare({ name: name }, function (c) {

            grunt.log.ok('Connection established!');

        }, done);

    });
};
