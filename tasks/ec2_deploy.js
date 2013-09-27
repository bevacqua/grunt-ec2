'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var util = require('util');
var path = require('path');
var ssh = require('./lib/ssh.js');
var conf = require('./lib/conf.js');
var commands = require('./lib/commands.js');
var rsync = require('./lib/rsync.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_deploy', function(name){
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2_deploy:name')
            ].join('\n'));
        }

        var done = this.async();
        var v = grunt.config('pkg.version');
        var settings = {
            name: 'v' + v,
            local: process.cwd(),
            remote: conf('SRV_RSYNC_LATEST')
        };

        rsync(name, settings, deploy);

        function deploy (c) {
            var parent = path.relative(path.dirname(settings.local), settings.local);
            var remoteSync = settings.remote + parent + '/';
            var target = conf('SRV_CURRENT');
            var versions = conf('SRV_VERSIONS');
            var version = conf('SRV_VERSION');
            var dest = util.format(version, v);

            function iif (value, cmd) {
                return conf(value) ? cmd : [];
            }

            var tasks = [[
                util.format('sudo cp -r %s %s', remoteSync, dest),
                util.format('sudo rm -rf `ls -t %s | tail -n +11`', versions),
                util.format('sudo npm --prefix %s install --production', dest),
                util.format('sudo ln -sfn %s %s', dest, target),
                commands.pm2_reload(),
                commands.pm2_start(name)
            ], iif('NGINX_ENABLED', [
                'sudo nginx -s reload'
            ])];

            var cmd = _.flatten(tasks);
            ssh(cmd, name, log.bind(null, c));
        }

        var scheme = conf('SSL_ENABLED') ? 'https' : 'http';

        function log (c) {
            var url = util.format('%s://%s/', scheme, c.ip);
            var text = chalk.magenta(url);
            grunt.log.writeln('You can access the instance via %s on %s', scheme.toUpperCase(), text);
            grunt.log.write('Will flush logs in 5s. ');

            setTimeout(peek, 5000);
        }

        function peek () {
            grunt.log.writeln('Flushing...');

            ssh(['sudo pm2 flush'], name, done);
        }
    });
};
