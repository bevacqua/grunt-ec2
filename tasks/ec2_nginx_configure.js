'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var chalk = require('chalk');
var mustache = require('mustache');
var conf = require('./lib/conf.js');
var workflow = require('./lib/workflow.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_nginx_configure', 'Installs `nginx` if necessary, updates its configuration files', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_nginx_configure:name')
            ].join('\n'));
        }

        var done = this.async();

        function nginxTemplate (name, where) {
            var remote = util.format('%s/%s.conf', conf('SRV_ROOT'), name);
            var local = path.resolve(__dirname, util.format('../dat/%s.conf', name));
            var template = fs.readFileSync(local, { encoding: 'utf8' });
            var data = mustache.render(template, conf());
            var escaped = data
                .replace(/"/g, '\\"')
                .replace(/\$/g, '\\$');

            return [
                util.format('sudo touch %s', remote),
                util.format('sudo chown ubuntu %s', remote),
                util.format('sudo ln -sfn %s /etc/nginx/%s.conf', remote, where),
                util.format('echo "%s" > %s', escaped, remote)
            ];
        }

        function nginxConf () {
            var project = conf('PROJECT_ID');

            return [
                workflow.if_has('SSL_ENABLED', [ // ssl enabled
                    'sudo add-apt-repository ppa:chris-lea/nginx-devel -y',
                    'sudo apt-get update',
                    'sudo apt-get install nginx nginx-common nginx-full -y',
                ]),
                workflow.if_not('SSL_ENABLED', [ // ssl disabled
                    'sudo apt-get update',
                    'sudo apt-get install nginx -y',
                ]),
                nginxTemplate('http', 'nginx'),
                nginxTemplate('server', 'sites-enabled/' + project),
                'sudo nginx -s reload || sudo service nginx start || (cat /var/log/nginx/error.log && exit 1)'
            ];
        }

        var enabled = conf('NGINX_ENABLED');
        if (enabled) {
            grunt.log.writeln('Configuring %s server...', chalk.cyan('nginx'));

            workflow([nginxConf()], { name: name }, done);

        } else {
            grunt.log.writeln('%s server is disabled, skipping.', chalk.cyan('nginx'));
            done();
        }
    });
};
