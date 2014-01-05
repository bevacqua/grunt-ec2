'use strict';

var async = require('async');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var exec = require('./lib/exec.js');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');
var cwd = process.cwd();

module.exports = function (grunt) {

    grunt.registerTask('ec2_create_keypair', 'Generates an RSA key pair and uploads the public key to AWS', function (name) {
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
        var pubKeyFile = path.relative(cwd, file + '.pub');
        var pubKey;

        mkdirp.sync(absolute);

        grunt.log.writeln('Generating key pair named %s...', chalk.cyan(name));

        async.series([
            async.apply(exec, 'ssh-keygen -t rsa -b 2048 -N "" -f %s', [file]),
            async.apply(load),
            async.apply(upload)
        ], done);

        function load (next) {
            fs.readFile(pubKeyFile, function (err, data) {
                pubKey = data.toString('base64');
                next(err);
            });
        }

        function upload (next) {

            grunt.log.writeln('Uploading public key %s to EC2...', chalk.cyan(pubKeyFile));

            var params = {
                PublicKeyMaterial: pubKey,
                KeyName: name
            };

            aws.log('ec2 import-key-pair --public-key-material %s --key-name %s', 'file://' + pubKeyFile, name);
            aws.ec2.importKeyPair(params, aws.capture('Upload successful.', next));
        }
    });
};
