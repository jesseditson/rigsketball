var Model = require('mise-model');

var Bracket = module.exports = new Model('Bracket',{
  _id : {
    type : 'Any',
    disabled : true
  },
  published : Boolean,
  // the total number of bands.
  poolSize : {
    type : Number,
    set : function(val){
      val = parseInt(val,10);
      if(!!(val % 2)){
        throw new Error('Bracket pool size must be divisible by 4.');
      }
      this._poolSize = val;
    },
    get : function(){
      return this._poolSize;
    }
  },
  rounds : {
    // key-value map, round number to matches. Generated when changing poolSize.
    type : 'Any',
    disabled : true
  },
  // name
  name : String
}
,'brackets');
