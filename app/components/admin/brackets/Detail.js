/** @jsx React.DOM */

var React = require('react')
var Bracket = require('../../../models/rest/Bracket')
var Match = require('../../../models/rest/Match')
var Band = require('../../../models/rest/Band')
var async = require('async')
var Typeahead = require('react-typeahead').Typeahead
var DateTimePicker = require('react-widgets/lib/DateTimePicker')

module.exports = React.createClass({
  getInitialState() {
    return {
      bracket: null,
      error: null,
      bands: [],
      bandsMap: {},
      editMode: true
    }
  },
  componentDidMount() {
    if (this.props.id) {
      this.loadBracket(this.props.id)
      this.loadBands()
    }
  },
  loadBands() {
    var self = this
    Band.all(function(err, bands) {
      var bandsMap = {}
      if (bands.length) {
        bandsMap = bands.reduce(function(o, c, idx) {
          var key = c.name;
          // uniqueify duplicate band names
          if (o[key]) {
            var nstr = c.name.match(/\s\((\d+)\)$/)
            var n = 1
            if (nstr && nstr[1]) {
              n = parseInt(nstr[1]) + 1
            }
            key = c.name + ' ('+n+')'
            bands[idx].name = key
          }
          o[key] = c
          return o
        }, {})
      }
      self.setState({
        bandsMap: bandsMap,
        bands: bands.map(function(band) { return band.name }),
        error: err
      })
    })
  },
  loadBracket(id) {
    var self = this
    Bracket.one(id, function(err, bracket) {
      self.setState({bracket: bracket, error: err})
    })
  },
  saveMatch(match) {
    if (!this.state.editMode) return
    var self = this
    new Match(match).save(function(err) {
      if (err) return self.setState({error: err})
      self.loadBands()
    })
  },
  updateScore(match, position, e) {
    var score = parseInt(e.target.value)
    if (!isNaN(score) && match.scores[position] != score) {
      match.scores[position] = score
      this.saveMatch(match)
    }
  },
  selectBand(match, position, bandName) {
    var band = this.state.bandsMap[bandName]
    match.bands[position] = band._id
    this.saveMatch(match)
  },
  band(band, match, position, editable) {
    var bands = this.state.bands
    band = band || {}
    var editControls
    if (this.state.editMode && editable) {
      editControls = <div>
        <Typeahead options={bands} onOptionSelected={this.selectBand.bind(this, match, position)} placeholder="change band"/>
        <input type="number" defaultValue={match.scores[position]} placeholder="score" onBlur={this.updateScore.bind(this, match, position)}/>
      </div>
    }
    return <div className="band" key={match._id + position}>
      <p>{band.name || 'none'}</p>
      {editControls}
    </div>
  },
  updateDate(match, date, dateStr) {
    match.date = dateStr
    this.saveMatch(match)
  },
  updateInfo(match) {
    var location = React.findDOMNode(this.refs[match._id + '-location']).value
    var info = React.findDOMNode(this.refs[match._id + '-info']).value
    var changed
    if (match.location !== location) {
      changed = true
      match.location = location
    }
    if (match.info !== info) {
      changed = true
      match.info = info
    }
    if (changed) {
      this.saveMatch(match)
    }
  },
  match(editable, match) {
    var editControls
    if (this.state.editMode) {
      var date = match.date ? new Date(match.date) : null
      editControls = <div>
        <DateTimePicker ref={match._id + '-date'} defaultValue={date} onChange={this.updateDate.bind(this, match)} />
        <input type="text" ref={match._id + '-location'} placeholder='location' defaultValue={match.location} onBlur={this.updateInfo.bind(this, match)} />
        <textarea ref={match._id + '-info'} defaultValue={match.info} placeholder='info' onBlur={this.updateInfo.bind(this, match)} />
      </div>
    }
    return <div className="match" key={match._id}>
      {this.band(match.bands[0], match, 0, editable)}
      <span>vs</span>
      {this.band(match.bands[1], match, 1, editable)}
      {editControls}
    </div>
  },
  round(round, num, editable) {
    var matches = round.map(this.match.bind(this, editable))
    return <div className="round" key={'round' + num}>
        {matches}
      </div>
  },
  rounds() {
    if (!this.state.bracket) return;
    var self = this
    var rounds = this.state.bracket.rounds

    var roundNums = Object.keys(rounds).sort(function(a, b) {
      return parseInt(a) > parseInt(b) ? -1 : 1
    })

    return roundNums.map(function(k, idx) {
      var round = rounds[k]
      return <div className="round">
        <h5>Round of {k}</h5>
        {self.round(round, k, idx === 0)}
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
