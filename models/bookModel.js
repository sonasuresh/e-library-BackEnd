const mongoose = require('mongoose')
const AuthorSchema = mongoose.Schema({
  name: String

})
const BookSchema = mongoose.Schema({
  name: String,
  description: String,
  isbn: String,
  availableStatus: {
    type: Boolean,
    default: true
  },
  issuableStatus: Boolean,
  price: Number,
  author: [AuthorSchema]

})

module.exports = mongoose.model('Book', BookSchema)
