/** @jsx React.DOM */

var React = require('react')
var Bracket = require('./brackets/Detail')
var Tumblr = require('./Tumblr')
var Site = require('../models/rest/Site')
var moment = require('moment')
var Player = require('./player/Player')
var window = require("global/window")

var App = React.createClass({
  getInitialState() {
    return {
      bracketName: 'pdxpopnow2015',
      selectedPage: null,
      signupEnabled: this.props.signupEnabled || false,
      site: {},
      tracks: {},
      currentTrack: null
    }
  },
  playedTracks: {},
  componentDidMount() {
    var self = this
    Site.site(function(err, site) {
      if (err || !site) {
        console.warn('site not found ', err && err.message, ' defaulting to not allowing signups.')
        site = new Site({name: 'main', signupDate: new Date(), full: true})
      }
      var signupEnabled = self.props.signupEnabled
      var signupDate = moment(new Date(site.signupDate))
      if (signupDate.isBefore(moment(new Date()))) {
        signupEnabled = !site.full
      }
      self.setState({
        error: err,
        site: site,
        signupEnabled: signupEnabled,
        tracks: site.tracks,
        currentTrack: self.randomTrack(site.tracks)
      })
      if (self.props.signupEnabled) {
        self.showForm()
      }
    })
  },
  componentWillMount() {
    var ns = {}
    if (this.props.path) {
      var m = this.props.path.match(/^([^\/]+)/)
      if (m) {
        ns.selectedPage = m[1]
      }
    }
    if (this.props.select) {
      ns.selectedPage = 'bracket'
    }
    this.setState(ns)
  },
  selectPage(page, evt) {
    evt.preventDefault()
    window.history.pushState({}, page, page)
    if (this.state.selectedPage !== page) {
      this.setState({selectedPage: page})
    }
  },
  showForm() {
    window.JFL_51626431524955.showForm()
  },
  trackFinished() {
    this.shouldPlayNext = true
    this.randomizeTrack()
  },
  randomizeTrack() {
    this.setState({ currentTrack : this.randomTrack() })
  },
  randomTrack(tracks) {
    tracks = tracks || this.state.tracks
    var keys = Object.keys(tracks)
    var trackNum = Math.floor(Math.random() * keys.length)
    var id = keys[trackNum]
    if (Object.keys(this.playedTracks).length === keys.length) {
      this.playedTracks = {}
    }
    if (this.playedTracks[id]) {
      return this.randomTrack(tracks)
    } else {
      this.playedTracks[id] = true
      return tracks[id]
    }
  },
  playBand(id) {
    var next = this.state.tracks[id]
    if (next.id === this.state.currentTrack.id) {
      this.refs.player.toggle()
    } else if (next) {
      this.setState({currentTrack: next})
    }
    this.shouldPlayNext = true
    this.playheadUpdated(this.refs.player.state)
  },
  componentDidUpdate() {
    var self = this
    setTimeout(function() {
      if (self.refs.player) {
        if (self.shouldPlayNext) self.refs.player.setPlaying(true)
        self.refs.player.sync()
      }
      self.shouldPlayNext = false
    }, 100)
  },
  playheadUpdated: function(opts) {
    if (this.refs.bracket && this.refs.player) {
      this.refs.bracket.updatePlayerTime(this.state.currentTrack, opts.position / opts.duration, this.refs.player.state.playing)
    }
  },
  render() {
    var self = this
    var className = function(n) {
      return self.state.selectedPage === n ? 'selected' : ''
    }
    var signupLink
    if (this.state.signupEnabled) {
      signupLink = <a style={{cursor: 'pointer'}} onClick={this.showForm}>Sign up!</a>
    }
    var currentTrack = this.state.currentTrack
    var player, playerEl
    if (currentTrack) {
      playerEl = <Player ref='player' src={currentTrack.file} title={currentTrack.name} autoPlay={true} onEnd={this.trackFinished} artist={currentTrack.band} artwork={currentTrack.cover} onPlayhead={this.playheadUpdated}/>
      player = <div className="player">
        {playerEl}
        <a className="random" onClick={this.randomizeTrack}>▶▶</a>
      </div>
    }

    var page
    switch (this.state.selectedPage) {
      case 'bracket':
        var bracketMode = false
        if (/bracket\/wide(\/|$)/.test(window.location && window.location.pathname)) bracketMode = true
        page = <Bracket ref="bracket" bracketName={this.state.bracketName} playBand={this.playBand} {...this.props} {...this.state} bracketMode={bracketMode}/>
        break
      default:
        page = <Tumblr {...this.props} />
        break
    }

    return <div>
      {player}
      <nav>
        <a href="/blog" onClick={this.selectPage.bind(this, 'blog')} className={className('blog')}>blog</a>
        <a href="/bracket" onClick={this.selectPage.bind(this, 'bracket')} className={className('bracket')}>bracket</a>
        {signupLink}
      </nav>
      {page}
    </div>
  }
})

module.exports = App
