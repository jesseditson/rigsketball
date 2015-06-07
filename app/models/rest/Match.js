var Match = require('../Match')
var extend = require('mise-model-rest')
var config = require('./config')
var request = require('superagent')

var getURL = function(url){
  url = url.replace(/^\//,'')
  return ExtendedModel.baseURL.replace(/\/*$/,'/') + url
}

var ExtendedModel = extend(Match,config)

ExtendedModel.byIds = function(ids,callback){
  request
  .get(getURL('matches'))
  .send({ ids : ids })
  .end(function(err,res){
    err = err || res.error || (res.body && res.body.error)
    if(err) return callback(err)
    var r = res.body.matches.map(function(m){
      m.bands = m.bands || []
      return new ExtendedModel(m)
    })
    callback(null,r)
  })
}

module.exports = ExtendedModel
