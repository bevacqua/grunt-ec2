'use strict';

var fs = require('fs');
var path = require('path');
var lookup = require('./lookup.js');
var conf = require('./conf.js');
var cache = {};

module.exports = function (name, done) {

    if (name in cache) { // prevent redundant lookups.
        return process.nextTick(function () {
            done(cache[name]);
        });
    }

    lookup(name, function (instance) {
        var keyFile = path.join(conf('SSH_KEYS_FOLDER'), name + '.pem');

        var result = cache[name] = {
            id: instance.InstanceId,
            ip: instance.PublicIpAddress,
            host: instance.PublicDnsName,
            port: 22,
            username: conf('AWS_SSH_USER'),
            privateKeyFile: keyFile,
            privateKey: fs.readFileSync(keyFile)
        };

        if (!result.host) {
            delete cache[name];
        }

        done(cache[name]);
    });
};
