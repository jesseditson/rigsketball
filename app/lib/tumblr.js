var tumblr = require('tumblr')

var oauth = {
  consumer_key: process.env.TUMBLR_KEY,
  consumer_secret: process.env.TUMBLR_SECRET
}

var blog = new tumblr.Blog((process.env.TUMBLR_SUBDOMAIN || 'rigsketball') + '.tumblr.com', oauth)

var api = {}

api.posts = function(query, cb){
  if (!query.limit) query.limit = 1000
  blog.posts({offset : query.offset, limit : query.limit}, cb)
}

module.exports = api
