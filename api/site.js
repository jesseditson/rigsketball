var Site = require('../app/models/mongo/Site')
var Band = require('../app/models/mongo/Band')
var brackets = require('./brackets')
var id3 = require('id3js')
var async = require('async')
var site = {}

var resourceName = Site.prototype.collection

site.index = function(req,res,next){
  if(req.query.name){
    Site.one({name : req.query.name},function(err,site){
      if(err || !site) return res.status(500).json({error : err && err.message || 'Site '+req.query.name+' not found.'})
      var defaultBracket = process.env.DEFAULT_BRACKET || 'rigsketball'
      Band.all(function(err, bands) {
        if (err) return res.status(500).json({error : err.message})
        site.tracks = bands.reduce(function(o, band) {
          if (!band.track) return o
          var trackName = band.track.match(/\/([^\.\/]+)\.\w+$/)
          // don't include tracks that don't have a file
          if (trackName) {
            o[band._id] = {
              id: band._id,
              file: band.track,
              cover: band.photo,
              name: trackName[1],
              band: band.name
            }
          }
          return o
        }, {})
        brackets.decoratedByName(defaultBracket, function(err, bracket) {
          if (err) return res.status(500).json({error : err.message})
          if (!bracket) return res.json(site)
          var firstRound = Math.max.apply(Math, Object.keys(bracket.rounds).map(Number))
          var matches = bracket.rounds[firstRound]
          var available = matches.some(function(match) {
            return !match.bands[0] || !match.bands[1]
          })
          site.full = !available
          res.json(site)
        })
      })
    })
  } else {
    Site.all(function(err,items){
      if(err){
        res.status(500).json({error : err.message})
      } else {
        var obj = {}
        obj[resourceName] = items
        res.json(obj)
      }
    })
  }
}

site.show = function(req,res,next){
  Site.one(req.params.id,function(err,item){
    if (err) {
      res.status(500).json({error : err.message})
    } else if(!item){
      res.status(404).json({error : 'Item not found'})
    } else {
      res.json(item.toObject())
    }
  })
}

var upsert = function(data,callback){
  var newSite = new Site(data)
  newSite.save(callback)
}

site.create = function(req,res,next){
  upsert(req.body,function(err,item){
    if (err) {
      res.status(500).json({error : err.message})
    } else {
      res.json(item.toObject())
    }
  })
}

site.update = function(req,res,next){
  var id = req.params.id
  if(!id){
    res.status(406).json({error : "invalid id"})
  } else {
    var done = function(err,item){
      if(!err && !item){
        res.status(404).json({error : 'Item not found'})
      } else if(err){
        res.status(500).json({error : err.message})
      } else {
        res.json(item.toObject())
      }
    }
    upsert(req.body, done)
  }
}

site.destroy = function(req,res,next){
  var id = req.params.id
  if(!id){
    res.status(406).json({error : "invalid id"})
  } else {
    Site.destroy(id,function(err,result){
      if(!err && !result){
        res.status(404).json({error : 'Item not found'})
      } else if(err){
        res.status(500).json({error : err.message})
      } else {
        res.sendStatus(204)
      }
    })
  }
}

module.exports = site
