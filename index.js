var path = require('path')
  , bunyan = require('bunyan')
  , logger = bunyan.createLogger({ name: 'automait' })
  , config = null

try {
  config = require('../../config.json')
} catch (e) {
  logger.error('A valid config.json must exist at: ' + path.resolve(__dirname + '/../../config.json'))
  process.exit(1)
}

var Automait = require('./lib/automait')
  , automait = new Automait(logger, config)
  , loadPlugins = require('./lib/plugin-loader')(automait, logger, config)

loadPlugins(function (error, plugins) {
  if (error) throw error
  automait.setPlugins(plugins)
  automait.init()
})
