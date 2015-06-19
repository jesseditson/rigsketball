var Site = require('../Site')
var extend = require('mise-model-rest')
var config = require('./config')
var request = require('superagent')
var async = require('async')
var id3 = require('id3js')

var getURL = function(url){
  url = url.replace(/^\//,'')
  return ExtendedModel.baseURL.replace(/\/*$/,'/') + url
}

var ExtendedModel = extend(Site,config)

var decorateID3Info = function(tracks, callback) {
  async.map(tracks, function(track, done) {
    id3('/proxy?url=' + encodeURIComponent(track.file), function(err, tags) {
      if (tags) {
        if (tags.title) track.name = tags.title
        if (tags.band) track.band = tags.band
      }
      console.log(tags)
      return done(null, track)
    });
  }, callback)
}

ExtendedModel.site = function(callback){
    request
    .get(getURL('sites'))
    .query({name : 'main'})
    .end(function(err,res){
      err = err || res.error || (res.body && res.body.error)
      if(err) return callback(err)
      var r = new ExtendedModel(res.body)
      try {
        decorateID3Info(r.tracks, function(err, tracks){
          if (!err) r.tracks = tracks
          console.log('updated tracks', tracks)
          callback(null,r)
        })
      } catch(e) {
        callback(null,r)
      }
    });
}

module.exports = ExtendedModel
