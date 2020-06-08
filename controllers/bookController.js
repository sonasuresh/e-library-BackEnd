const Book = require('../models/bookModel')
const Request = require('../models/requestModel')

const logger = require('../lib/logger')
var moment = require('moment')

async function addBook (req, res) {
  try {
    const { name, description, isbn, availableStatus, issuableStatus, price, author } = req.body
    if (typeof name === 'undefined' && typeof description === 'undefined' && typeof isbn === 'undefined' && typeof availableStatus === 'undefined' && typeof issuableStatus === 'undefined' && typeof price === 'undefined' && typeof author === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      const newBook = new Book({
        name,
        description,
        isbn,
        availableStatus,
        issuableStatus,
        price,
        author
      })
      await newBook.save((err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('Book Added to Library')
          res.status(200).send({
            success: true,
            message: 'Book Added!'
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
async function updateBook (req, res) {
  try {
    const { id, name, description, isbn, availableStatus, issuableStatus, price, author } = req.body
    if (typeof id === 'undefined' && typeof name === 'undefined' && typeof description === 'undefined' && typeof isbn === 'undefined' && typeof availableStatus === 'undefined' && typeof issuableStatus === 'undefined' && typeof price === 'undefined' && typeof author === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Book.findByIdAndUpdate(id, { $set: { name, description, isbn, availableStatus, issuableStatus, price, author } }, (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('Book Details Updated')
          res.status(200).send({
            success: true,
            message: 'Book Details Updated!'
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

async function getAllBooks (req, res) {
  try {
    await Book.find({}, (err, docs) => {
      if (err) {
        logger.error('DB Error')
        res.status(502).send({
          success: false,
          message: 'DB Error'
        })
      } else {
        logger.info('Retrived All Books')
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
async function getBook (req, res) {
  try {
    const { bookId } = req.params
    if (typeof bookId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Book.findById(bookId, async (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('Retrived a Book')
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
async function deleteBook (req, res) {
  try {
    const { bookId } = req.params
    if (typeof bookId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Book.findByIdAndDelete(bookId, async (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('Book Details Has Been Removed')
          res.status(200).send({
            success: true,
            message: 'Book Details are Removed'
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
async function deleteAllBooks (req, res) {
  try {
    await Book.remove({}, async (err, docs) => {
      if (err) {
        logger.error('DB Error')
        res.status(502).send({
          success: false,
          message: 'DB Error'
        })
      } else {
        logger.info('All Book Details Has Been Removed')
        res.status(200).send({
          success: true,
          message: 'All Books are Removed'
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

async function getHistoryBooks (req, res) {
  try {
    const { userId } = req.params
    if (typeof userId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Request.aggregate([
        { $match: { userId: userId, issueRequestStatus: true, returnRequestStatus: true, showHistory: true } },
        { $addFields: { bookId: { $toObjectId: '$bookId' } } },
        {
          $lookup: {
            from: 'books',
            localField: 'bookId',
            foreignField: '_id',
            as: 'books'
          }
        },
        { $unwind: '$books' }
      ]).exec((err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(500).send({
            success: false,
            message: 'DB Error'
          })
        } else if (docs) {
          logger.info('Retrived History Books of a User')
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

async function getOverallHistory (req, res) {
  try {
    await Request.aggregate([
      { $match: { issueRequestStatus: true, returnRequestStatus: true } },
      { $addFields: { bookId: { $toObjectId: '$bookId' } } },
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'books'
        }
      },
      { $unwind: '$books' },
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
      if (err) {
        logger.error('DB Error')
        res.status(500).send({
          success: false,
          message: 'DB Error'
        })
      } else if (docs) {
        logger.info('Retrived History Books of All Users')
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
async function getCurrentBooks (req, res) {
  try {
    const { userId } = req.params
    if (typeof userId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Request.aggregate([
        { $match: { userId: userId, issueRequestStatus: true, returnRequestStatus: null, returnRequestDate: null } },
        { $addFields: { bookId: { $toObjectId: '$bookId' } } },
        {
          $lookup: {
            from: 'books',
            localField: 'bookId',
            foreignField: '_id',
            as: 'books'
          }
        },
        { $unwind: '$books' }
      ]).exec((err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(500).send({
            success: false,
            message: 'DB Error'
          })
        } else if (docs) {
          logger.info('Retrived Current Books of a User')
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

async function getRequestedBooks (req, res) {
  try {
    const { userId } = req.params
    if (typeof userId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Request.aggregate([
        { $match: { userId: userId, issueRequestStatus: null } },
        { $addFields: { bookId: { $toObjectId: '$bookId' } } },
        {
          $lookup: {
            from: 'books',
            localField: 'bookId',
            foreignField: '_id',
            as: 'books'
          }
        },
        { $unwind: '$books' }
      ]).exec((err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(500).send({
            success: false,
            message: 'DB Error'
          })
        } else if (docs) {
          logger.info('Retrived Requested Books of a User')
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

async function getReturnRequestedBooks (req, res) {
  try {
    const { userId } = req.params
    if (typeof userId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Request.aggregate([
        { $match: { userId: userId, issueRequestStatus: true, returnRequestStatus: null } },
        { $addFields: { bookId: { $toObjectId: '$bookId' } } },
        {
          $lookup: {
            from: 'books',
            localField: 'bookId',
            foreignField: '_id',
            as: 'books'
          }
        },
        { $unwind: '$books' }
      ]).exec((err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(500).send({
            success: false,
            message: 'DB Error'
          })
        } else if (docs) {
          logger.info('Retrived Requested Books of a User')
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

async function processIssueRequest (req, res) {
  try {
    const { requestId, status } = req.body
    console.log(requestId)
    if (typeof requestId === 'undefined' && typeof status === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Request.findById(requestId, async (err, requestdocs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else if (requestdocs) {
          console.log(requestdocs)

          var ObjectId = require('mongoose').Types.ObjectId

          await Request.aggregate([
            { $match: { _id: ObjectId(requestId) } },
            { $addFields: { userId: { $toObjectId: '$userId' } } },
            {
              $lookup: {
                from: 'userdetails',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
              }
            },
            { $unwind: '$user' }

          ]).exec(async (err, docs) => {
            if (err) {
              logger.error('DB Error')
              res.status(502).send({
                success: false,
                message: 'DB Error'
              })
            } else {
              console.log(docs)
              var CurrentDate = moment().format()
              var notificationTime = moment(CurrentDate).add(docs[0].user.readingHours, 'hours').format('YYYY-MM-DD hh:mm:ss')
              await Request.findByIdAndUpdate(requestId, { $set: { remainder: notificationTime } }, async (err, docs) => {
                if (err) {
                  logger.error(err)
                  res.status(502).send({
                    success: false,
                    message: 'DB Error'
                  })
                } else {
                  await Request.findByIdAndUpdate(requestId, { $set: { issueRequestStatus: status } }, { new: true }, async (err, updatedRequestdocs) => {
                    if (err) {
                      logger.error('DB Error')
                      res.status(502).send({
                        success: false,
                        message: 'DB Error'
                      })
                    } else if (updatedRequestdocs) {
                      if (updatedRequestdocs.issueRequestStatus === false) {
                        await Book.findByIdAndUpdate(updatedRequestdocs.bookId, { $set: { availableStatus: true } }, { new: true }, (err, docs) => {
                          if (err) {
                            logger.error('DB Error')
                            res.status(502).send({
                              success: false,
                              message: 'DB Error'
                            })
                          } else if (docs) {
                            logger.info('Admin Processed the Issue Request')
                            res.status(200).send({
                              success: true,
                              message: 'Request Processed!'
                            })
                          } else {
                            logger.info('Failed to update available status of book after processing the request!')
                            res.status(200).send({
                              success: true,
                              message: 'Failed to Process Request!'
                            })
                          }
                        })
                      } else {
                        logger.info('Admin Processed the Issue Request')
                        res.status(200).send({
                          success: true,
                          message: 'Request Processed!'
                        })
                      }
                    }
                  })
                }
              })
            }
          })
        } else {
          logger.error('Invalid RequestId')
          res.status(500).send({
            success: false,
            message: 'Invalid Request Id'
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

async function processReturnRequest (req, res) {
  try {
    const { requestId, status } = req.body
    if (typeof requestId === 'undefined' && typeof status === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Request.findById(requestId, async (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else if (docs) {
          await Request.findByIdAndUpdate(requestId, { $set: { returnRequestStatus: status } }, { new: true }, async (err, docs) => {
            if (err) {
              logger.error('DB Error')
              res.status(502).send({
                success: false,
                message: 'DB Error'
              })
            } else if (docs) {
              if (docs.returnRequestStatus === true) {
                await Book.findByIdAndUpdate(docs.bookId, { $set: { availableStatus: true } }, { new: true }, (err, docs) => {
                  if (err) {
                    logger.error('DB Error')
                    res.status(502).send({
                      success: false,
                      message: 'DB Error'
                    })
                  } else if (docs) {
                    logger.info('Admin Processed the Return Request')
                    res.status(200).send({
                      success: true,
                      message: 'Request Processed!'
                    })
                  } else {
                    logger.info('Failed to update available status of book after processing the request!')
                    res.status(200).send({
                      success: true,
                      message: 'Failed to Process Request!'
                    })
                  }
                })
              } else {
                logger.info('Admin Processed the Return Request')
                res.status(200).send({
                  success: true,
                  message: 'Request Processed!'
                })
              }
            }
          })
        } else {
          logger.error('Invalid RequestId')
          res.status(500).send({
            success: false,
            message: 'Invalid Request Id'
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

async function deleteHistory (req, res) {
  try {
    const { userId } = req.params
    console.log(userId)
    if (typeof userId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Request.updateMany({ userId: userId }, { $set: { showHistory: false } }, (err, docs) => {
        console.log(docs)
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('User Deleted his/her History')
          res.status(200).send({
            success: true,
            message: 'History Deleted!'
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
async function deleteParticularHistory (req, res) {
  try {
    const { userId, requestId } = req.params
    if (typeof userId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Request.findOneAndUpdate({ userId: userId, _id: requestId }, { $set: { showHistory: false } }, (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('User Deleted his/her History')
          res.status(200).send({
            success: true,
            message: 'History Deleted!'
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

async function sendIssueRequest (req, res) {
  try {
    var today = new Date()
    var dd = today.getDate()
    var mm = today.getMonth() + 1 // January is 0
    var yyyy = today.getFullYear()
    today = yyyy + '-' + mm + '-' + dd
    const { userId, bookId, type } = req.body
    if (typeof userId === 'undefined' && typeof bookId === 'undefined' && typeof type === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Book.find({ _id: bookId }, async (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else if (docs.length > 0) {
          await Book.find({ _id: bookId }, async (err, docs) => {
            if (err) {
              logger.error('DB Error')
              res.status(502).send({
                success: false,
                message: 'DB Error'
              })
            } else if (docs.length > 0) {
              await Book.find({ _id: bookId, availableStatus: true }, async (err, docs) => {
                if (err) {
                  logger.error('DB Error')
                  res.status(502).send({
                    success: false,
                    message: 'DB Error'
                  })
                } else if (docs.length > 0) {
                  const newRequest = new Request({
                    userId,
                    bookId,
                    type,
                    issueRequestDate: today
                  })
                  await newRequest.save(async (err, docs) => {
                    if (err) {
                      logger.error('DB Error')
                      res.status(502).send({
                        success: false,
                        message: 'DB Error'
                      })
                    } else {
                      await Book.findOneAndUpdate({ _id: bookId }, { $set: { availableStatus: false } }, (err, docs) => {
                        if (err) {
                          logger.error('DB Error')
                          res.status(502).send({
                            success: false,
                            message: 'DB Error'
                          })
                        } else {
                          logger.info('Request for issusing a Book Sent Successfully!')
                          res.status(200).send({
                            success: true,
                            message: 'Request Sent Successfully!'
                          })
                        }
                      })
                    }
                  })
                } else {
                  logger.info('Attempt to sent issue request for a Book which is Already Issued By someother!')
                  res.status(403).send({
                    success: false,
                    message: 'This book is Not Available!Issued By Someone!'
                  })
                }
              })
            }
          })
        } else {
          logger.error('Attempt to send issue request of a book which is not Present')
          res.status(404).send({
            success: false,
            message: 'Book Not Exists!!'
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
async function sendReturnRequest (req, res) {
  try {
    var today = new Date()
    var dd = today.getDate()
    var mm = today.getMonth() + 1 // January is 0
    var yyyy = today.getFullYear()
    today = yyyy + '-' + mm + '-' + dd
    const { userId, bookId, requestId } = req.body
    if (typeof userId === 'undefined' && typeof bookId === 'undefined' && typeof requestId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Book.findById(bookId, async (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else if (docs) {
          await Request.findById(requestId, async (err, docs) => {
            if (err) {
              logger.error('DB Error')
              res.status(502).send({

                success: false,
                message: 'DB Error'
              })
            } else if (docs) {
              await Request.find({ _id: requestId, returnRequestDate: null }, async (err, docs) => {
                if (err) {
                  logger.error('DB Error')
                  res.status(502).send({

                    success: false,
                    message: 'DB Error'
                  })
                } else if (docs.length > 0) {
                  console.log(today)
                  await Request.findOneAndUpdate({ _id: requestId }, { $set: { returnRequestDate: today } }, (err, docs) => {
                    if (err) {
                      logger.error('DB Error')
                      res.status(502).send({

                        success: false,
                        message: 'DB Error'
                      })
                    } else {
                      logger.info('Request for returning a Book Sent Successfully!')
                      res.status(200).send({
                        success: true,
                        message: 'Request Sent Successfully!'
                      })
                    }
                  })
                } else {
                  logger.warn('Attempt to send return request again!')
                  res.status(200).send({
                    success: true,
                    message: 'Request Sent Successfully!'
                  })
                }
              })
            } else {
              logger.error('Attempt to send return request of a book which is not Issued')
              res.status(404).send({
                success: false,
                message: 'You have to issue a book to send a return request!!!'
              })
            }
          })
        } else {
          logger.error('Attempt to send return request of a book which is not Present')
          res.status(404).send({
            success: false,
            message: 'Book Not Exists!!'
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

async function updateAvailablity (req, res) {
  try {
    const { bookId, status } = req.params
    if (typeof bookId === 'undefined' && typeof status === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Book.findByIdAndUpdate(bookId, { $set: { availableStatus: status } }, (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('Availablity Status Updated')
          res.status(200).send({
            success: true,
            message: 'Availablity Status Updated'
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

async function getBookByName (req, res) {
  try {
    const { name } = req.params
    if (typeof name === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Book.find({ name: { $regex: name, $options: 'i' } }, async (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('Retrived a Book by Name')
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
async function updateIssuableStatus (req, res) {
  try {
    const { bookId, status } = req.params
    if (typeof bookId === 'undefined' && typeof status === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Book.findByIdAndUpdate(bookId, { $set: { issuableStatus: status } }, (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('Issuable Status Updated')
          res.status(200).send({
            success: true,
            message: 'Issuable Status Updated'
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

async function getIssuableAndNonIssuableBooks (req, res) {
  try {
    const { status } = req.params
    if (typeof status === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Book.find({ issuableStatus: status }, async (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('Retrived based on type (Issuable/NonIssuable)')
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

async function getIssueRequests (req, res) {
  try {
    await Request.aggregate([
      { $match: { issueRequestStatus: null, returnRequestStatus: null, returnRequestDate: null } },
      { $addFields: { userId: { $toObjectId: '$userId' } } },
      {
        $lookup: {
          from: 'userdetails',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { issueRequestStatus: null, returnRequestStatus: null, returnRequestDate: null } },
      { $addFields: { bookId: { $toObjectId: '$bookId' } } },
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'books'
        }
      },
      { $unwind: '$books' }

    ]).exec((err, docs) => {
      if (err) {
        logger.error('DB Error')
        res.status(502).send({
          success: false,
          message: 'DB Error'
        })
      } else {
        logger.info('Retrived based Issue Requests!')
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

async function getReturnRequests (req, res) {
  try {
    await Request.aggregate([
      { $match: { issueRequestStatus: true, returnRequestDate: { $ne: null } } },
      { $addFields: { userId: { $toObjectId: '$userId' } } },
      {
        $lookup: {
          from: 'userdetails',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { issueRequestStatus: true, returnRequestStatus: null } },
      { $addFields: { bookId: { $toObjectId: '$bookId' } } },
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'books'
        }
      },
      { $unwind: '$books' }

    ]).exec((err, docs) => {
      if (err) {
        logger.error('DB Error')
        res.status(502).send({
          success: false,
          message: 'DB Error'
        })
      } else {
        logger.info('Retrived Return Requests!')
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
module.exports = {
  addBook,
  getAllBooks,
  getBook,
  deleteBook,
  deleteAllBooks,
  updateAvailablity,
  updateIssuableStatus,
  getBookByName,
  getIssuableAndNonIssuableBooks,
  getHistoryBooks,
  getCurrentBooks,
  getRequestedBooks,
  processIssueRequest,
  deleteHistory,
  sendIssueRequest,
  sendReturnRequest,
  getIssueRequests,
  getReturnRequests,
  processReturnRequest,
  getReturnRequestedBooks,
  deleteParticularHistory,
  getOverallHistory,
  updateBook
}
