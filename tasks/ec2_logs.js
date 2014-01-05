'use strict';

var _ = require('lodash');

module.exports = function (grunt) {
    var sshTask = require('./lib/sshTask.js')(grunt);
    var tasks = [
        { name: 'ec2_logs_node', command: 'sudo pm2 flush', description: 'Gets `pm2` logs' },
        { name: 'ec2_logs_nginx_access', command: 'tail -20 /var/log/nginx/access.log', description: 'Gets `nginx` access logs' },
        { name: 'ec2_logs_nginx_error', command: 'tail -20 /var/log/nginx/error.log', description: 'Gets `nginx` error logs' }
    ];

    _.each(tasks, sshTask.register);
};
