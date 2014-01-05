'use strict';

var _ = require('lodash');
var path = require('path');
var util = require('util');
var grunt = require('grunt');
var moment = require('moment');
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

    var defaults = require('../../dat/defaults.json');
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
    df(_, 'RSYNC_EXCLUDE_FROM', '../../dat/defaults.rsyncignore');

    _.SRV_ROOT = util.format('/srv/apps/%s', _.PROJECT_ID);

    _.ENV = _.ENV || {};
    _.RSYNC_EXCLUDES = _.RSYNC_EXCLUDES || [];
    _.RSYNC_INCLUDE_FROM = _.RSYNC_INCLUDE_FROM ? absolute(_.RSYNC_INCLUDE_FROM) : false;
    _.RSYNC_INCLUDES = _.RSYNC_INCLUDES || [];
    _.SRV_CERT = _.SRV_ROOT + '/cert';
    _.SRV_CURRENT = _.SRV_ROOT + '/current';
    _.SRV_RSYNC_CERT = util.format('/srv/rsync/%s/cert', _.PROJECT_ID);
    _.SRV_RSYNC_LATEST = util.format('/srv/rsync/%s/latest', _.PROJECT_ID);
    _.SRV_VERSION = _.SRV_ROOT + '/v/%s';
    _.SRV_VERSIONS = _.SRV_ROOT + '/v';
    _.SSH_KEYS_RELATIVE = relative(_.SSH_KEYS_FOLDER);
    _.VERBOSITY_NPM = verify(_.VERBOSITY_NPM, 'silent win error warn verbose silly'.split(' '), 'info');
    _.VERBOSITY_RSYNC = verify(_.VERBOSITY_RSYNC, 'v vv vvv'.split(' '), '');

    if (_.SSL_ENABLED) {
        _.SSL_CERTIFICATE_DIRECTORY = path.resolve(cwd, _.SSL_CERTIFICATE_DIRECTORY);
        _.NGINX_SSL_CERTIFICATE = path.join(_.SRV_CERT, _.SSL_CERTIFICATE);
        _.NGINX_SSL_CERTIFICATE_KEY = path.join(_.SRV_CERT, _.SSL_CERTIFICATE_KEY);
    }

    moment.defaultFormat = 'Do HH:mm:ss';
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

function verify (option, possible, value) {
    return possible.indexOf(option) !== -1 ? option : value;
}

function relative (to) {
    return path.relative(cwd, to);
}

function absolute (to) {
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
