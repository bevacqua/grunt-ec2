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

            grunt.log.ok('Connection established! Use ctrl+c to exit ssh session');

            process.stdin.resume();

            process.stdin.on('data', function (command) {
                ssh.exec(c, command, { fatal: false }, function () {
                    grunt.verbose.writeln(
                        chalk.underline(chalk.yellow('[ssh]')),
                        chalk.magenta(command),
                        'completed successfully'
                    );
                });
            });

            process.stdin.on('end', function () {
                grunt.log.ok('(end) Exiting ssh session...');
                c.end();
            });

            process.on('SIGINT', function() {
                grunt.log.ok('(sigint) Exiting ssh session...');
                c.end();
            });

        }, done);

    });
};
