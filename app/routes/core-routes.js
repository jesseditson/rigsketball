var React = require('react')
var ReactApp = React.createFactory(require('../components/ReactApp'))

module.exports = function(app) {

  app.get('/', function(req, res) {
    // React.renderToString takes your component
    // and generates the markup
    var reactHtml = React.renderToString(ReactApp({}))
    res.render('index.ejs', {
      reactOutput: reactHtml
    })
  })

}
