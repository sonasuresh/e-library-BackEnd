const mongoose = require('mongoose')

const RequestSchema = mongoose.Schema({
  userId: String,
  bookId: String,
  issueRequestStatus: {
    type: Boolean,
    default: null
  },
  returnRequestStatus: {
    type: Boolean,
    default: null
  },
  issueRequestDate: {
    type: Date,
    default: Date.now()
  },
  returnRequestDate: {
    type: Date,
    default: null
  },
  showHistory: {
    type: Boolean,
    default: true
  },
  type: String

})

module.exports = mongoose.model('Request', RequestSchema)
