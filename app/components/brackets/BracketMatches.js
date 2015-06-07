/** @jsx React.DOM */

var React = require('react')
var Bracket = require('../../models/rest/Bracket')

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
    if (lastComponent !== 'brackets') {
      // detail page
      currentView = <Detail id={lastComponent} />
    } else {
      // normal view
      currentView = <List />
    }
    return <div>
      <h1>Brackets & Matches</h1>
      {currentView}
    </div>
  }
})
