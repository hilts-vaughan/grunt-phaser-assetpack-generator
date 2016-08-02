/*
 * grunt-phaser-assetpack-generator
 * https://github.com/hilts-vaughan/grunt-phaser-assetpack-generator
 *
 * Copyright (c) 2016 Vaughan Hilts
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    phaser_assetpack_generator: {
      default: {
        files: [
          {
            src: ['assets/**'],
            dest: ['tmp/assets.json'],
            processor: 'default'
          }
        ]
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('default', ['clean', 'phaser_assetpack_generator']);
};
