var Band = require('../app/models/mongo/Band')
var ID3 = require('id3-reader')
var async = require('async')

var http = require('http')
var urlmod = require('url')

function getResponse(url, callback) {
    var parsed = urlmod.parse(url)
    var port = parseInt(parsed.port || '80', 10)
    var client = http.createClient(port, parsed.hostname)
    var path = parsed.pathname
    if (parsed.search) {
        path += '?' + parsed.search
    }
    var request = client.request('GET', path, {'host': parsed.hostname})
    request.addListener('response', callback)
    request.end()
}

function resolveHttpRedirects(url, callback, maxnum) {
    maxnum = maxnum || 50
    var count = 0
    function next(url) {
        getResponse(url, function(response) {
            if (response.statusCode == 301 || response.statusCode == 302) {
                if (count >= maxnum) {
                    callback(response.headers.location)
                } else {
                    count += 1
                    next(response.headers.location)
                }
            } else {
                callback(url)
            }
        })
    }
    next(url)
}

Band.all(function(err, bands) {
  if (err) throw err
  async.forEach(bands, function(band, done) {
    if (!band.track) return done()
    resolveHttpRedirects(band.track, function(fileurl) {
      ID3.loadTags(fileurl, function() {
          var tags = ID3.getAllTags(fileurl)
          if (tags) {
            band.trackInfo = tags
            band.save(done)
          }
      }, {
        onError: function(reason) {
          console.warn('failed retrieving id3 tags for', band.track)
          if (reason.xhr) {
            console.warn(reason.xhr.status)
          }
          done()
        }
      })
    })
  }, function(err) {
    if (err) throw err
    console.log('finished.')
    process.exit(!err)
  })
})
