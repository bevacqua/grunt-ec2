'use strict';

var grunt = require('grunt');
var chalk = require('chalk');
var util = require('util');
var exec = require('./exec.js');
var conf = require('./conf.js');
var sshCredentials = require('./sshCredentials.js');

module.exports = function(name, opts, done){

    sshCredentials(name, function (c) {

        if (!c) {
            grunt.fatal('This instance is refusing SSH connections for now');
        }

        var verbosity = conf('VERBOSITY_RSYNC');
        var user = conf('AWS_RSYNC_USER');
        var include = clud(opts.includes, 'include');
        var includeFrom = cludFrom(opts.includeFrom, 'include');
        var exclude = clud(opts.excludes, 'exclude');
        var excludeFrom = cludFrom(opts.excludeFrom, 'exclude');

        grunt.log.writeln('Deploying %s to %s using rsync over ssh...', chalk.blue(opts.name), chalk.cyan(c.id));

        var args = ['a', 'z'];
        var eo = {};

        if (verbosity) {
            eo.buffer = 20000 * 1024;
            args.push(verbosity);
        }

        exec('rsync -%s --stats --delete %s -e "ssh -o StrictHostKeyChecking=no -i %s" %s %s@%s:%s', [
            args.join(''),
            include + includeFrom + exclude + excludeFrom,
            c.privateKeyFile,
            opts.local,
            user,
            c.host,
            opts.remote
        ], eo, done);

    });

    function clud (option, type) {

        if (option) {

            return option.map(function (pattern) {
                return util.format(' --%s "%s"', type, pattern);
            }).join('');
        }

        return '';
    }

    function cludFrom (file, type) {

        if (file) {
            return util.format(' --%s-from "%s"', type, file);
        }

        return '';
    }
};
