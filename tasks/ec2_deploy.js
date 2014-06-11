'use strict';

var chalk = require('chalk');
var util = require('util');
var conf = require('./lib/conf.js');
var commands = require('./lib/commands.js');
var workflow = require('./lib/workflow.js');
var ssh = require('./lib/ssh.js');
var sshCredentials = require('./lib/sshCredentials.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2-deploy', 'Deploys to the instance using `rsync`, reloads `pm2` and `nginx`', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2-deploy:name')
            ].join('\n'));
        }

        var done = this.async();
        var target = conf('SRV_CURRENT');
        var versions = conf('SRV_VERSIONS');
        var version = conf('SRV_VERSION');
        var v = grunt.config('pkg.version');
        var dest = util.format(version, v);
        var local = '.';

        var rsync = {
            name: 'v' + v,
            local: local,
            remote: conf('SRV_RSYNC_LATEST'),
            dest: dest,
            includes: conf('RSYNC_INCLUDES').map(env),
            includeFrom: conf('RSYNC_INCLUDE_FROM'),
            excludes: conf('RSYNC_EXCLUDES').map(env),
            excludeFrom: conf('RSYNC_EXCLUDE_FROM')
        };

        function env (pattern) {
            return pattern.replace('%NODE_ENV%', name);
        }

        var verbosity = conf('VERBOSITY_NPM');
        var steps = [{
            rsync: rsync
        }, [
            util.format('sudo rm -rf `ls -t %s | tail -n +11`', versions)
        ], workflow.if_not('NPM_INSTALL_DISABLED', [
            util.format('sudo npm --prefix %s install --production --loglevel %s', dest, verbosity)
        ]), workflow.if_has('NPM_REBUILD', [
            'sudo npm rebuild'
        ]), [
            util.format('sudo ln -sfn %s %s', dest, target),
            commands.pm2_reload(),
            commands.pm2_start(name)
        ], workflow.if_has('NGINX_ENABLED', [
            'sudo nginx -s reload'
        ])];

        workflow(steps, { name: name }, function () {
            sshCredentials(name, function (c) {
                log(c);
            });
        });

        var scheme = conf('SSL_ENABLED') ? 'https' : 'http';

        function log (c) {
            var url = util.format('%s://%s/', scheme, c.ip);
            var text = chalk.magenta(url);

            grunt.task.run('ec2-pagespeed:' + c.ip);

            grunt.log.writeln('You can access the instance via %s on %s', scheme.toUpperCase(), text);
            grunt.log.write('Will tail nginx error logs and flush pm2 logs in 5s.');

            setTimeout(peek, 5000);
        }

        function peek () {
            grunt.log.writeln('Flushing...');

            var commands = [
                'sudo pm2 flush',
                'sudo pm2 list'
            ];

            if (conf('NGINX_ENABLED')) {
                commands.unshift('tail -3 /var/log/nginx/error.log');
            }

            ssh(commands, { name: name }, done);
        }
    });
};
