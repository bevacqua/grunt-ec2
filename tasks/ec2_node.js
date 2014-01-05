'use strict';

var _ = require('lodash');
var commands = require('./lib/commands.js');

module.exports = function (grunt) {
    var sshTask = require('./lib/sshTask.js')(grunt);
    var tasks = [
        { name: 'ec2_node_list', command: 'sudo pm2 list', description: 'Returns output for `pm2 list`' },
        { name: 'ec2_node_monit', command: 'sudo pm2 monit', description: 'Runs `pm2 monit`' },
        { name: 'ec2_node_reload', command: commands.pm2_reload, description: 'Reloads app using `pm2 reload all`' },
        { name: 'ec2_node_restart', command: 'sudo pm2 restart all', description: 'Restarts app using `pm2 restart all`' },
        { name: 'ec2_node_start', command: commands.pm2_start, description: 'Starts app using parameterized `pm2 start`' },
        { name: 'ec2_node_stop', command: 'sudo pm2 stop all', description: 'Stops app using `pm2 stop all`' }
    ];

    _.each(tasks, sshTask.register);
};
