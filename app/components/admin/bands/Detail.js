/** @jsx React.DOM */

var React = require('react')
var Bracket = require('../../../models/rest/Bracket')
var Match = require('../../../models/rest/Match')
var Band = require('../../../models/rest/Band')
var async = require('async')
var Typeahead = require('react-typeahead')

module.exports = React.createClass({
  getInitialState() {
    return {
      bracket: null,
      error: null
    }
  },
  componentDidMount() {
    if (this.props.id) {
      this.loadBracket(this.props.id)
      this.loadBands()
    }
  },
  loadBands() {
    Band.all(function(err, bands) {
      this.setState({bands: bands, error: err})
    })
  },
  loadBracket(id) {
    var self = this
    Bracket.one(id, function(err, bracket) {
      self.setState({bracket: bracket, error: err})
    })
  },
  selectBand(band, match, position) {
    debugger
  },
  band(band, match, position) {
    var bands = this.state.bands.map(function(band) { return band.name })
    return <div className="band" key={band._id}>
      <p>{band.name || 'none'}</p>
      <Typeahead options={bands} onOptionSelected={this.selectBand}/>
    </div>
  },
  match(match) {
    return <div className="match" key={match._id}>
      {this.band(match.bands[0], match, 0)}
      <span>vs</span>
      {this.band(match.bands[1], match, 1)}
    </div>
  },
  round(round, idx) {
    var matches = round.map(this.match)
    return <div className="round" key="{idx}">
        {matches}
      </div>
  },
  rounds() {
    if (!this.state.bracket) return;
    var self = this
    var rounds = this.state.bracket.rounds
    return Object.keys(rounds).map(function(k) {
      var round = rounds[k]
      return <div className="round">
        <h5>Round of {k}</h5>
        {self.round(round, k)}
      </div>
    })
  },
  render() {
    var bracket = this.state.bracket || {}
    var error = this.state.error
    return <div>
      <h5 className="error" style={{display: error ? 'block' : 'none'}}>{error}</h5>
      <h1>{bracket.name}</h1>
      {this.rounds()}
    </div>
  }
})
