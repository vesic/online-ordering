var mongoose = require('mongoose');

var Restaraunt = new mongoose.Schema({
  name: String,
  geo: {
    type: { type: String },
    coordinates: [Number],
  }
});

Restaraunt.index({ geo : '2dsphere' });

// Restaraunt.pre('save', function(next) {
//     this.geo = this.geo.map(function(g) {
//       console.log(g, parseFloat(g).toFixed(5));
//         return parseFloat(g).toFixed(5); 
//     });
//   console.log('works');
//   next();
// });

module.exports = mongoose.model('Restaraunt', Restaraunt);