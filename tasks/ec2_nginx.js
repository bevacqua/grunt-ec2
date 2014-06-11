'use strict';

var _ = require('lodash');

module.exports = function (grunt) {
    var sshTask = require('./lib/sshTask.js')(grunt);
    var tasks = [
        { name: 'ec2-nginx-reload', command: 'sudo nginx -s reload', description: 'Reloads `nginx`' },
        { name: 'ec2-nginx-restart', command: 'sudo service nginx restart', description: 'Restarts `nginx`' },
        { name: 'ec2-nginx-start', command: 'sudo service nginx start', description: 'Starts `nginx`' },
        { name: 'ec2-nginx-stop', command: 'sudo service nginx stop', description: 'Stops `nginx`' }
    ];

    _.each(tasks, sshTask.register);
};
