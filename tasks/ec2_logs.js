'use strict';

var _ = require('lodash');

module.exports = function(grunt){
    var sshTask = require('./lib/sshTask.js')(grunt);
    var tasks = [
        { name: 'ec2_logs_node', command: 'sudo pm2 flush' },
        { name: 'ec2_logs_nginx_access', command: 'tail -20 /var/log/nginx/access.log' },
        { name: 'ec2_logs_nginx_error', command: 'tail -20 /var/log/nginx/error.log' }
    ];

    _.each(tasks, sshTask.register);
};
