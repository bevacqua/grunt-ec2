'use strict';

var chalk = require('chalk');
var ssh = require('./lib/ssh.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_ssh', 'Establishes an `ssh` connection to the instance, you can emit commands to your EC2 instance', function(name){
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_ssh:name')
            ].join('\n'));
        }

        var done = this.async();

        ssh.connect({ name: name }, function (c) {

            grunt.log.ok('Connection established! Use ctrl+c twice to exit ssh session');

            var allowed = false;
            var interactive = ssh.interactive(c);

            process.stdin.resume();
            process.stdin.on('data', function (data) {
                allowed = false;
                interactive.write(data);
            });

            process.on('SIGINT', function() {
                if (!allowed) {

                    interactive.cancel();

                    process.nextTick(function () {
                        grunt.log.write('\nEnter %s again to exit session\n%s',
                            chalk.red('ctrl+c'),
                            chalk.cyan('» ')
                        );
                        allowed = true;
                    });
                }

                process.once('SIGINT', function() {
                    if (allowed) {
                        allowed = false;
                        grunt.log.writeln();
                        grunt.log.ok('Exiting ssh session...');
                        c.end();
                    }
                });
            });

        }, done);

    });
};
