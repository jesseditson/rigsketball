var User = require('../User');
var extend = require('mise-model-rest');
var config = require('./config');
var request = require('superagent');

var ExtendedModel = extend(User,config);

var getURL = function(url){
  url = url.replace(/^\//,'');
  return ExtendedModel.baseURL.replace(/\/*$/,'/') + url;
};

ExtendedModel.currentUser = function(callback){
  request
  .get(getURL('users/me'))
  .end(function(err,res){
    err = err || res.error || (res.body && res.body.error);
    if(err) return callback(err);
    var r = new ExtendedModel(res.body)
    callback(null,r);
  });
};

module.exports = ExtendedModel;
