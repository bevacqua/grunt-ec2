'use strict';

var chalk = require('chalk');
var util = require('util');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2_pagespeed', 'Requests the Google PageSpeed API, prints insights', function (ip) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an IP, or domain.',
                'e.g: ' + chalk.yellow('grunt ec2_pagespeed:ip')
            ].join('\n'));
        }

        var pagespeed = conf('PAGESPEED_ENABLED');
        if (pagespeed) {
            var scheme = conf('SSL_ENABLED') ? 'https' : 'http';
            var url = util.format('%s://%s/', scheme, ip);

            grunt.log.writeln('Enqueued task for PageSpeed insight collection at %s', chalk.magenta(url));

            grunt.config.set('pagespeed.ec2', {
                url: url,
                locale: 'en_US',
                strategy: 'desktop',
                threshold: 80
            });

            grunt.task.run('pagespeed:ec2');
        } else {
            var warning = 'Provide %s, and get PageSpeed insights on every deploy.\nMore info at %s';
            var option = chalk.cyan('"PAGESPEED_API_KEY"');
            var info = chalk.magenta('https://github.com/jrcryer/grunt-pagespeed');
            grunt.log.warn(warning, option, info);
        }
    });
};
