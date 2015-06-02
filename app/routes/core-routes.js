var React = require('react')
var App = require('../components/App')
var Admin = require('../components/admin/App')

module.exports = function(app) {

  app.get('/admin/*?', function(req, res) {
    var pagePath = req.params[0]
    var reactHtml = React.renderToString(<Admin path={pagePath}/>)
    res.render('admin/index.ejs', {
      props: {path: pagePath},
      reactOutput: reactHtml
    })
  })

  app.get('/*?', function(req, res) {
    // React.renderToString takes your component
    // and generates the markup
    var pagePath = req.params[0]
    var reactHtml = React.renderToString(<App path={pagePath}/>)
    res.render('index.ejs', {
      props: {path: pagePath},
      reactOutput: reactHtml
    })
  })

}
