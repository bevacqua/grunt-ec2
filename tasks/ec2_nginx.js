'use strict';

var _ = require('lodash');

module.exports = function(grunt){
    var sshTask = require('./lib/sshTask.js')(grunt);
    var tasks = [
        { name: 'ec2_nginx_reload', command: 'sudo nginx -s reload' },
        { name: 'ec2_nginx_restart', command: 'sudo nginx -s restart' },
        { name: 'ec2_nginx_start', command: 'sudo nginx -s start' },
        { name: 'ec2_nginx_stop', command: 'sudo nginx -s stop' }
    ];

    _.each(tasks, sshTask.register);
};
