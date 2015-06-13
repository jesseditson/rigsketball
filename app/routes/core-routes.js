var React = require('react')
var App = require('../components/App')
var Admin = require('../components/admin/App')
var Band = require('../models/mongo/Band')

module.exports = function(app) {

  var admin = function(req, res) {
    var pagePath = req.params[0] ? req.params[0].replace(/\/$/,'') : ''
    var reactHtml = React.renderToString(<Admin path={pagePath}/>)
    res.render('admin/index.ejs', {
      props: {path: pagePath},
      reactOutput: reactHtml
    })
  }
  app.get('/admin/*?', admin)
  app.get('/admin', admin)

  app.get('/*?', function(req, res) {
    // React.renderToString takes your component
    // and generates the markup
    var pagePath = req.params[0] ? req.params[0].replace(/\/$/,'') : ''
    var reactHtml = React.renderToString(<App path={pagePath}/>)
    res.render('index.ejs', {
      props: {path: pagePath},
      reactOutput: reactHtml
    })
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
    var submissionID = req.body.submissionID;

    var uploadURL = function(name) {
      return 'http://www.jotform.com/uploads/rigsketball/'+formID+'/'+submissionID+'/' + name
    }

    var b = {}
    b.submission = req.body
    b.photo = uploadURL(req.body.photo)
    b.track = uploadURL(req.body.track)
    b.soundcloud = req.body.soundcloud
    b.bandcamp = req.body.bandcamp
    b.hasMatch = false
    var band = new Band(b)
    band.save(function(err) {
      if (err) return next(err)

      var pagePath = '/'

      var reactHtml = React.renderToString(<App path={pagePath} signup={true} />)
      res.render('index.ejs', {
        props: {
          path: pagePath,
          signup: true
        },
        reactOutput: reactHtml
      })
    })
  })

}
