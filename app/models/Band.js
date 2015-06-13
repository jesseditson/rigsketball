var Model = require('mise-model');

var Band = module.exports = new Model('Band',{
  _id : {
    type : 'Any',
    disabled : true
  },
  name : {
    type : String
  },
  bio : {
    type : String
  },
  photo : {
    type : String
  },
  // false if this band needs a first match selection
  hasMatch : {
    type: Boolean
  },
  // a link to a track
  track: {
    type: String
  },
  // soundcloud username
  soundcloud: {
    type: String
  },
  // bandcamp username
  bandcamp: {
    type: String
  },
  // the jotform submission
  submission: {
    type: 'Any'
  }
}
,'bands');
