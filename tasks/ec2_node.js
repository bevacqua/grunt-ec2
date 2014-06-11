'use strict';

var _ = require('lodash');
var commands = require('./lib/commands.js');

module.exports = function (grunt) {
    var sshTask = require('./lib/sshTask.js')(grunt);
    var tasks = [
        { name: 'ec2-pm2-update', command: 'sudo npm update -g pm2', description: 'Updates pm2 to latest' },
        { name: 'ec2-node-list', command: 'sudo pm2 list', description: 'Returns output for `pm2 list`' },
        { name: 'ec2-node-monit', command: 'sudo pm2 monit', description: 'Runs `pm2 monit`' },
        { name: 'ec2-node-reload', command: commands.pm2_reload, description: 'Reloads app using `pm2 reload all`' },
        { name: 'ec2-node-restart', command: 'sudo pm2 restart all', description: 'Restarts app using `pm2 restart all`' },
        { name: 'ec2-node-start', command: commands.pm2_start, description: 'Starts app using parameterized `pm2 start`' },
        { name: 'ec2-node-stop', command: 'sudo pm2 stop all', description: 'Stops app using `pm2 stop all`' }
    ];

    _.each(tasks, sshTask.register);
};
