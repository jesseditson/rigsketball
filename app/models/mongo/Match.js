var Match = require('../Match')
var extend = require('mise-model-mongo')
var config = require('./config')

var async = require('async')

var Band = require('./Band')

var ExtendedModel = extend(Match,config)

ExtendedModel.byIdDecorated = function(query,winners,callback){
  if (!callback) {
    callback = winners
    winners = []
  }
  if(Array.isArray(query)){
    query = { _id : { $in : query } }
  } else {
    query = { _id : query }
  }
  ExtendedModel.query(query,function(err,matches){
    if(err) return callback(err)
    async.forEachOf(matches, function(match, idx, done){
      match.scores = match.scores || []
      match.bands = winners[idx] || match.bands || []
      async.map(match.bands, Band.one.bind(Band), function(err, bands) {
        if (err) return done(err)
        match.bands = bands
        matches[idx] = match
        done()
      })
    }, function(err) {
      if (err) return callback(err)
      callback(null, matches)
    })
  })
}

var originalSave = ExtendedModel.prototype.save
ExtendedModel.prototype.save = function() {
  // restore non-decorated data
  this.bands = this.bands.map(function(band) {
    if (band._id) {
      return band._id
    } else {
      return band
    }
  })
  return originalSave.apply(this, arguments)
}

module.exports = ExtendedModel
