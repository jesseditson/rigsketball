/** @jsx React.DOM */

var React = require('react')
var Bracket = require('../../models/rest/Bracket')
var Match = require('../../models/rest/Match')
var Band = require('../../models/rest/Band')
var async = require('async')
var Typeahead = require('react-typeahead').Typeahead
var DateTimePicker = require('react-widgets/lib/DateTimePicker')
var moment = require('moment')

var dateString = function(matchDate){
  var dateString = 'TBD'
  if(matchDate) {
    var date = moment(matchDate)
    // skip this, let's show the time always
    if(false && date.isAfter(moment().endOf('day'))){
      // not today, show the date
      dateString = date.format('M/D')
    } else if(moment().isBefore(date)) {
      dateString = date.format('H:mm')
    } else if(moment().isBefore(date.add(30,'minutes'))) {
      dateString = 'LIVE'
    } else {
      dateString = 'FINAL'
    }
  }
  return dateString
}

module.exports = React.createClass({
  getInitialState() {
    return {
      bracket: null,
      error: null,
      bands: [],
      bandsMap: {},
      selectedRound: null,
      bracketMode: false,
      modal: {},
      select: this.props.select
    }
  },
  getDefaultProps() {
    return {
      editMode: false,
      selectedRound: null
    }
  },
  componentDidMount() {
    this.loadBracket()
    this.loadBands()
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
  loadBracket() {
    var self = this
    var loaded = function(err, bracket) {
      if (err || !bracket) return self.setState({error: err, bracket: false})
      self.setState({
        bracket: bracket,
        error: err,
        selectedRound : self.props.selectedRound || self.roundNums(bracket)[0]
      })
    }
    if (this.props.id) {
      Bracket.one(this.props.id, loaded)
    } else if (this.props.bracketName) {
      Bracket.byName(this.props.bracketName, loaded)
    }
  },
  saveMatch(match) {
    var self = this
    new Match(match).save(function(err) {
      if (err) return self.setState({error: err})
      self.loadBracket()
      self.loadBands()
    })
  },
  updateScore(match, position, e) {
    var score = parseInt(e.target.value)
    if (isNaN(score)) score = null
    if (match.scores[position] != score) {
      match.scores[position] = score
      this.saveMatch(match)
    }
  },
  selectBand(match, position, bandName) {
    var band = this.state.bandsMap[bandName]
    match.bands[position] = band._id
    this.saveMatch(match)
  },
  removeBand(match, position, e) {
    e.preventDefault()
    match.bands[position] = null
    this.saveMatch(match)
  },
  band(band, match, position, editable) {
    var bands = this.state.bands
    band = band || {}
    var editControls
    if (this.props.editMode && editable) {
      var remove
      if (band._id) {
        remove = <a href="#" onClick={this.removeBand.bind(this, match, position)}>Remove</a>
      }
      editControls = <div>
        <Typeahead options={bands} onOptionSelected={this.selectBand.bind(this, match, position)} placeholder="change band"/>
        {remove}
        <input type="number" defaultValue={match.scores[position]} placeholder="score" onBlur={this.updateScore.bind(this, match, position)}/>
      </div>
    }
    var selectable = this.state.select && editable;
    var classes = 'band band' + (position+1) + (selectable ? ' selectable' : '')
    var style = {}
    var backgroundCover = null
    if (band.photo) {
      style.backgroundImage = "url('"+band.photo+"')"
      backgroundCover = <div className="band-background-cover"></div>
    }
    var bandLinks = []
    var bandLink = function(n) {
      var link = band[n]
      if (!/(https?:)?\/\//.test(link)) {
        switch (n) {
          case 'soundcloud':
            link = 'https://soundcloud.com/' + n
            break;
          case 'bandcamp':
            link = 'https://' + n + '.bandcamp.com'
            break;
        }
      }
      return <a href={link}><div className={n}></div></a>
    }
    if (band.soundcloud) bandLinks.push(bandLink('soundcloud'))
    if (band.bandcamp) bandLinks.push(bandLink('bandcamp'))
    var info = {
      band: band,
      match: match,
      position: position,
      editable: editable
    }

    var placeholder = selectable
                    ? 'available'
                    : editable
                    ? 'TBD'
                    : 'none'

    return <div className={classes} key={match._id + position} style={style} onClick={this.bandClicked.bind(this, info)}>
      {backgroundCover}
      <p>{band.name || placeholder}</p>
      <div className="links">{bandLinks}</div>
      <span className="score">{match.scores[position]}</span>
      {editControls}
      <div className="border-bottom"></div>
      <div className="border-right"></div>
    </div>
  },
  bandClicked(info, evt) {
    if (this.state.select && !info.band.name) {

      var band = this.state.select
      var match = info.match
      var self = this

      var nextRounds = []


      this.setState({modal:{
        message: "By selecting this spot, you're letting us know you'll be free to play all the subsequent rounds if you win.",
        confirm: "Got it",
        cancel: "Nevermind",
        action: function() {
          match.bands[info.position] = band._id
          self.setState({select: null})
          band.hasMatch = true
          new Band(band).save(function(err) {
            if (err) return self.setState({error: err, modal: {}})
            self.setState({modal: {}})
            self.saveMatch(match)
          })
        }
      }})
    } else {
      // TODO: expand info
    }
    evt.preventDefault()
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
    if (this.props.editMode) {
      var date = match.date ? new Date(match.date) : null
      editControls = <div className="date-picker">
        <DateTimePicker ref={match._id + '-date'} defaultValue={date} onChange={this.updateDate.bind(this, match)} />
        <input type="text" ref={match._id + '-location'} placeholder='location' defaultValue={match.location} onBlur={this.updateInfo.bind(this, match)} />
        <textarea ref={match._id + '-info'} defaultValue={match.info} placeholder='info' onBlur={this.updateInfo.bind(this, match)} />
      </div>
    }

    var bubbleText = dateString(match.date)

    var classes = this.props.editMode ? 'match-edit' : 'match'

    return <div className={classes} key={match._id}>
      {this.band(match.bands[0], match, 0, editable)}
      {this.band(match.bands[1], match, 1, editable)}
      {editControls}
      <div className="bubble">
        {bubbleText}
      </div>
    </div>
  },
  roundNums(bracket) {
    var rounds = (bracket || this.state.bracket).rounds
    return Object.keys(rounds).sort(function(a, b) {
      return parseInt(a) > parseInt(b) ? -1 : 1
    })
  },
  round(round, num, editable) {
    var matches = round.map(this.match.bind(this, editable))
    var right = []
    var left = matches.filter(function(m, i) {
      if (i % 2) {
        return true
      }
      right.push(m)
    })
    var className = "round round" + num
    return <div className={className} key={'round' + num}>
        <div className="left row">
          {left}
        </div>
        <div className="right row">
          {right}
        </div>
      </div>
  },
  rounds(rounds) {
    var self = this
    var rounds = this.state.bracket.rounds
    var roundNums = this.roundNums()
    var renderRound = function(k) {
      var firstRound = roundNums[0] === k
      var round = rounds[k]
      return self.round(round, k, firstRound)
    }
    var rendered
    if (this.state.bracketMode) {
      rendered = roundNums.map(renderRound)
    } else {
      rendered = renderRound(this.state.selectedRound)
    }
    return <div className="rounds">
      {rendered}
    </div>
  },
  selectRound(round, e) {
    this.setState({selectedRound: round})
    if (e) e.preventDefault()
  },
  roundNav() {
    if (this.state.bracketMode) return
    var self = this
    var rounds = this.state.bracket.rounds
    var bracketName = this.state.bracket.name
    var items = this.roundNums().map(function(k) {
      var link = '/brackets/' + bracketName + '/rounds/' + k
      var text = 'Round of ' + k
      switch(k) {
        case '16':
          text = 'Sweet 16'
          break
        case '8':
          text = 'Elite 8'
          break
        case '4':
          text = 'Final Four'
          break
        case '2':
          text = 'Semifinal'
          break
        case '1':
          text = 'Final'
          break
      }
      var classes = self.state.selectedRound === k ? 'selected' : null
      return <a href="#" className={classes} onClick={self.selectRound.bind(self, k)}>{text}</a>
    })
    return <div className="round-nav">
      {items}
    </div>
  },
  signupMessage() {
    if (!this.state.select) return
    var band = this.state.select
    return <div className="signup-message">
      <h3>Hey {band.name}, choose a match to sign up</h3>
    </div>
  },
  modal() {
    if (!this.state.modal.message || !this.state.modal.action) return
    var title
    if (this.state.modal.title) {
      title = <h3>{this.state.modal.title}</h3>
    }
    var self = this
    var cancel = function() {
      self.setState({modal: {}})
    }
    return <div className="modal">
      <div>
        {title}
        <p>{this.state.modal.message}</p>
        <div className="buttons">
          <button className="button cancel" onClick={cancel}>{this.state.modal.cancel || "Cancel"}</button>
          <button className="button confirm" onClick={this.state.modal.action}>{this.state.modal.confirm || "OK"}</button>
        </div>
      </div>
    </div>
  },
  render() {
    if (this.state.bracket === null) return <div><h5>Loading bracket...</h5></div>
    if (!this.state.bracket) return <div><h5>Bracket Not Found.</h5></div>
    var bracket = this.state.bracket || {}
    var error = this.state.error

    return <div className="bracket">
      {this.signupMessage()}
      {this.roundNav()}
      <h5 className="error" style={{display: error ? 'block' : 'none'}}>{error}</h5>
      {this.rounds()}
      {this.modal()}
    </div>
  }
})
