const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  name: String,
  dob: Date,
  membershipStart: Date,
  membershipEnd: Date,
  readingHours: Number,
  activeStatus: {
    type: Boolean,
    default: true
  },
  mobile: Number,
  email: String,
  city: String
})

module.exports = mongoose.model('User', UserSchema)
