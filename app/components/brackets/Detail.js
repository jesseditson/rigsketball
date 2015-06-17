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
  var className = 'oneline'
  if(matchDate) {
    var date = moment(matchDate)
    if(date.isAfter(moment().endOf('day'))){
      // not today, show the date
      dateString = date.format('M/D') + ' ' + date.format('h:mm')
      className = 'date'
    } else if(moment().isBefore(date)) {
      dateString = 'today ' + date.format('h:mm')
      className = 'date'
    } else if(moment().isBefore(date.add(30,'minutes'))) {
      dateString = 'LIVE'
    } else {
      dateString = 'FINAL'
    }
  }
  return {text: dateString, class: className}
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
      select: this.props.select,
      matchStates: {}
    }
  },
  currentTrackId: null,
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
  updatePlayerTime(currentTrack, trackPercent, isPlaying) {
    if (currentTrack && trackPercent) {
      if (currentTrack.id !== this.currentTrackId || this.playing !== isPlaying) {
        this.currentTrackId = currentTrack.id
        this.playing = isPlaying
        var self = this
        Object.keys(this.refs).forEach(function(r) {
          var m
          if (m = r.match(/^(.+)-playhead$/)) {
            var id = m[1]
            var playing = id == self.currentTrackId
            self.refs[r].getDOMNode().style.width = '0%'
            var list = self.refs[id + '-playcontrol'].getDOMNode().classList
            if (playing && isPlaying) {
              list.remove('play')
              list.add('pause')
            } else {
              list.add('play')
              list.remove('pause')
            }
          }
        })
      }
      var playheadRef = this.props.currentTrack.id + '-playhead'
      var playhead = this.refs[playheadRef]
      if (playhead) {
        playhead.getDOMNode().style.width = (trackPercent * 100) + '%'
      }
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
  loadBracket() {
    var self = this
    var loaded = function(err, bracket) {
      if (err || !bracket) return self.setState({error: err, bracket: false})
      self.setState({
        bracket: bracket,
        error: err,
        selectedRound : self.props.selectedRound || self.state.selectedRound || self.roundNums(bracket)[0]
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
  playBand(id) {
    if (this.props.playBand) {
      this.props.playBand(id)
    }
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
    var playhead = <div ref={band._id + '-playhead'} className="band-background-cover playhead"></div>
    var bandLinks = []
    // var bandLink = function(n) {
    //   var link = band[n]
    //   if (!/(https?:)?\/\//.test(link)) {
    //     switch (n) {
    //       case 'soundcloud':
    //         link = 'https://soundcloud.com/' + link
    //         break;
    //       case 'bandcamp':
    //         link = 'https://' + link + '.bandcamp.com'
    //         break;
    //     }
    //   }
    //   return <a href={link}><div className={n}></div></a>
    // }
    // if (band.soundcloud) bandLinks.push(bandLink('soundcloud'))
    // if (band.bandcamp) bandLinks.push(bandLink('bandcamp'))
    var info = {
      band: band,
      match: match,
      position: position,
      editable: editable
    }

    var placeholder = selectable
                    ? 'available'
                    : editable
                    ? 'none'
                    : 'TBD'

    return <div className={classes} key={match._id + position} style={style} onClick={this.bandClicked.bind(this, info)} onMouseMove={this.hoverBand} onMouseLeave={this.unhoverBand} onMouseEnter={this.enterBand}>
      {backgroundCover}
      {playhead}
      <p>{band.name || placeholder}</p>
      <div className="links">{bandLinks}</div>
      <span className="score">{match.scores[position]}</span>
      <div ref={band._id + '-playcontrol'} onClick={this.playBand.bind(this, band._id)}></div>
      {editControls}
      <div className="border-bottom"></div>
      <div className="border-right"></div>
    </div>
  },
  enterBand(evt) {
    var el = evt.currentTarget
    el.classList.add('animate')
    setTimeout(function() { el.classList.remove('animate') }, 400)
  },
  hoverBand(evt) {
    var el = evt.currentTarget
    try {
      var rect = el.getBoundingClientRect()
      var mousePos = evt.clientY - rect.top
      var pct = mousePos / rect.height
      el.style.backgroundPositionY = (pct * 100) + '%'
    } catch(e) {}
  },
  unhoverBand(evt) {
    var el = evt.currentTarget
    el.classList.add('animate')
    el.style.backgroundPosition = null
    setTimeout(function() { el.classList.remove('animate') }, 400)
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
  updateDate(match, date) {
    match.date = date.toString()
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
  toggleOpen(match, evt) {
    evt.preventDefault()
    var i = {}
    i[match._id] = !this.state.matchStates[match._id]
    this.setState({matchStates: i})
  },
  match(editable, match) {
    var info
    var date = match.date ? new Date(match.date) : null
    if (this.props.editMode) {
      info = <div className="date-picker">
        <DateTimePicker ref={match._id + '-date'} defaultValue={date} step={10} onChange={this.updateDate.bind(this, match)} />
        <input type="text" ref={match._id + '-location'} placeholder='location' defaultValue={match.location} onBlur={this.updateInfo.bind(this, match)} />
        <textarea ref={match._id + '-info'} defaultValue={match.info} placeholder='info' onBlur={this.updateInfo.bind(this, match)} />
      </div>
    } else {
      var bands
      if (match.bands[0] && match.bands[1]) {
        bands = <div className="vs">
          <h3>{match.bands[0].name}</h3>
          <span>vs</span>
          <h3>{match.bands[1].name}</h3>
        </div>
      }
      info = <div className="info">
        {bands}
        <a href="#" onClick={this.toggleOpen.bind(this, match)} className="close">✕</a>
        <h4>Date: <span>{match.date}</span></h4>
        <h4>Location: <span>{match.location}</span></h4>
        <p>{match.info}</p>
      </div>
    }

    var bubble = dateString(match.date)

    var classes = (this.props.editMode ? 'match-edit' : 'match') + (this.state.matchStates[match._id] ? ' open' : ' closed')

    return <div className={classes} key={match._id}>
      {this.band(match.bands[0], match, 0, editable)}
      {this.band(match.bands[1], match, 1, editable)}
      {info}
      <div className="bubble" onClick={this.toggleOpen.bind(this, match)}>
        <span className={bubble.class}>
          {bubble.text}
        </span>
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
      var text = 'Round of ' + (k * 2)
      switch(k) {
        case '16':
          text = 'First Round'
          break
        case '8':
          text = 'Sweat 16'
          break
        case '4':
          text = 'Elite 8'
          break
        case '2':
          text = 'Final Four'
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
