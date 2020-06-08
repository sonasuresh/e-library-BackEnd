const mongoose = require('mongoose')

const NotificationSchema = mongoose.Schema({
  userId: String,
  message: String,
  time: Date
})
module.exports = mongoose.model('NotificationDetail', NotificationSchema)
