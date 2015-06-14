/** @jsx React.DOM */

var React = require('react')
var request = require('superagent')
var moment = require('moment')

module.exports = React.createClass({
  getInitialState() {
    return {
      tumblrData: this.props.tumblrData || null
    }
  },
  componentDidMount() {
    var self = this
    request
      .get('/tumblr/posts')
      .end(function(err,res){
        if(err || !res.body){
          console.error(err || "invalid response from tumblr endpoint.");
        } else {
          self.setState({tumblrData: res.body})
        }
      })
  },
  posts() {
    if (!this.state.tumblrData || !this.state.tumblrData.posts) return []
    var posts = this.state.tumblrData.posts.map(function(post){
      post.html = post.caption || post.body
      post.showBody = !!post.html
      post.friendlyDate = moment(new Date(post.date)).fromNow()
      try {
        post.image = post.photos[0].original_size.url
        post.showImage = true
      } catch(e){
        post.showImage = false
      }
      return post
    })
    return posts
  },
  render() {
    var posts = this.posts()
    if (posts.length) {
      posts = posts.map(function(post) {
        var image
        if (post.image) {
          image = <div className="image">
            <img src={post.image}/>
          </div>
        }
        return <div className="post">
          <h4>{post.title}</h4>
          <span className="date">{post.friendlyDate}</span>
          {image}
          <div className="post-body" dangerouslySetInnerHTML={{__html: post.html}}></div>
          <a className="post-url" href={post.post_url}>view on tumblr</a>
          <div style={{clear:"both"}}></div>
          <div className="border-bottom"></div>
          <div className="border-right"></div>
        </div>
      })
    }
    return <div className="blog">
      {posts}
    </div>
  }
})
