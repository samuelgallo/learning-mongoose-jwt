const mongoose = require('../db');

const Profile = new mongoose.Schema({
  firstName: {type: String, required: true, trim: true,  default: ''},
  lastName: {type: String, required: true, trim: true, default: ''},
  age: {type: Number, default: 0},
  team: {type: String, trim: true, default: ''},
  position: {type: String, trim: true, default: ''}

})

module.exports = mongoose.model('Profile', Profile)
