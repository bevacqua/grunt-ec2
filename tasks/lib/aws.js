var _ = require('lodash');
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
    capture: function (then) {
        return function (err) {
            if (err) {
                return grunt.fatal([
                    'Request to the AWS API failed with an error.',
                    err.stack || err
                ].join('\n'));
            }
            then.apply(null, _.toArray(arguments).slice(1));
        };
    }
};
