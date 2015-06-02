var Bracket = require('../Bracket');
var extend = require('mise-model-rest');
var config = require('./config');
var request = require('superagent');

var ExtendedModel = extend(Bracket,config);

var getURL = function(url){
  url = url.replace(/^\//,'');
  return ExtendedModel.baseURL.replace(/\/*$/,'/') + url;
};

ExtendedModel.byName = function(name,callback){
    request
    .get(getURL('brackets'))
    .query({name : name})
    .end(function(err,res){
      err = err || res.error || (res.body && res.body.error);
      if(err) return callback(err);
      var r = new ExtendedModel(res.body)
      callback(null,r);
    });
};

module.exports = ExtendedModel;
