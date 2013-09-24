'use strict';

var _ = require('lodash');
var commands = require('./lib/commands.js');
var sshTask = require('./lib/sshTask.js');

module.exports = function(grunt){

    var tasks = [
        { name: 'ec2_logs_node', command: 'sudo pm2 flush' },
        { name: 'ec2_logs_nginx', command: 'sudo pm2 monit' }
    ];

    _.each(tasks, sshTask.register);
};
