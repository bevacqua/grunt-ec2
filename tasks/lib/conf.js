'use strict';

var _ = require('lodash');
var path = require('path');
var grunt = require('grunt');
var cwd = process.cwd();

function Config () {
}

Config.prototype.init = function (grunt) {
    if (this._ !== void 0) {
        return; // can't change after init
    }
    this._ = _.clone(process.env, true);

    grunt.config.requires('ec2');
    grunt.config.requires('pkg.version');

    var defaults = require('../../cfg/defaults.json');
    var user = grunt.config('ec2');

    if (typeof user === 'string') {
        user = grunt.file.readJSON(user);
    }

    _.assign(this._, defaults, user);

    this.defaults();

    Object.freeze(this._);
};

Config.prototype.defaults = function () {
    var _ = this._;

    d(_, 'PROJECT_ID', 'ec2');
    d(_, 'NODE_SCRIPT', 'app.js');

    df(_, 'SSH_KEYS_FOLDER', '../../private');
    df(_, 'RSYNC_IGNORE', '../../cfg/.rsyncignore');

    _.SSH_KEYS_RELATIVE = relative(_.SSH_KEYS_FOLDER);

    var srv = util.format('/srv/apps/%s/current', _.PROJECT_ID);

    if (_.SSL_ENABLED) {
        _.SSL_CERTIFICATE = path.join(srv, _.SSL_CERTIFICATE);
        _.SSL_CERTIFICATE_KEY = path.join(srv, _.SSL_CERTIFICATE_KEY);
    }
};

function d (_, key, value) {
    if (_[key] === void 0) {
        _[key] = value;
    }
}

function df (_, key, value) {
    if (_[key] === void 0) {
        _[key] = path.resolve(__dirname, value);
    } else {
        _[key] = absolute(_[key]);
    }
}

function relative(to) {
    return path.relative(cwd, to);
}

function absolute(to) {
    return path.join(cwd, to);
}

Config.prototype.get = function (key) {
    if (this._ === void 0) {
        grunt.fatal('Attempted to get configuration value before initializing.');
    }

    if (key === void 0) {
        return this._;
    }

    return this._[key];
};

var config = new Config();

module.exports = Config.prototype.get.bind(config);
module.exports.init = Config.prototype.init.bind(config);