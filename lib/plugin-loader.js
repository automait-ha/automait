module.exports = createPluginLoader

var fs = require('fs')
  , async = require('async')

function createPluginLoader(automait, logger, config) {

  function loadPlugins(callback) {
    var pluginDir = __dirname + '/../../'
      , plugins = {}

    fs.readdir(pluginDir, function (error, dirs) {
      if (error) return callback(error)
      dirs = dirs.filter(function (dir) {
        return dir.indexOf('automait-') === 0
      })

      async.each(
        dirs
      , function (dir, eachCb) {
          var pluginFile = pluginDir + dir + '/index.js'
            , pluginInit = require(pluginFile)

          pluginInit(function (error, name, Plugin) {
            if (error) return callback(error)
            logger.info('Initialising plugin: ' + name)
            plugins[name] = new Plugin(automait, logger, config.plugins[name])
            eachCb()
          })

        }
      , function (error) {
          if (error) return callback(error)
          callback(null, plugins)
        }
      )
    })

  }

  return loadPlugins

}
