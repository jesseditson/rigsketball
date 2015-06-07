/** @jsx React.DOM */

var React = require('react')
var BracketMatches = require('./brackets/BracketMatches')
var Bands = require('./bands/Bands')

var App = React.createClass({
  getInitialState() {
    return {}
  },
  componentDidMount() {

  },
  render() {
    var mainView = <h1>Admin</h1>
    if (/brackets(\/|$)/.test(this.props.path)) {
      mainView = <BracketMatches {...this.props}/>
    } else if (/bands(\/|$)/.test(this.props.path)) {
      mainView = <Bands {...this.props}/>
    }
    return <div>{mainView}</div>
  }
})

module.exports = App
