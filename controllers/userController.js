const User = require('../models/userModel')
const Creds = require('../models/credentialModel')
const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs')

const logger = require('../lib/logger')

async function login (req, res) {
  try {
    const { email, password } = req.body
    console.log(req.body)
    if (typeof email === 'undefined' && typeof password === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Creds.findOne({ email: email }, (err, credsdocs) => {
        if (err) {
          logger.error(err)
          res.status(502).send({
            success: false,
            message: 'Db Error'

          })
        } else if (!credsdocs) {
          logger.warn('Attempt to login with no entry.!')
          res.status(204).send({
            success: true,
            message: 'No matches'
          })
        } else {
          var membershipValidFlag
          User.findOne({ email: email }, (err, docs) => {
            var moment = require('moment')
            var startDate = moment(docs.membershipStart)
            var endDate = moment(docs.membershipEnd)
            var current = new Date()

            if ((current > startDate) && (current < endDate)) {
              membershipValidFlag = true
            } else {
              membershipValidFlag = false
            }
            if (err) {
              logger.error(err)
              res.status(502).send({
                success: false,
                message: 'Db Error'

              })
            } else {
              if (!docs) {
                logger.warn('Attempt to login with no entry.!')
                res.status(204).send({
                  success: true,
                  message: 'No matches'
                })
              } else {
                if (docs.activeStatus === true) {
                  bcrypt.compare(password, credsdocs.password, (err, isMatch) => {
                    if (err) {
                      logger.error(err)
                      res.status(502).send({
                        success: false,
                        message: 'Db Error'

                      })
                    } else if (isMatch) {
                      jwt.sign({ docs }, 'secret', (err, token) => {
                        if (err) {
                          logger.error(err)
                          res.status(502).send({
                            success: false,
                            message: 'Db Error'

                          })
                        } else {
                          logger.info('Log In Success!')
                          res.status(200).send({
                            success: true,
                            _id: docs._id,
                            userId: credsdocs.userId,
                            name: docs.name,
                            role: credsdocs.role,
                            jwttoken: token,
                            membershipValidFlag: membershipValidFlag
                          })
                        }
                      })
                    } else {
                      logger.warn('Login Attempt With Wrong Password')
                      res.status(400).send({
                        success: false,
                        message: 'Wrong Password!'
                      })
                    }
                  })
                } else {
                  logger.warn('Login Attempt of inactive User')
                  res.status(403).send({
                    success: false,
                    message: 'User Inactive!Login Failed!'
                  })
                }
              }
            }
          })
        }
      })
    }
  } catch (error) {
    logger.error(error.message)
    res.status(500).send({
      success: false,
      message: error.message
    })
  }
}

