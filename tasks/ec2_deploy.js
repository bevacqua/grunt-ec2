'use strict';

var chalk = require('chalk');
var util = require('util');
var path = require('path');
var exec = require('./lib/exec.js');
var sshCredentials = require('./lib/sshCredentials.js');
var ssh = require('./lib/ssh.js');
var conf = require('./lib/conf.js');

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

        sshCredentials(name, function (c) {

            if (!c) {
                grunt.fatal('This instance is refusing SSH connections for now');
            }

            var user = conf('AWS_RSYNC_USER');
            var project = conf('PROJECT_ID');
            var local = process.cwd();
            var remote = util.format('/srv/rsync/%s/latest/', project);
            var parent = path.relative(path.dirname(local), local);
            var remoteSync = remote + parent + '/';
            var exclude = conf('RSYNC_IGNORE');
            var excludeFrom = exclude ? util.format('--exclude-from "%s"', exclude) : '';
            var v = grunt.config('pkg.version');

            grunt.log.writeln('Deploying %s to %s using rsync over ssh...', chalk.blue('v' + v), chalk.cyan(c.id));

            exec('rsync -vaz --stats --progress --delete %s -e "ssh -o StrictHostKeyChecking=no -i %s" %s %s@%s:%s', [
                excludeFrom, c.privateKeyFile, local, user, c.host, remote
            ], deploy);

            var root = util.format('/srv/apps/%s', project);
            var env = {
                NODE_ENV: name
            };

            function deploy () {
                var dest = util.format('%s/v/%s', root, v);
                var target = root + '/current';
                var commands = [
                    util.format('sudo cp -r %s %s', remoteSync, dest),
                    util.format('sudo rm -rf `ls -t %s | tail -n +11`', root + '/v'),
                    util.format('sudo npm --prefix %s install --production', dest),
                    util.format('sudo ln -sfn %s %s', dest, target), [
                        util.format('sudo %s pm2 start %s/%s -i 2 --name %s', env, target, conf('NODE_SCRIPT'), name),
                        'sudo pm2 reload all'
                    ].join(' || ') // start or reload
                ];
                ssh(commands, name, done);
            }
        });

    });
};
