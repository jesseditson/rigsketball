/** @jsx React.DOM */

var React = require('react')
var Bracket = require('./Bracket')

var App = React.createClass({
  getInitialState() {
    return {}
  },
  componentDidMount() {
  },
  render() {
    var bracketName = 'foo'
    return <div>
      <Bracket bracketName={bracketName}/>
    </div>
  }
})

module.exports = App
