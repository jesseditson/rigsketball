/** @jsx React.DOM */

var React = require('react')
var Bracket = require('../../models/rest/Bracket')

module.exports = React.createClass({
  getInitialState() {
    return {
      formError: null,
      loading: null,
      form: {},
      brackets: [],
      error: null
    }
  },
  componentDidMount() {
    this.reload()
  },
  reload() {
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
        self.reload()
      })
      newState.loading = true
      newState.formError = null
    }
    this.setState(newState)
  },
  deleteBracket(id) {
    if (confirm("Are you sure you want to delete this bracket? You can't undo this action.")) {
      var self = this
      Bracket.delete(id, function(err) {
        self.setState({error: err && err.message})
        self.reload()
      })
    }
  },
  createBracketForm() {
    return <div className="create-bracket">
      <h4>New Bracket</h4>
      <p className="form-error">{this.state.formError}</p>
      <input type="text" ref="bracketName" placeholder="bracket name" value={this.state.form.nameValue}/>
      <input type="number" ref="poolSize" placeholder="pool size" value={this.state.form.poolValue}/>
      <button type="submit" onClick={this.saveNewBracket} disabled={this.state.loading}>{this.state.loading ? 'saving...' : 'save'}</button>
    </div>
  },
  bracketList() {
    var self = this
    var brackets = this.state.brackets.map(function(b, idx) {
      var link = '/admin/brackets/' + b._id
      return <li key={b._id}><a href={link}>{b.name}</a> <a onClick={self.deleteBracket.bind(null,b._id)}>delete</a></li>
    })
    return <ul>{brackets}</ul>
  },
  render() {
    var error = this.state.error
    return <div>
      <h5 className="error" style={{display: error ? 'block' : 'none'}}>{error}</h5>
      {this.createBracketForm()}
      {this.bracketList()}
    </div>
  }
})
