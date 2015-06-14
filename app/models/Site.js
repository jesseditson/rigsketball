var Model = require('mise-model');

var Site = module.exports = new Model('Site',{
  _id : {
    type : 'Any',
    disabled : true
  },
  name: {
    type: String
  },
  signupDate: {
    type: String
  }
}
,'sites');
