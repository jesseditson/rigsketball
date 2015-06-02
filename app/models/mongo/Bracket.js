var Bracket = require('../Bracket');
var extend = require('mise-model-mongo');
var config = require('./config');

var ExtendedModel = extend(Bracket,config);

module.exports = ExtendedModel;
