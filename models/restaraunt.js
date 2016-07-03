var mongoose = require('mongoose');

var Restaraunt = new mongoose.Schema({
  name: String,
  geo: {
    type: [Number],
    index: '2d'
  }
});

// Restaraunt.index({ location : '2dsphere' });

module.exports = mongoose.model('Restaraunt', Restaraunt);