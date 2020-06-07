const mongoose = require('mongoose')

const CredentialSchema = mongoose.Schema({
  userId: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: 'USER'
  }
})

module.exports = mongoose.model('Creds', CredentialSchema)
