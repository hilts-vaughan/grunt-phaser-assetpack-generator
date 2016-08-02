/*
 * grunt-phaser-assetpack-generator
 * https://github.com/hilts-vaughan/grunt-phaser-assetpack-generator
 *
 * Copyright (c) 2016 Vaughan Hilts
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  grunt.registerMultiTask('phaser_assetpack_generator', 'This tool helps you generate an asset pack from your filesystem directory, so that you can easily preload all your assets required for your Phaser game.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });

    // TODO: We will need support for custom asset packer handles
    // and the like so that others can prepare things accordingly?

    var processFiles = function(files, destination, processor) {
      var assetJson = {
        assets: []
      }

      files.forEach(function(file) {
        // Skip directories
        if(!grunt.file.isDir(file)) {
          var asset = processor(file, grunt)
          assetJson.assets.push(asset)
        }
      });
      return assetJson
    } // end process files

    // Iterate over all specified file groups.
    this.files.forEach(function(file) {
      var filesGood = file.src.filter(function(filepath) {
          // Remove nonexistent files (it's up to you to filter or warn here).
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          } else {
            return true;
          }
        });


        var processor = file.processor
        // If not a function, then try to load the built-in map
        if(processor != 'function') {
          console.log(file.processor)
          processor = assetHandlerMap[file.processor]
          if(!processor) {
            grunt.fail.warn('A processor must be specified. Use "default" if you want things to be handled without much friction.');
          }
        }

        // Kick off the processing
        var assetJson = processFiles(filesGood, file.dest, processor)

        // Write out the asset json
        grunt.file.write(file.dest, JSON.stringify(assetJson));
    }); // end files

  }); // end multi-task
}; // end exports

var isAudioFile = function(file) {
  var extension = file.substring(file.lastIndexOf('.') + 1)
  if(['mp3', 'ogg', 'm4a'].indexOf(extension) > -1) {
    return true;
  }
  return false;
}

// Each handler returns a JSON of its configuration
var assetHandlerDefault = function(file, grunt) {
    var extension = file.substring(file.lastIndexOf('.') + 1)
    switch(extension) {
      case 'png':
      case 'jpg':
      case 'gif':
        return imageHandler(file)
      case 'mp3':
      case 'ogg':
      case 'm4a':
      case 'mp4':
        return audioHandler(file, grunt)
      case 'txt':
        return textHandler(file)
      case 'json':
        return jsonHandler(file)
      case 'xml':
        return xmlHandler(file)
      default:
        throw new Error('Could not figure out how to handle file: ' + file)
    }
}

var imageHandler = function(file) {
  return {
    type: 'image',
    key: file,
    url: file
  }
}

var audioHandler = function(file, grunt) {
  var urls = [];
  grunt.file.recurse(file.substring(0, file.lastIndexOf('/')), function(audioFile) {
    if(isAudioFile(audioFile)) {
      urls.push(audioFile)
    }
  })
  // TODO: Find a way to merge all the audio together
  return {
    type: 'audio',
    key: file,
    autoDecode: true,
    urls: urls
  }
}

var textHandler = function(file) {
  return {
    type: 'text',
    key: file,
    url: file,
    overwrite: true
  }
}

var jsonHandler = function(file) {
  return {
    type: 'json',
    key: file,
    url: file,
    overwrite: true
  }
}

var xmlHandler = function(file) {
  return {
    type: 'xml',
    key: file,
    url: file,
    overwrite: true
  }
}

// The below is a map of built-in handlers and how they can be used
var assetHandlerMap = {
  default: assetHandlerDefault,
  audio: audioHandler,
  image: imageHandler,
  text: textHandler,
  json: jsonHandler,
  xml: xmlHandler
}

// TODO: How to handle spritesheets? There's a lot of different spritesheet formats
// and things to handle...
// Texture Packer & a custom format might be a good place to start
// bleck... this is good enough for now :)
