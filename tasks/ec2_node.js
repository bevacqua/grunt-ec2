'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var util = require('util');
var sshCredentials = require('./lib/sshCredentials.js');
var ssh = require('./lib/ssh.js');
var conf = require('./lib/conf.js');
var commands = require('./lib/commands.js');

module.exports = function(grunt){

    var tasks = [
        { name: 'ec2_node_list', command: 'sudo pm2 list' },
        { name: 'ec2_node_monit', command: 'sudo pm2 monit' },
        { name: 'ec2_node_reload', command: commands.pm2_reload },
        { name: 'ec2_node_restart', command: 'sudo pm2 restart all' },
        { name: 'ec2_node_start', command: commands.pm2_start },
        { name: 'ec2_node_stop', command: 'sudo pm2 stop all' }
    ];

    _.each(tasks, register);

    function register (task) {

        grunt.registerTask(task.name, function(name){
            conf.init(grunt);

            if (arguments.length === 0) {
                grunt.fatal([
                    'You should provide an instance name.',
                    'e.g: ' + chalk.yellow(util.format('grunt %s:name', task.name))
                ].join('\n'));
            }

            var done = this.async();

            sshCredentials(name, function (c) {

                if (!c) {
                    grunt.fatal('This instance is refusing SSH connections for now');
                }

                var command = typeof task.command === 'string' ?
                    task.command :
                    task.command.call(null, name);

                ssh([command], name, done);
            });
        });
    }
};
