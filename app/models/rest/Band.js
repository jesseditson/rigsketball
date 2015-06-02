var Band = require('../Band');
var extend = require('mise-model-rest');
var config = require('./config');

var ExtendedModel = extend(Band,config);

module.exports = ExtendedModel;
