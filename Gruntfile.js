'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            everything: ['tasks/**/*.js', 'Gruntfile.js']
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('ci', ['jshint']);

};