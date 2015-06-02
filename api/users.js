var User = require('../app/models/mongo/User')
var users = {}

var resourceName = User.prototype.collection

users.index = function(req,res,next){
  User.all(function(err,items){
    if(err){
      res.status(500).json({error : err.message})
    } else {
      var obj = {}
      obj[resourceName] = items
      res.json(obj)
    }
  })
}

users.currentUser = function(req,res,next){
  if(req.user){
    res.json(req.user)
  } else {
    res.status(401).json({error : 'Not logged in'})
  }
}

users.show = function(req,res,next){
  User.one(req.params.id,function(err,item){
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
  var newUser = new User(data)
  newUser.save(callback)
}

users.create = function(req,res,next){
  upsert(req.body,function(err,item){
    if (err) {
      res.status(500).json({error : err.message})
    } else {
      res.json(item.toObject())
    }
  })
}

users.update = function(req,res,next){
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

users.destroy = function(req,res,next){
  var id = req.params.id
  if(!id){
    res.status(406).json({error : "invalid id"})
  } else {
    User.destroy(id,function(err,result){
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

module.exports = users
