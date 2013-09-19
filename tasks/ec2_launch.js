'use strict';

var conf = require('./lib/conf.js');

module.exports = function(grunt){

    grunt.registerTask('ec2_launch', function(name){
        conf.init(grunt);

        grunt.task.run([
            'ec2_create_keypair:' + name,
            'ec2_run_instance:' + name,
            'ec2_wait:' + name,
            'ec2_setup:' + name
        ]);
    });
};
