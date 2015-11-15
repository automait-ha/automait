module.exports = Automait

var createTriggerLoader = require('./trigger-loader')

function Automait(logger, config) {
  this.plugins = null
  this.config = config
  this.logger = logger
}

Automait.prototype.setPlugins = function (plugins) {
  this.plugins = plugins
}

Automait.prototype.init = function () {

  var loadTriggers = createTriggerLoader(this.plugins, this.logger)
  loadTriggers(this.config.triggers)

  Object.keys(this.plugins).forEach(function (name) {
    var plugin = this.plugins[name]
    if (plugin.init) plugin.init()
  }.bind(this))
}
