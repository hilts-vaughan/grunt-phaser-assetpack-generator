# grunt-phaser-assetpack-generator

> This tool helps you generate an asset pack from your filesystem directory, so that you can easily preload all your assets required for your Phaser game.

## Motivation

In the Phaser game engine, you can traditionally load your assets like this:

```
  game.load.image('kirito', 'assets/sprites/kirito_by_vali233.png');
  game.load.image('asuna', 'assets/sprites/asuna_by_vali233.png');
```

This is fine for just a few assets but when you need a larger amount of assets,
this can become cumbersome. Phaser has the notions of [asset packs](http://www.html5gamedevs.com/topic/6807-new-phaser-asset-pack-feature-please-test/). These would normally have to be edited by hand or with some authoring tool. So, what can this tool do?

* If you just want to access things like a normal filesystem, it can generate an asset pack that you generate once at build time and then load using filesystem paths as the phaser keys.
* It will clean up your hard-coded load codes. It will make loading assets in your game easier.
* It will allow you to generate multiple asset packs and use them for whatever you'd like. Want to group your assets by level and then load all the level assets when the level is loaded? You can use this tool to bundle up those assets. (Hint:  you would just specify a glob for each level in the files)


... basically, this lets you create those asset packs based on some rules
that you define.

## Getting Started
This plugin requires Grunt `~0.4.5` or up.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-phaser-assetpack-generator --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-phaser-assetpack-generator');
```

## The "phaser_assetpack_generator" task

### Overview
In your project's Gruntfile, add a section named `phaser_assetpack_generator` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  phaser_assetpack_generator: {
    files: {
      // Task-specific options go here.
    }
  },
});
```

The files glob is the same as your standard grunt minimatch files set. In the most barebones installation, you can simply use something like:

```
files: {
  src:  'assets/**',
  dest: 'assets/pack.json',
  processor: 'default'
}
```
and the generator will try and guess the correct mappings based on some rules. More on those rules later. You can then just load the asset pack with Phaser, using
the `game.load.pack`. Since most games require more complex configurations, you can specify your own custom processor for generating the pack or you can use some of the
predefined rules.

More on that in the detailed documentation below...

### Options

#### files.processor
Type: `String` or `Function`
Default value: Varies

This allows you to pass in a particular processor (for generating the JSON) for a specific glob-set. You can pass in 'default' to let most things be handled
automatically. You can read more on this shortly.

### Processors Available

As you may have noted above, each file glob can take a `processor` function or string key. Each function will be passed `(file, grunt)` and should return a JSON object -- the format of the object that should be put in the asset pack.

For example, if you specify 'image', then all files in that glob will be generated as images, each entry having a payload similar to:

```json
{
    "type": "image",
    "key": "assets/sprites/shinyball.png",
    "url": "assets/sprites/shinyball.png",
}
```

You can also specify a function and return a JSON object yourself. This
may be desirable if you use non-standard file extensions or need to parse
custom files and create the definitions based on those contents.

 #### Processor List

 * `default`. This is the most basic processor -- it will automatically examine file extensions and try and load things accordingly. Use this if your `files` glob contains mixed content that you want to be auto-detected. *Note*: If you have custom files that require parsing, this will not work without additional configuration.
 * `image`. This will load all the files in the glob as an image asset.
 * `audio`. This will load all the files in the glob as audio assets. It will automatically include all similar audio formats in the same directory, so only specify one file type in your glob, i.e: `assets/music/*.mp3` will automatically be rolled up, i.e:

 ```
 {
       //   Loads an Audio File
       "type": "audio",
       "key": "assets/audio/bodenstaendig_2000_in_rock_4bit.mp3",
       "urls": ["assets/audio/bodenstaendig_2000_in_rock_4bit.mp3", "assets/audio/bodenstaendig_2000_in_rock_4bit.ogg"],
       "autoDecode": true
   },
 ```

* `json`, `text`, `xml`
* `spritesheet`. Spritesheet support is something I want to include but I need more details on the implementation first. Submit an issue if you have an idea on how to do this.

* `tilemap`. Not implemented; submit issue or PR with a sample implementation! :)

### Usage Examples

#### Single Asset Pack

```js
grunt.initConfig({
  phaser_assetpack_generator: {
    files: {
      src:  'assets/**',
      dest: 'assets/pack.json',
      processor: 'default'
    },
  },
});
```

This will guess at everything by default and dump it in the file `assets/pack.json` for consumption by your game.

### Multiple Asset Packs

For example, this can come in handy when creating "level" packs to reduce loading times.


```js
grunt.initConfig({
  phaser_assetpack_generator: {
    files: {
      src:  'assets/common/**',
      dest: 'assets/common/pack.json',
      processor: 'default'
    },
    {
      src: 'assets/levels/1/**',
      dest: 'assets/levels/1/pack.json',
      processor: levelFormatter // or 'default'
    }
  },
});

var levelFormatter = function(file, grunt) {
  var results = {};

  // do stuff...

  return results;
}
```

In this way, you could load the common assets and the level assets seperately
without needing to worry about bootstrapping the entire game at once in one pack load. And of course, you are able to provide a custom function as shown above so that you are able to do something unique with the level path. 

## Contributing

Pull requests are welcome. :)
