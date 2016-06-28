module.exports = createTriggerLoader

var async = require('async')

function createTriggerLoader(plugins, logger) {

  function loadTriggers(triggers) {
    triggers = triggers.filter(function (trigger) {
      return trigger.active && trigger.when && trigger.then
    })
    triggers.forEach(loadSingleTrigger)
  }

  function loadSingleTrigger(trigger) {

    function triggerFunction(emittedData) {
      conditionalLog('"' + trigger.desc + '"' + ' triggered...' , trigger)
      evaluateConditionals(trigger.if, function (result) {
        if (!result) return
        conditionalLog('"' + trigger.desc + '"' + ' executing...', trigger)
        async.each(trigger.then
        , function (then, eachCb) {
            var plugin = plugins[then.plugin]
              , args = then.action.input.slice(0)
              , emittedDataIndex = args.indexOf('#OUTPUT#')

            if (emittedDataIndex > -1) {
              args[emittedDataIndex] = emittedData
            }

            args.push(eachCb)
            plugin[then.action.name].apply(plugin, args)
          }
        , function (error) {
            if (error) {
              logger.error('Error executing action')
              logger.error(error)
            }
          }
        )
      })
    }

    trigger.when.forEach(function (when) {
      if (!plugins[when.plugin]) {
        throw new Error('No plugin registered for: ' + when.plugin)
      } else if (!plugins[when.plugin].on) {
        throw new Error('Plugin is not an event emitter: ' + when.plugin)
      }
      plugins[when.plugin].on(when.event, triggerFunction)
    })
  }

  function evaluateConditionals(conditions, callback) {
    if (!conditions) return callback(true)
    async.every(conditions
    , function (cond, evCb) {
        var plugin = plugins[cond.plugin]
          , args = cond.action.input.slice(0)

        function checkResult(error, result) {
          if (error) {
            logger.error('Error checking condition:', cond.plugin, cond.action)
            return logger.error(error)
          }
          evCb(cond.action.equal === result)
        }

        args.push(checkResult)
        plugin[cond.action.name].apply(plugin, args)
      }
    , callback
    )
  }

  function conditionalLog(msg, trigger) {
    if (!trigger.supressEventLog) {
      logger.info(msg)
    }
  }

  return loadTriggers
}
