'use strict';

var chalk = require('chalk');
var util = require('util');
var sshCredentials = require('./sshCredentials.js');
var ssh = require('./ssh.js');
var conf = require('./conf.js');

module.exports = function (grunt) {
    return {
        register: function (task) {

            grunt.registerTask(task.name, task.description, function (name) {
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

                    ssh([command], { name: name }, done);
                });
            });
        }
    };
};
