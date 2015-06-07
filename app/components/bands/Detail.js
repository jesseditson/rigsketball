/** @jsx React.DOM */

var React = require('react')
var Band = require('../../models/rest/Band')
var Create = require('./Create')

module.exports = React.createClass({
  getInitialState() {
    return {
      band: null,
      error: null
    }
  },
  componentDidMount() {
    if (this.props.id) {
      this.loadBand()
    }
  },
  loadBand() {
    var bandId = this.props.id
    var self = this
    Band.one(bandId, function(err, band) {
      self.setState({band: band, error: err})
    })
  },
  render() {
    if (!this.state.band) return <div>Unknown Band</div>
    var band = this.state.band
    var error = this.state.error
    return <div>
      <h5 className="error" style={{display: error ? 'block' : 'none'}}>{error}</h5>
      <h1>{band.name}</h1>
      <Create band={band}/>
    </div>
  }
})
