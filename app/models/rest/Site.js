var Site = require('../Site')
var extend = require('mise-model-rest')
var config = require('./config')
var request = require('superagent')
var async = require('async')

var getURL = function(url){
  url = url.replace(/^\//,'')
  return ExtendedModel.baseURL.replace(/\/*$/,'/') + url
}

var ExtendedModel = extend(Site,config)

ExtendedModel.site = function(callback){
    request
    .get(getURL('sites'))
    .query({name : 'main'})
    .end(function(err,res){
      err = err || res.error || (res.body && res.body.error)
      if(err) return callback(err)
      var r = new ExtendedModel(res.body)
      callback(null,r)
    });
}

module.exports = ExtendedModel
