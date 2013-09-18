'use strict';

var _ = require('lodash');
var fs = require('fs');
var grunt = require('grunt');

function Config () {
}

Config.prototype.init = function (grunt) {
    if (this._ !== void 0) {
        return; // can't change after init
    }
    this._ = _.clone(process.env, true);

    grunt.config.requires('ec2');
    grunt.config.requires('pkg.version');

    _.assign(this._, require('../../cfg/defaults.json'), grunt.config('ec2'));

    this.resolve();

    Object.freeze(this._);
};

Config.prototype.resolve = function () {
    if (this._.PROJECT_ID == void 0) {
        this._.PROJECT_ID = 'ec2';
    }

    if (this._.NODE_SCRIPT === void 0) {
        this._.NODE_SCRIPT = 'app.js';
    }

    if (this._.SSH_KEYS_FOLDER == void 0) {
        this._.SSH_KEYS_FOLDER = path.resolve(__dirname, '../../private');
    } else {
        this._.SSH_KEYS_FOLDER = path.join(process.cwd(), this._.SSH_KEYS_FOLDER);
    }

    this._.SSH_KEYS_RELATIVE = path.relative(process.cwd(), this._.SSH_KEYS_FOLDER);
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