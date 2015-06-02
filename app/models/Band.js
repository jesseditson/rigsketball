var Model = require('mise-model');

var Band = module.exports = new Model('Band',{
  _id : {
    type : 'Any',
    disabled : true
  },
  name : {
    type : String,
    disabled : true,
    get : function(){
      return this.info ? this.info.Name : null;
    }
  },
  bio : {
    type : String,
    disabled : true,
    get : function(){
      return this.info ? this.info.ShortBio : null;
    }
  },
  avatar : {
    type : String,
    disabled : true,
    get : function(){
      return this.info ? this.info.ImageUrls[0] : null;
    }
  },
  info : {
    type : 'Any',
    disabled : true
  }
}
,'bands');
