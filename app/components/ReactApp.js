/** @jsx React.DOM */

var React = require('react')

var ReactApp = React.createClass({
  getInitialState() {
    return {
      message: 'Hello there!'
    }
  },
  componentDidMount() {
    console.log('component mounted!')
  },
  render() {
    return <div>
      <p>{this.state.message}</p>
    </div>
  }
})

/* Module.exports instead of normal dom mounting */
module.exports = ReactApp
