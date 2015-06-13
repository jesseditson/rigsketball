/** @jsx React.DOM */

var React = require('react')
var Bracket = require('./brackets/Detail')

var App = React.createClass({
  render() {
    var bracketName = 'pdxpopnow2015'
    return <div>
      <Bracket bracketName={bracketName} {...this.props}/>
    </div>
  }
})

module.exports = App
