/** @jsx React.DOM */

var React = require('react')
var Site = require('../models/rest/Site')
var Band = require('../models/rest/Band')

var App = React.createClass({
  getInitialState() {
    return {
      bracketName: 'pdxpopnow2015',
      site: this.props.site || {},
      tracks: this.props.tracks || {},
      bands: this.props.bands || []
    }
  },
  componentDidMount() {
    var self = this
    Site.site(function(err, site) {
      self.setState({
        error: err,
        site: site,
        tracks: site.tracks
      })
    })
    Band.all(function(err, bands) {
      self.setState({error: err, bands: bands})
    })
  },
  render() {

    if (!this.state.bands.length || !Object.keys(this.state.tracks).length) {
      return <h2>Loading...</h2>
    }

    var self = this
    var bands = this.state.bands.map(function(band) {
      var track = self.state.tracks[band._id]
      var trackEl = <span>No track for this band.</span>
      if (track) {
        trackEl = <a href={track.file}>{track.name}</a>
      }
      return <li>
        <h4>{band.name}</h4>{trackEl}
      </li>
    })

    return <div>
      <a href="/comp-tracks/download"><h3>Download all as zip</h3></a>
      <hr/>
      <ul>
        {bands}
      </ul>
    </div>
  }
})

module.exports = App
