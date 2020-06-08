const Notification = require('../models/notificationModel')
const Request = require('../models/requestModel')

const logger = require('../lib/logger')

var CronJob = require('cron').CronJob

var job = new CronJob('*/30 * * * *', function () {
  sendNotification()
}, null, true, 'America/Los_Angeles')
job.start()
async function sendNotification () {
  try {
    await Request.find({ returnRequestStatus: null }, (err, docs) => {
      if (err) {
        logger.error('DB Error')
      } else {
        docs.map(async (doc, index) => {
          if (doc.type === 'day') {
            var remainder = doc.remainder
            var d1 = new Date()
            var d2 = new Date(remainder)
            var diff = (d1.getTime() - d2.getTime()) / 1000
            diff /= (60 * 60)
            if (Math.abs(Math.round(diff)) === 1) {
              await Request.aggregate([
                { $match: { userId: doc.userId, bookId: doc.bookId } },
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
              ]).exec(async (err, bookdocs) => {
                if (err) {
                  logger.error('DB Error')
                } else {
                  const newNotification = new Notification({
                    userId: doc.userId,
                    message: `Your Reading hours is going to be completed in a hour!Return ${bookdocs[0].books.name} as soon as possible!`,
                    time: new Date()
                  })
                  await Request.findById(bookdocs[0]._id, async (err, requestdocs) => {
                    if (err) {
                      logger.error('DB Error')
                    } else {
                      if (requestdocs.remainderSent == null) {
                        await newNotification.save(async (err, docs) => {
                          if (err) {
                            logger.error('DB Error')
                          } else {
                            await Request.findByIdAndUpdate(bookdocs[0]._id, { $set: { remainderSent: true } }, (err, docs) => {
                              if (err) {
                                logger.error('DB Error in updating remainder Notification Sent!')
                              } else {
                                logger.info('Remainder Notification Flag Updated')
                              }
                            })
                            logger.info('Notification Send Successfully!')
                          }
                        })
                      }
                    }
                  })
                }
              })
            }
          }
        })
      }
    })
  } catch (error) {
    logger.error(error.message)
  }
}

async function getNotifications (req, res) {
  try {
    const { userId } = req.params
    if (typeof userId === 'undefined') {
      logger.error('Bad Request!')
      res.status(400).send({
        success: false,
        message: 'Bad Request!'
      })
    } else {
      await Notification.find({ userId: userId }, (err, docs) => {
        if (err) {
          logger.error('DB Error')
          res.status(502).send({
            success: false,
            message: 'DB Error'
          })
        } else {
          logger.info('Fetched User Notifications!')
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

module.exports = {
  getNotifications,
  sendNotification
}
