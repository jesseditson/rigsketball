var Model = require('mise-model')

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
  // bands is an array of band _ids
  bands : {
    type : 'Any'
  },
  // an array of scores
  scores: {
    type: 'Any'
  },
  info : String,
  winner : {
    type : 'Any',
    get : function(){
      if(!this.bands || !this.bands[0] || !this.bands[1]) return false
      var band1Bye = this.bands[0]._id && this.bands[1]._id === 'bye'
      var band2Bye = this.bands[0]._id === 'bye' && this.bands[1]._id
      if(band1Bye || band2Bye){
        // bye round
        return band2Bye ? this.bands[1] : this.bands[0]
      }
      if(this.scores[0] === this.scores[1]) {
        return false
      }
      return parseInt(this.scores[0],10) > parseInt(this.scores[1],10) ? this.bands[0] : this.bands[1]
    },
    disabled :true
  }
}
,'matches')
