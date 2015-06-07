/** @jsx React.DOM */

var React = require('react')
var Band = require('../../models/rest/Band')
var request = require('superagent')
var async = require('async')

module.exports = React.createClass({
  getInitialState() {
    return {
      formError: null,
      loading: null,
      form: {},
      error: null,
      message: null
    }
  },
  initialForm(band) {
    band = band || this.props.band
    var form = {}
    if (band) {
      form = {
        nameValue: band.name,
        bioValue: band.bio,
        photoValue: band.photo,
        soundcloudValue: band.soundcloud,
        bandcampValue: band.bandcamp
      }
    }
    return form
  },
  componentDidMount() {
    this.setState({form: this.initialForm()})
  },
  validateURL(url, assert, cb) {
    if (!cb) {
      cb = assert
      assert = function(res) { return res.status === 200 }
    }
    cb(null, true)
    // TODO: make this work, fails because of XHR. Will need to move to a service and call locally.
    // if (!url) return cb(null, 'empty')
    // request
    //   .head(url)
    //   .end(function(err, res){
    //     if (err) return cb(err)
    //     cb(null, assert(res))
    //   })
  },
  validateImage(image, cb) {
    var timeout = 2000
    var timedOut = false, timer
    var img = new Image()
    img.onerror = img.onabort = function() {
        if (!timedOut) {
            clearTimeout(timer)
            cb(new Error('failed to fetch image.'))
        }
    };
    img.onload = function() {
        if (!timedOut) {
            clearTimeout(timer)
            cb(null, true)
        }
    };
    img.src = image
    timer = setTimeout(function() {
        timedOut = true
        cb(null, false)
    }, timeout)
  },
  saveNewBand() {
    if (this.state.loading) return
    var self = this
    var bandId = this.props.band ? this.props.band._id : null
    var newState = { form: {} }
    var name  =  React.findDOMNode(this.refs.bandName).value
    var bio = React.findDOMNode(this.refs.bandBio).value
    var photo = React.findDOMNode(this.refs.bandPhoto).value
    var soundcloud = React.findDOMNode(this.refs.bandSoundcloud).value
    var bandcamp = React.findDOMNode(this.refs.bandBandcamp).value
    if (name === '') {
      newState.formError = 'Invalid name.'
    } else if (bio.length < 2) {
      newState.formError = 'Please write a band bio.'
    } else {
      async.parallel({
        photo: this.validateImage.bind(this, photo),
        bandcamp: this.validateURL.bind(this, bandcamp),
        soundcloud: this.validateURL.bind(this, soundcloud)
      }, function(err, r) {
        newState.error = err
        if (!r.photo) {
          newState.formError = 'Invalid photo URL.'
        } else if (!r.bandcamp) {
          newState.formError = 'Invalid bandcamp URL.'
        } else if (!r.soundcloud) {
          newState.formError = 'Invalid soundcloud URL.'
        } else {
          // everything checks out.
          newState.loading = true
          newState.formError = null
          new Band({
            _id: bandId,
            name: name,
            bio: bio,
            photo: photo,
            soundcloud: soundcloud,
            bandcamp: bandcamp
          }).save(function(err, band) {
            self.setState({
              loading: false,
              formError: err && err.message,
              form: self.initialForm(self.props.band ? band : null),
              message: !err ? 'Successfully ' + (bandId ? 'updated' : 'created') + ' band "'+band.name+'".' : null
            })
            if (!err && self.props.onCreate) {
              self.props.onCreate(band)
            }
            setTimeout(function() {
              self.setState({message: null})
            }, 3000)
          })
        }
        self.setState(newState)
      })
    }
    this.setState(newState)
  },
  createBandForm() {
    return <div className="create-band">
      <p className="form-error">{this.state.formError}</p>
      <input type="text" ref="bandName" placeholder="band name" value={this.state.form.nameValue}/>
      <textarea ref="bandBio" placeholder="bio" value={this.state.form.bioValue}/>
      <input type="text" ref="bandPhoto" placeholder="band photo" value={this.state.form.photoValue}/>
      <input type="text" ref="bandSoundcloud" placeholder="soundcloud link" value={this.state.form.soundcloudValue}/>
      <input type="text" ref="bandBandcamp" placeholder="bandcamp link" value={this.state.form.bandcampValue}/>
      <button type="submit" onClick={this.saveNewBand} disabled={this.state.loading}>{this.state.loading ? 'saving...' : 'save'}</button>
    </div>
  },
  render() {
    var error = this.state.error
    var message = this.state.message
    return <div>
      <h5 className="error" style={{display: error ? 'block' : 'none'}}>{error}</h5>
      <h5 className="message" style={{display: message ? 'block' : 'none'}}>{message}</h5>
      {this.createBandForm()}
    </div>
  }
})
