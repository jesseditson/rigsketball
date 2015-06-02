/** @jsx React.DOM */

var React = require('react')
var Bracket = require('../models/rest/Bracket')

module.exports = React.createClass({
  getInitialState() {
    return {
      bracket: null,
      error: null
    }
  },
  componentDidMount() {
    var self = this
    Bracket.byName(this.props.bracketName, function(err, bracket) {
      self.setState({bracket : bracket, error: err})
    })
  },
  render() {
    return <div>
      <p>{this.state.error}</p>
    </div>
  }
})
