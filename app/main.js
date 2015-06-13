/** @jsx React.DOM */

var React = require('react')
var App = require('./components/App')

var mountNode = document.getElementById("main-mount")

var props = {}
try {
  props = JSON.parse(mountNode.attributes.getNamedItem('data-props').value)
} catch(e) {
  console.error('unable to parse props.')
  throw new Error(e)
} finally {
  console.log('starting app with:', props)
  React.render(<App {...props}/>, mountNode)
}
