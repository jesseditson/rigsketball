/** @jsx React.DOM */

var React = require('react')
var Bracket = require('../../models/rest/Bracket')

module.exports = React.createClass({
  getInitialState() {
    return {
      form: {},
      brackets: []
    }
  },
  componentDidMount() {
    var self = this
    Bracket.all(function(err, brackets) {
      if (err) throw err
      self.setState({brackets: brackets})
    })
  },
  saveNewBracket() {
    if (this.state.loading) return
    var newState = { form: {} }
    var name = newState.form.nameValue =  React.findDOMNode(this.refs.bracketName).value
    var poolSize = newState.form.poolValue = React.findDOMNode(this.refs.poolSize).value
    if (name === '') {
      newState.formError = 'Invalid name'
    } else if (poolSize === 0 || (poolSize % 2)) {
      newState.formError = 'Pool size must be divisible by 2.'
    } else {
      var self = this
      new Bracket({name: name, poolSize: poolSize}).save(function(err, bracket) {
        self.setState({loading: false, formError: err && err.message, form: {}})
      })
      newState.loading = true
      newState.formError = null
    }
    this.setState(newState)
  },
  createBracketForm() {
    return <div className="create-bracket">
      <h4>New Bracket</h4>
      <p className="form-error">{this.state.formError}</p>
      <input type="text" ref="bracketName" placeholder="bracket name" value={this.state.form.nameValue} readOnly/>
      <input type="number" ref="poolSize" placeholder="pool size" value={this.state.form.poolValue} readOnly/>
      <button type="submit" onClick={this.saveNewBracket} disabled={this.state.loading}>{this.state.loading ? 'saving...' : 'save'}</button>
    </div>
  },
  bracketList() {
    var brackets = this.state.brackets.map(function(b, idx) {
      var link = '/api/brackets/' + b._id
      return <li key={b._id}><a href={link}>{b.name}</a></li>
    })
    return <ul>{brackets}</ul>
  },
  render() {
    return <div>
      <h1>Brackets & Matches</h1>
      {this.createBracketForm()}
      {this.bracketList()}
    </div>
  }
})
