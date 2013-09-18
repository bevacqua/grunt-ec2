'use strict';

var path = require('path');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var exec = require('./lib/exec.js');
var conf = require('./lib/conf.js');
var cwd = process.cwd();

module.exports = function(grunt){

    grunt.registerTask('ec2_create_keypair', function(name){
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide a key pair name.',
                'e.g: ' + chalk.yellow('grunt ec2_create_keypair:name')
            ].join('\n'));
        }

        var done = this.async();
        var absolute = conf('SSH_KEYS_FOLDER');
        var relative = conf('SSH_KEYS_RELATIVE');
        var file = path.join(relative, name + '.pem');
        var pubKey = path.relative(cwd, file + '.pub');

        mkdirp.sync(absolute);

        grunt.log.writeln('Generating key pair named %s...', chalk.cyan(name));

        exec('ssh-keygen -t rsa -b 2048 -N "" -f %s', [file], upload);

        function upload () {

            grunt.log.writeln('Uploading public key %s to EC2...', chalk.cyan(pubKey));

            exec('aws ec2 import-key-pair --public-key-material %s --key-name %s', [
                'file://' + pubKey, name
            ], done);

        }
    });
};
