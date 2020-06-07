const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

app.use(cors())

const PORT = process.env.PORT || 4000

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

const UserRoute = require('./routes/userRoute')
const BookRoute = require('./routes/bookRoute')

app.use('/user', UserRoute)
app.use('/book', BookRoute)

const URL = 'mongodb://127.0.0.1:27017/stackfinance'
mongoose.connect(URL, { useNewUrlParser: true, useFindAndModify: false }, (err) => {
  if (err) {
    console.log('Error while Connecting!')
  } else {
    console.log('Connected to Mongo DB')
  }
})

app.listen(PORT, () => {
  console.log('Server Started on PORT ' + PORT)
})
