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
  soundcloud: {
    type: String
  },
  bandcamp: {
    type: String
  }
}
,'bands');
