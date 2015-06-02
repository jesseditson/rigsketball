var Match = require('../Match');
var extend = require('mise-model-mongo');
var config = require('./config');

var async = require('async');

var Band = require('./Band');

var ExtendedModel = extend(Match,config);

ExtendedModel.byIdDecorated = function(query,callback){
  if(Array.isArray(query)){
    query = { _id : { $in : query } };
  } else {
    query = { _id : query };
  }
  ExtendedModel.query(query,function(err,matches){
    if(err) return callback(err);
    matches = matches.map(function(m){
      m.bands = m.bands || [];
      return m;
    });
    callback(null,matches);
  });
};

module.exports = ExtendedModel;
