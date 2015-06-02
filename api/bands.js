var Band = require('../app/models/mongo/Band')
var bands = {}

var resourceName = Band.prototype.collection

bands.index = function(req,res,next){
  Band.allSorted(function(err,items){
    if(err){
      res.status(500).json({error : err.message})
    } else {
      var obj = {}
      obj[resourceName] = items
      res.json(obj)
    }
  })
}

bands.show = function(req,res,next){
  Band.one(req.params.id,function(err,item){
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
  var newBand = new Band(data)
  newBand.save(callback)
}

bands.create = function(req,res,next){
  upsert(req.body,function(err,item){
    if (err) {
      res.status(500).json({error : err.message})
    } else {
      res.json(item.toObject())
    }
  })
}

bands.update = function(req,res,next){
  var id = req.params.id
  if(!id){
    res.status(406).json({error : "invalid id"})
  } else {
    upsert(req.body,function(err,item){
      if(!err && !item){
        res.status(404).json({error : 'Item not found'})
      } else if(err){
        res.status(500).json({error : err.message})
      } else {
        res.json(item.toObject())
      }
    })
  }
}

bands.destroy = function(req,res,next){
  var id = req.params.id
  if(!id){
    res.status(406).json({error : "invalid id"})
  } else {
    Band.destroy(id,function(err,result){
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

module.exports = bands
