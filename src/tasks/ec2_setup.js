'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var ssh = require('./lib/ssh.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_setup', function(name){
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_setup:name')
            ].join('\n'));
        }

        // TODO nginx server, rsync user, node user, [nginx user?]
        var done = this.async();
        var project = conf('PROJECT_ID');
        var tasks = [[ // rsync
            util.format('sudo mkdir -p /srv/rsync/%s/latest', project),
            util.format('sudo mkdir -p /srv/apps/%s/v', project),
            util.format('sudo chown ubuntu /srv/rsync/%s/latest', project)
        ], [ // node.js
            'sudo apt-get install python-software-properties',
            'sudo add-apt-repository ppa:chris-lea/node.js -y',
            'sudo apt-get update',
            'sudo apt-get install nodejs -y'
        ], [ // pm2
            'sudo apt-get install make g++ -y',
            'sudo npm install -g pm2',
            'sudo pm2 startup'
        ]];

        var commands = _.flatten(tasks);
        ssh(commands, name, done);
    });
};
