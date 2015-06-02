var Model = require('mise-model');

var Match = module.exports = new Model('Match',{
  bracket : {
    type : 'Any',
    disabled : true
  },
  _id : {
    type : 'Any',
    disabled : true
  },
  date : String,
  location : String,
  // bands is an array of objects, which look like { _id : id, score : score }
  bands : {
    type : 'Any'
  },
  info : String,
  winner : {
    type : 'Any',
    get : function(){
      if(!this.bands || !this.bands[0] || !this.bands[1]) return false;
      var band1Bye = this.bands[0]._id && this.bands[1]._id === 'bye';
      var band2Bye = this.bands[0]._id === 'bye' && this.bands[1]._id;
      if(band1Bye || band2Bye){
        // bye round
        return band2Bye ? this.bands[1] : this.bands[0];
      }
      if(this.bands[0].score === this.bands[1].score) {
        return false;
      }
      return parseInt(this.bands[0].score,10) > parseInt(this.bands[1].score,10) ? this.bands[0] : this.bands[1];
    },
    disabled :true
  }
}
,'matches');
