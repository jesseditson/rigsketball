/** @jsx React.DOM */

var React = require('react')
var App = require('./components/ReactApp')

var mountNode = document.getElementById("main-mount")

React.render(<App/>, mountNode)
