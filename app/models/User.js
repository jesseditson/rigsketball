var Model = require('mise-model');

var User = module.exports = new Model('User',{
  _id : {
    type : 'Any',
    disabled : true
  },
  identifier : {
    type : String
  },
  password : {
    type : String
  }
}
,'users');
