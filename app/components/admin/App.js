/** @jsx React.DOM */

var React = require('react')
var BracketMatches = require('../brackets/BracketMatches')
var Bands = require('../bands/Bands')
var Site = require('../../models/rest/Site')
var DateTimePicker = require('react-widgets/lib/DateTimePicker')
var moment = require('moment')

var App = React.createClass({
  getInitialState() {
    return {
      site: {},
      error: null,
      bracketMode: 'disabled'
    }
  },
  componentDidMount() {
    var self = this
    Site.site(function(err, site) {
      self.setState({error: err, site: site || new Site({name: 'main'})})
    })
  },
  updateDate(date, dateStr) {
    var self = this
    var site = this.state.site
    site.signupDate = dateStr
    site.save(function(err, site) {
      self.setState({error: err, site: site})
    })
  },
  signupDate() {
    var defaultDate = this.state.site.signupDate ? new Date(this.state.site.signupDate) : null
    var humanDate
    if (defaultDate) {
      humanDate = moment(defaultDate).format('MMMM Do YYYY, [at] h:mm:ss a')
    }
    return <div className="available-date">
      <p>Sign ups will be available to the public on {humanDate}:</p>
      <DateTimePicker ref={'availableDate'} defaultValue={defaultDate} onChange={this.updateDate} />
    </div>
  },
  render() {
    var mainView = <h1>Admin</h1>
    if (/brackets(\/|$)/.test(this.props.path)) {
      mainView = <BracketMatches {...this.props} {...this.state} />
    } else if (/bands(\/|$)/.test(this.props.path)) {
      mainView = <Bands {...this.props} {...this.state}/>
    }
    var error
    if (this.state.error) {
      error = <p className="error">{this.state.error.message}</p>
    }
    return <div>
      {error}
      {this.signupDate()}
      {mainView}
    </div>
  }
})

module.exports = App
