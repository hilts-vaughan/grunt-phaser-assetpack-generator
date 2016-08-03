var xml2js = require('xml2js')
var fs = require('fs');
var path = require('path')
var spawnSync = require('child_process').spawnSync;

//  WARNING:
//    This code was written in a hacky, messy way to support just my use-case.
//    It can be used as-is. I accept PRs to clean this up. :)

/**
 * This module is used first and foremost for processing assets from a TMX
 * file and allows you to pre-process them as part of your pipleline and get
 * them into a format that is acceptable for Phaser.
 * @param  {string} file    The filename that is being parsed currently
 * @param  {grunt} grunt    The grunt object
 * @return {[object]}       A set of items to be loaded, if required
 */
exports.tileMapHandler = function(file, grunt) {
  var tiledMapContents = fs.readFileSync(file, 'utf8');
  var parser = new xml2js.Parser();
  var parseComplete = false;
  var tileMapObject = null;

  parser.parseString(tiledMapContents, function(err, result) {
      tileMapObject = result.map;
      parseComplete = true;
  });

  while(!parseComplete) {
    // TODO: Spinlock is evil... make handlers able to be async
  }

  var tilesetObject = tileMapObject.tileset[0]['$']
  var tilesetPath = tilesetObject.source

  var xmlContent = fs.readFileSync(path.join(path.dirname(file), tilesetPath), 'utf8');
  var tilesetObjectNew = null;
  parser.parseString(xmlContent, function(err, result) {
      if(err) {
        throw new Error(err);
      }
      tilesetObjectNew = result;
  });

  while(!tilesetObjectNew) {
    // TODO: Spinlock evil... :(
  }

  exportTmxToJson(file);

  var newJsonMap = JSON.parse(fs.readFileSync(file.replace('tmx', 'json')))
  var tilesetProperties = tilesetObjectNew.tileset['$'];
  var imageProperties =  tilesetObjectNew.tileset.image[0]['$']

  var normalizedPath = path.join(path.dirname(tilesetPath), imageProperties.source)

  var newTileset = {
    name: tilesetProperties.name,
    firstgid: 1,
    image: normalizedPath,
    tilewidth: tilesetProperties.tilewidth,
    tileheight: tilesetProperties.tileheight,
    imageheight: imageProperties.height,
    imagewidth: imageProperties.width,
    margin: 0, // TODO; No need to implement this?
    spacing: 0, // TODO: No need to implement this?
    properties: {} // TODO: Need to implement property copying over...
                   // maybe the Tiled CLI can help with this at some point.
  }

  newJsonMap.tilesets = [newTileset]
  fs.writeFileSync(file.replace('tmx', 'json'), JSON.stringify(newJsonMap, null, 2))

  // NOTE: The tileset image will be loaded via other bundles, no need to
  // include it explictly here...
  return tilemapAsset = {
    type: 'tilemap',
    key: file,
    url: file.replace("tmx", "json"),
    data: null,
    format: 'TILED_JSON'
  }

}

var exportTmxToJson = function(tmxFilename) {
  spawnSync('tiled', ['--export-map', tmxFilename, tmxFilename.replace("tmx", "json")], {encoding: 'utf8'});
}
