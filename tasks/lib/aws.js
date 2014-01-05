'use strict';

var _ = require('lodash');
var util = require('util');
var chalk = require('chalk');
var grunt = require('grunt');
var AWS = require('aws-sdk');
var conf = require('./conf.js');
var configured;
var components = {};

function configure () {

    if (configured) { return; }

    configured = true;

    var credentials = {
        accessKeyId: conf('AWS_ACCESS_KEY_ID'),
        secretAccessKey: conf('AWS_SECRET_ACCESS_KEY'),
        region: conf('AWS_DEFAULT_REGION')
    };
    AWS.config.update(credentials);
}

function fetch (service) {

    configure();

    if (!components[service]) {
        components[service] = new AWS[service]();
    }
    return components[service];
}

module.exports = {
    get ec2 () { return fetch('EC2'); },
    get elb () { return fetch('ELB'); },
    log: function () {
        var command = util.format.apply(null, _.toArray(arguments));
        grunt.log.writeln(chalk.underline.yellow('[aws]'), chalk.magenta(command));
    },
    capture: function () {
        var args = _.toArray(arguments);
        var then = args.pop();

        return function (err) {
            if (err) {
                return grunt.fatal([
                    'Request to the AWS API failed with an error.',
                    err.stack || err
                ].join('\n'));
            }
            if (args.length) {
                grunt.log.ok(util.format.apply(null, args));
            }
            then.apply(null, _.toArray(arguments).slice(1));
        };
    }
};