async function addUser (req, res) {
  const { name, dob, mobile, membershipStart, membershipEnd, readingHours, activeStatus, email, city } = req.body
  try {
    if (typeof email === 'undefined' && typeof name === 'undefined' && typeof dob === 'undefined' && typeof membershipStart === 'undefined' && typeof membershipEnd === 'undefined' && typeof readingHours === 'undefined' && typeof activeStatus === 'undefined' && typeof city === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await User.find({ email: email }, async (err, docs) => {
        if (err) {
          logger.error(err)
          res.status(502).send({
            success: false,
            message: 'Db Error'

          })
        }
        if (docs.length > 0) {
          logger.error('User with same email Name Taken')
          res.status(403).send({
            success: false,
            message: 'User With Same email has already registered!'

          })
        } else {
          const newUser = new User({
            name,
            dob,
            membershipStart,
            membershipEnd,
            readingHours,
            activeStatus,
            mobile,
            city,
            email
          })
          await newUser.save((err, docs) => {
            if (err) {
              logger.error('DB Error')
              res.status(502).send({
                success: false,
                message: 'DB Error'
              })
            } else {
              const salt = 10
              const password = mobile.slice(5) + dob.slice(8)
              bcrypt.hash(password, salt, async (err, hash) => {
                if (err) {
                  logger.error('DB Error')
                  res.status(502).send({
                    success: false,
                    message: 'DB Error'
                  })
                } else {
                  const newCreds = new Creds({
                    userId: docs._id,
                    email,
                    password: hash
                  })
                  await newCreds.save((err, docs) => {
                    if (err) {
                      logger.error('DB Error')
                      res.status(502).send({
                        success: false,
                        message: 'DB Error'
                      })
                    } else {
                      logger.info('User Created')
                      res.status(200).send({
                        success: true,
                        message: 'User Created!'
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  } catch (error) {
    logger.error(error.message)
    res.status(500).send({
      success: false,
      message: error.message
    })
  }
}

async function getAllUsers (req, res) {
  try {
    await Creds.aggregate([
      { $match: { role: 'USER' } },
      { $addFields: { userId: { $toObjectId: '$userId' } } },
      {
        $lookup: {
          from: 'userdetails',
          localField: 'userId',
          foreignField: '_id',
          as: 'users'
        }
      },
      { $unwind: '$users' }
    ]).exec((err, docs) => {
      console.log(docs)
      if (err) {
        logger.error('DB Error')
        res.status(502).send({
          success: false,
          message: 'DB Error'
        })
      } else {
        logger.info('Retrived All Users')
        res.status(200).send({
          success: true,
          message: docs
        })
      }
    })
  } catch (error) {
    logger.error(error.message)
    res.status(500).send({
      success: false,
      message: error.message
    })
  }
}

async function getUserDetails (req, res) {
  try {
    const { userId } = req.params
    if (typeof userId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await User.findById(userId, (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('Retrived User Details')
          res.status(200).send({
            success: true,
            message: docs
          })
        }
      })
    }
  } catch (error) {
    logger.error(error.message)
    res.status(500).send({
      success: false,
      message: error.message
    })
  }
}

async function deleteUser (req, res) {
  try {
    const { userId } = req.params
    if (typeof userId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await User.findByIdAndDelete(userId, async (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('User Details Has Been Deleted From User Details')
          await Creds.findOneAndDelete({ userId: userId }, (err, docs) => {
            if (err) {
              logger.error('DB Error')
              res.status(502).send({
                success: false,
                message: 'DB Error'
              })
            } else {
              logger.info('User Details Has Been Deleted From Creds')
              res.status(200).send({
                success: true,
                message: 'User Deleted'
              })
            }
          })
        }
      })
    }
  } catch (error) {
    logger.error(error.message)
    res.status(500).send({
      success: false,
      message: error.message
    })
  }
}
async function deleteAllUsers (req, res) {
  try {
    await User.remove({}, async (err, docs) => {
      if (err) {
        logger.error('DB Error')
        res.status(502).send({
          success: false,
          message: 'DB Error'
        })
      } else {
        await Creds.remove({ role: { $ne: 'ADMIN' } }, (err, docs) => {
          if (err) {
            logger.error('DB Error')
            res.status(502).send({
              success: false,
              message: 'DB Error'
            })
          } else {
            logger.info('All User Details Has Been Deleted')
            res.status(200).send({
              success: true,
              message: 'All Users Deleted'
            })
          }
        })
      }
    })
  } catch (error) {
    logger.error(error.message)
    res.status(500).send({
      success: false,
      message: error.message
    })
  }
}

async function toggleActiveStatus (req, res) {
  try {
    const { userId, status } = req.params
    if (typeof userId === 'undefined' && typeof status === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await User.findByIdAndUpdate(userId, { $set: { activeStatus: status } }, (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('Active Status Updated')
          res.status(200).send({
            success: true,
            message: 'Active Status Updated'
          })
        }
      })
    }
  } catch (error) {
    logger.error(error.message)
    res.status(500).send({
      success: false,
      message: error.message
    })
  }
}
module.exports = {
  getAllUsers,
  getUserDetails,
  addUser,
  login,
  deleteAllUsers,
  deleteUser,
  toggleActiveStatus
}
