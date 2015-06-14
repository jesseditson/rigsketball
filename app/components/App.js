/** @jsx React.DOM */

var React = require('react')
var Bracket = require('./brackets/Detail')
var Tumblr = require('./Tumblr')

var App = React.createClass({
  getInitialState() {
    return {
      bracketName: 'pdxpopnow2015',
      selectedPage: null,
      signupEnabled: this.props.signupEnabled || true
    }
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
      signupLink = <a className="lightbox-51626431524955" style={{cursor: 'pointer'}}>Sign up!</a>
    }
    return <div>
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
