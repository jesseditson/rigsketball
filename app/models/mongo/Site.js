var Site = require('../Site')
var extend = require('mise-model-mongo')
var config = require('./config')

var ExtendedModel = extend(Site,config)

module.exports = ExtendedModel
