'use strict';

var _ = require('lodash');
var commands = require('./lib/commands.js');
var sshTask = require('./lib/sshTask.js');

module.exports = function(grunt){

    var tasks = [
        { name: 'ec2_node_list', command: 'sudo pm2 list' },
        { name: 'ec2_node_monit', command: 'sudo pm2 monit' },
        { name: 'ec2_node_reload', command: commands.pm2_reload },
        { name: 'ec2_node_restart', command: 'sudo pm2 restart all' },
        { name: 'ec2_node_start', command: commands.pm2_start },
        { name: 'ec2_node_stop', command: 'sudo pm2 stop all' }
    ];

    _.each(tasks, sshTask.register);
};
