/** @jsx React.DOM */

var React = require('react')
var Bracket = require('../../../models/rest/Bracket')
var Match = require('../../../models/rest/Match')
var async = require('async')

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
    }
  },
  loadBracket(id) {
    var self = this
    Bracket.one(id, function(err, bracket) {
      self.setState({bracket: bracket, error: err})
    })
  },
  band(band) {
    if (!band) {
      // TODO: make this autocomplete a band name and id I guess
      return <input type="text"/>
    } else {
      return <div className="band" key={band._id}></div>
    }
  },
  match(match) {
    return <div className="match" key={match._id}>
      {this.band(match.bands[0])}
      <span>vs</span>
      {this.band(match.bands[1])}
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
    console.log(this.state.bracket.toObject())
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
