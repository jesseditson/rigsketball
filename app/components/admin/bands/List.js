/** @jsx React.DOM */

var React = require('react')
var Band = require('../../../models/rest/Band')
var Create = require('./Create')

module.exports = React.createClass({
  getInitialState() {
    return {
      formError: null,
      loading: null,
      form: {},
      bands: [],
      error: null
    }
  },
  componentDidMount() {
    this.reload()
  },
  reload() {
    var self = this
    Band.all(function(err, bands) {
      self.setState({bands: bands, error: err})
    })
  },
  deleteBand(id) {
    var self = this
    Band.delete(id, function(err) {
      self.setState({error: err && err.message})
      self.reload()
    })
  },
  bandsList() {
    var self = this
    var bands = this.state.bands.map(function(b, idx) {
      var link = '/api/bands/' + b._id
      return <li key={b._id}><a href={link}>{b.name}</a> <a onClick={self.deleteBand.bind(null,b._id)}>delete</a></li>
    })
    return <ul>{bands}</ul>
  },
  render() {
    var error = this.state.error
    return <div>
      <h5 className="error" style={{display: error ? 'block' : 'none'}}>{error}</h5>
      <Create onCreate={this.reload}/>
      {this.bandsList()}
    </div>
  }
})
