var Band = require('../Band')
var extend = require('mise-model-rest')
var config = require('./config')

var ExtendedModel = extend(Band,config)


ExtendedModel.delete = function(id, callback) {
  var m = new ExtendedModel({_id: id})
  m.destroy(callback)
}

module.exports = ExtendedModel
