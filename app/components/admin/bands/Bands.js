/** @jsx React.DOM */

var React = require('react')

var List = require('./List')
var Detail = require('./Detail')

module.exports = React.createClass({
  getInitialState() {
    return {}
  },
  render() {
    var pathParts = this.props.path ? this.props.path.split('/') : []
    var lastComponent = pathParts[pathParts.length -1]

    var currentView
    if (lastComponent !== 'bands') {
      // detail page
      currentView = <Detail id={lastComponent} />
    } else {
      // normal view
      currentView = <List />
    }
    return <div>
      <h1>Bands</h1>
      {currentView}
    </div>
  }
})
