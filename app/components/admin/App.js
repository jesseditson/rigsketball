/** @jsx React.DOM */

var React = require('react')
var BracketMatches = require('./BracketMatches')

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
    }
    return <div>{mainView}</div>
  }
})

module.exports = App
