var Match = require('../app/models/mongo/Match')
var oid = require('objectid')
var matches = {}
var Bracket = require('../app/models/mongo/Bracket')
var async = require('async')

var parseId = function(id){
  try {
    return oid(id)
  } catch(e){
    return null
  }
}

var resourceName = Match.prototype.collection

matches.index = function(req,res,next){
  if(req.query.ids) return matches.byIds(req,res,next)
  Match.all(function(err,items){
    if(err){
      res.status(500).json({error : err.message})
    } else {
      var obj = {}
      obj[resourceName] = items
      res.json(obj)
    }
  })
}

matches.byIds = function(req,res,next){
  req.query.ids = req.query.ids.map(function(id){ return parseId(id) })
  Match.query(req.query,function(err,items){
    if (err) {
      res.status(500).json({error : err.message})
    } else {
      res.json(items.map(function(i){ return i.toObject() }))
    }
  })
}

matches.show = function(req,res,next){
  Match.one(req.params.id,function(err,item){
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
  if(typeof data.bands === 'string'){
    // convert this from a string when posted from the client.
    data.bands = JSON.parse(val)
  }
  var newMatch = new Match(data)
  newMatch.save(callback)
}

matches.create = function(req,res,next){
  upsert(req.body,function(err,item){
    if (err) {
      res.status(500).json({error : err.message})
    } else {
      res.json(item.toObject())
    }
  })
}

var matchUpdated = function(match,callback){
  Bracket.one(match.bracket,function(err,bracket){
    if(err) return done(err)
    // make the rounds and matches more ingestable
    var matchIds = []
    var rounds = Object.keys(bracket.rounds)
      .sort(function(a,b){ return b - a })
      .map(function(k){
        return bracket.rounds[k].map(function(id){
          matchIds.push(id)
          return id.toString()
        })
      })
    // map the match ids to their matches
    Match.byIdDecorated(matchIds,function(err,matches){
      if(err) return done(err)
      var matchMap = matches.reduce(function(o,m){
        o[m._id.toString()] = m
        return o
      },{})
      // update the matches with the correct winners.
      updateMatchWinners(rounds,match._id,matchMap,callback)
    })
  })
}

var updateMatchWinners = function(rounds,matchId,matchMap,callback){
  // don't update the last round
  if(rounds.length === 1) return callback()
  var round = rounds.shift()
  var matchIndex = round.indexOf(matchId.toString())
  // not in this round, go to the next one.
  if (!~matchIndex) return updateMatchWinners(rounds,matchId,matchMap,callback)
  var match1Id = round[matchIndex % 2 ? matchIndex - 1 : matchIndex]
  var match2Id = round[matchIndex % 2 ? matchIndex : matchIndex + 1]
  var match1 = matchMap[match1Id]
  var match2 = matchMap[match2Id]
  // not enough winners to calculate next match, bail
  if(!match1.winner || !match2.winner) return callback()
  // calculate which match is next and get it.
  var nextMatchIndex = Math.floor(matchIndex/2)
  var matchId = rounds[0][nextMatchIndex]
  var match = matchMap[matchId]
  // make sure we have objects in our band slots
  if(!match.bands) match.bands = []
  var i = match.bands.length
  for(i;i<2;i++){
    match.bands[i] = {score : 0}
  }
  // set the correct bands in the next match.
  match.bands[0]._id = match1.winner._id
  match.bands[1]._id = match2.winner._id
  console.log('saving',match.toObject())
  match.save(function(err){
    // last round, we've completed them all.
    if(rounds.length === 1){
      return callback(err)
    } else {
      // recurse (rounds will get shifted until we're done.)
      return updateMatchWinners(rounds,match._id,matchMap,callback)
    }
  })
}

matches.update = function(req,res,next){
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
    upsert(req.body,function(err,item){
      var updatedScore = false
      if(req.body.bands){
        var band1 = req.body.bands[0] || {}
        var band2 = req.body.bands[1] || {}
        if(band1.score !== 'undefined' && band2.score !== 'undefined') updatedScore = true
      }
      // if the update didn't work or we're not updating bands, don't worry about updating the matches.
      if(!updatedScore || err || !item) return done(err,item)
      // if we updated a score, update the match winners
      matchUpdated(item,function(err){
        done(err,item)
      })
    })
  }
}

matches.destroy = function(req,res,next){
  var id = req.params.id
  if(!id){
    res.status(406).json({error : "invalid id"})
  } else {
    Match.destroy(id,function(err,result){
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

module.exports = matches
