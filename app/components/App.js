/** @jsx React.DOM */

var React = require('react')
var Bracket = require('./brackets/Detail')
var Tumblr = require('./Tumblr')
var Site = require('../models/rest/Site')
var moment = require('moment')
var Player = require('./player/Player')

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
  componentDidMount() {
    var self = this
    Site.site(function(err, site) {
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
  randomizeTrack() {
    this.setState({ currentTrack : this.randomTrack() })
  },
  randomTrack(tracks) {
    tracks = tracks || this.state.tracks
    var keys = Object.keys(tracks)
    var trackNum = Math.floor(Math.random() * keys.length)
    return tracks[keys[trackNum]]
  },
  render() {
    var page
    switch (this.state.selectedPage) {
      case 'bracket':
        page = <Bracket bracketName={this.state.bracketName} {...this.props}/>
        break
      default:
        page = <Tumblr {...this.props} />
        break
    }
    var self = this
    var className = function(n) {
      return self.state.selectedPage === n ? 'selected' : ''
    }
    var signupLink
    if (this.state.signupEnabled) {
      signupLink = <a style={{cursor: 'pointer'}} onClick={this.showForm}>Sign up!</a>
    }
    var currentTrack = this.state.currentTrack
    var player
    if (currentTrack) {
      // player = <div className="player">
      //   <Player src={currentTrack.file} title={currentTrack.name} autoPlay={true} artist={currentTrack.band} artwork={currentTrack.cover}/>
      //   <a onClick={this.randomizeTrack}>↺</a>
      // </div>
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
