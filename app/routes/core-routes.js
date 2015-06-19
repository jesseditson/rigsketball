var React = require('react')
var App = require('../components/App')
var Admin = require('../components/admin/App')
var Band = require('../models/mongo/Band')
var tumblr = require('../lib/tumblr')
var ensureLoggedIn = require('../../api/auth/ensureLoggedIn')


var async = require('async')
var path = require('path')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var httpreq = require('httpreq')
var crypto = require('crypto')
var fs = require('fs')
var archiver = require('archiver')

module.exports = function(app) {

  var admin = function(req, res) {
    var pagePath = req.params[0] ? req.params[0].replace(/\/$/,'') : ''
    var reactHtml = React.renderToString(<Admin path={pagePath}/>)
    res.render('admin/index.ejs', {
      props: {path: pagePath},
      reactOutput: reactHtml
    })
  }
  app.get('/admin/*?', ensureLoggedIn, admin)
  app.get('/admin', ensureLoggedIn, admin)

  app.get('/comp-tracks/download', function(req, res, next) {
    Band.all(function(err, bands) {
      if (err) return res.status(500).json({error : err.message})
      var tmpFolder = path.join(__dirname, '../../tmp')
      var tracksFolder = path.join(tmpFolder, 'tracks')
      mkdirp(tracksFolder, function(err) {
        if (err) return res.status(500).json({error : err.message})
        var allbands = ''
        var files = []
        async.forEach(bands, function(band, done) {
          var trackName = band.track.match(/\/([^\.\/]+\.\w+)$/)
          if (!band.track || !trackName) return done(null)
          trackName = trackName[1]
          allbands += band._id
          var filePath = path.join(tracksFolder, band.name + '-' + trackName)
          fs.exists(filePath, function(ok) {
            if (!ok) {
              httpreq.download(
                  band.track,
                  filePath
              , function (err, progress){
                  if (err) return done(err)
              }, function (err, res){
                  if (err) return done(err)
                  console.log('finished downloading ' + band.track)
                  files.push(filePath)
                  done(null)
              })
            } else {
              files.push(filePath)
              done(null)
            }
          })
        }, function(err) {
          if (err) {
            return rimraf(tmpFolder, function() {
              res.status(500).json({error : err.message})
            })
          }
          var hash = crypto.createHash('md5').update(allbands).digest('hex')
          var zipFile = path.join(tmpFolder, hash + '.zip')
          fs.exists(zipFile, function(ok) {
            var done = function() {
              res.download(zipFile, 'rigsketball-tracks.zip', function(err) {
                if (err) res.status(500).json({error : err.message})
              })
            }
            if (!ok) {

              var output = fs.createWriteStream(zipFile)
              var archive = archiver('zip')

              output.on('close', function () {
                done()
              })

              archive.on('error', function(err){
                if (err) res.status(500).json({error : err.message})
              })

              archive.pipe(output)
              archive.directory(tracksFolder, 'tracks')
              archive.finalize()
            } else {
              done()
            }
          })
        })
      })
    })
  })

  app.get('/*?', function(req, res, next) {
    // React.renderToString takes your component
    // and generates the markup
    var pagePath = req.params[0] ? req.params[0].replace(/\/$/,'') : ''

    var opts = {
      path: pagePath
    }

    var render = function() {
      tumblr.posts({}, function(err, data) {
        if (err) return next(err)
        var reactHtml = React.renderToString(<App {...opts} tumblrData={data}/>)
        res.render('index.ejs', {
          props: opts,
          reactOutput: reactHtml
        })
      })
    }

    if (req.session.signupBand) {
      Band.one(req.session.signupBand, function(err, band) {
        if (err || !band || band.hasMatch) {
          delete req.session.signupBand
          req.session.save(render)
        } else {
          opts.select = band.toObject()
          render()
        }
      })
    } else {
      render()
    }

  })

  app.post('/signup', function(req, res, next) {

    /* example form:
    { submission_id: '309952021812927752',
  formID: '51626431524955',
  ip: '173.247.206.218',
  name: 'hello',
  website: 'foo.com',
  bandcamp: 'andandand',
  soundcloud: 'killtheflash',
  'phone[]': [ '415', '8675309' ],
  email: 'jesse.ditson@gmail.com',
  address: 'test address',
  membercount: 'Me and This Other Dude/Chick.',
  numsubs: 'Yep, we need one sub.',
  notadick: 'Yep!',
  clickto14: 'Accepted',
  trackname: 'Repeat After Me.mp3',
  avatar: 'dickbutt_profile.png' }
     */

    var formID = req.body.formID;
    var submissionID = req.body.submission_id;

    var uploadURL = function(item) {
      return 'http://www.jotform.com/uploads/Rigsketball/'+formID+'/'+submissionID+'/' + item
    }

    var b = {}
    b.name = req.body.name
    b.submission = req.body
    b.photo = uploadURL(req.body.photo)
    b.track = uploadURL(req.body.trackname)
    b.soundcloud = req.body.soundcloud
    b.bandcamp = req.body.bandcamp
    b.hasMatch = false
    var band = new Band(b)

    band.save(function(err, band) {
      if (err) return next(err)
      req.session.signupBand = band._id
      req.session.save(function(err) {
        if (err) return next(err)
        res.redirect('/')
      })
    })
  })
}
