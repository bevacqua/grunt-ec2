'use strict';

module.exports = function (grunt) {
    grunt.loadTasks('src/tasks');

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            everything: ['src/**/*.js', 'Gruntfile.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('default', ['jshint']);
};