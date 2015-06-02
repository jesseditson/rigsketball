var User = require('../User');
var extend = require('mise-model-mongo');
var config = require('./config');

var ExtendedModel = extend(User,config);

module.exports = ExtendedModel;
