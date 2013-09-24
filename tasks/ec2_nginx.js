'use strict';

var _ = require('lodash');

module.exports = function(grunt){
    var sshTask = require('./lib/sshTask.js')(grunt);
    var tasks = [
        { name: 'ec2_nginx_reload', command: 'sudo nginx -s reload' },
        { name: 'ec2_nginx_restart', command: 'sudo service nginx restart' },
        { name: 'ec2_nginx_start', command: 'sudo service nginx start' },
        { name: 'ec2_nginx_stop', command: 'sudo service nginx stop' }
    ];

    _.each(tasks, sshTask.register);
};
