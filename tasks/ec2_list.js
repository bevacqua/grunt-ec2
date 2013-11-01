'use strict';

var chalk = require('chalk');
var exec = require('./lib/exec.js');
var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_list', 'Lists instances filtered by state. Defaults to `running` filter, use `all` to disable filter', function(state){
        conf.init(grunt);

        var done = this.async();
        var defaultState = 'running';
        var value = state === 'all' ? '' : state || defaultState;
        var filter = value ? ' --filters Name=instance-state-name,Values=' + value : '';

        grunt.log.writeln('Getting EC2 instances filtered by %s state...', chalk.cyan(value || 'any'));

        exec('aws ec2 describe-instances' + filter, [], done);
    });
};
