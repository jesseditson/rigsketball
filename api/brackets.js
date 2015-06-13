var Bracket = require('../app/models/mongo/Bracket')
var Match = require('../app/models/mongo/Match')
var async = require('async')
var brackets = {}

var resourceName = Bracket.prototype.collection

var decorateBracket = function(bracket,callback){
  if (!bracket.rounds) return callback(new Error('corrupted bracket.'))
  var roundNums = Object.keys(bracket.rounds).sort(function(a, b) {
    return parseInt(a) > parseInt(b) ? -1 : 1
  })

  var winners = {}
  var lastRound
  async.forEachSeries(roundNums,function(round,done){
    winners[round] = []
    var matchId = bracket.rounds[round]
    var bands = []
    if (lastRound) {
      bands = winners[lastRound].reduce(function(a, b, idx) {
        var position = idx % 2
        var index = Math.floor(idx / 2)
        a[index] = a[index] || []
        a[index][position] = b
        return a
      }, [])
    }
    Match.byIdDecorated(matchId,bands,function(err,matches){
      if(err) return done(err)
      bracket.rounds[round] = matches
      matches.forEach(function(match, idx) {
        if (match.winner) {
          winners[round][idx] = match.winner.toObject()
        }
      })
      lastRound = round
      done(err)
    })
  },function(err){
    if(err) return callback(err)
    callback(null,bracket)
  })

}

brackets.index = function(req,res,next){
  if(req.query.name){
    Bracket.one({name : req.query.name},function(err,bracket){
      if(err || !bracket) return next(err)
      decorateBracket(bracket,function(err,bracket){
        if(err) return next(err)
        res.json(bracket)
      })
    })
  } else {
    Bracket.all(function(err,items){
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

brackets.show = function(req,res,next){
  Bracket.one(req.params.id,function(err,item){
    if (err) {
      res.status(500).json({error : err.message})
    } else if(!item){
      res.status(404).json({error : 'Item not found'})
    } else {
      decorateBracket(item,function(err,bracket){
        if(err) return next(err)
        res.json(bracket)
      })
    }
  })
}

var upsert = function(data,callback){
  var newBracket = new Bracket(data)
  newBracket.save(function(err,bracket){
    if(err) return callback(err)
    validateRounds(bracket,function(err){
      if(err) return callback(err)
      bracket.save(callback)
    })
  })
}

var validateRounds = function(bracket,callback){
  if(bracket.rounds){
    console.warn('refusing to update rounds on an existing bracket.')
    return callback(null,bracket)
  }
  var size = bracket.poolSize
  bracket.rounds = {}
  // create an empty structure for our brackets
  while(size >= 1) {
    bracket.rounds[size] = []
    for(var m=0;m<size;m++){
      bracket.rounds[size].push(m)
    }
    size = size / 2
  }
  async.forEach(Object.keys(bracket.rounds),function(round,rdone){
    async.map(bracket.rounds[round],function(i,done){
      var match = new Match({
        bracket : bracket._id
      })
      match.save(function(err,m){
        if(err) return done(err)
        done(null,m._id)
      })
    },function(err,matches){
      if(err) return rdone(err)
      bracket.rounds[round] = matches
      rdone(null)
    })
  },function(err){
    callback(err,bracket)
  })
}

brackets.create = function(req,res,next){
  var bracket = req.body
  upsert(req.body,function(err,item){
    if (err) {
      res.status(500).json({error : err.message})
    } else {
      if(err) return next(err)
      res.json(item.toObject())
    }
  })
}

brackets.update = function(req,res,next){
  var id = req.params.id
  if(!id){
    res.status(406).json({error : "invalid id"})
  } else {
    var bracket = req.body
    upsert(bracket,function(err,item){
      if(!err && !item){
        res.status(404).json({error : 'Item not found'})
      } else if(err){
        res.status(500).json({error : err.message})
      } else {
        if(err) return next(err)
        res.json(item.toObject())
      }
    })
  }
}

brackets.destroy = function(req,res,next){
  var id = req.params.id
  if(!id){
    res.status(406).json({error : "invalid id"})
  } else {
    Bracket.one(id,function(err,bracket){
      if(!err && !bracket){
        res.status(404).json({error : 'Item not found'})
      } else {
        var matchIds = Object.keys(bracket.rounds || []).reduce(function(a,r){
          return a.concat(bracket.rounds[r])
        },[])
        async.forEach(matchIds,function(matchId,done){
          Match.destroy(matchId,done)
        },function(err){
          if(err) return res.status(500).json({error : err.message})
          Bracket.destroy(id,function(err,result){
            if(!err && !result){
              res.status(404).json({error : 'Item not found'})
            } else if(err){
              res.status(500).json({error : err.message})
            } else {
              res.sendStatus(204)
            }
          })
        })
      }
    })
  }
}

module.exports = brackets
