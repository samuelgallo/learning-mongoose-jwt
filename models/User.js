const mongoose = require('../db');

const User = new mongoose.Schema({
  name: {type: String, required: true, trim: true, min: 6, max: 255},
  email: {type: String, required: true, trim: true},
  password: {type: String, required: true, max: 1024,  min: 6},
  date: {type: Date, default: Date.now}
})

module.exports = mongoose.model('User', User)