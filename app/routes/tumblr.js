var express = require('express')
var router = express.Router()
var tumblr = require('../lib/tumblr')

// tumblr proxy - proxies tumblr requests with our signature.

router.get('/posts',function(req,res,next){
  var query = req.query || {}
  tumblr.posts(query, function(error,response){
    if(error){
      console.error(error)
      res.sendStatus(500)
    } else {
      res.json(response)
    }
  })
})

module.exports = router
