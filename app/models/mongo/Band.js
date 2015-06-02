var Band = require('../Band');
var extend = require('mise-model-mongo');
var config = require('./config');
var mongo = require('mongo-wrapper');

var db = mongo.setup(config);
db.add('bands');

var ExtendedModel = extend(Band,config);

ExtendedModel.allSorted = function(cb){
  db.bands.find(function(err,cursor){
    if(err) return cb(err);
    cursor.sort({name : 1}).toArray(cb);
  })
}

module.exports = ExtendedModel;
