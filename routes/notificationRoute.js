const router = require('express').Router()
const notificationController = require('../controllers/notificationController.js')
const middleware = require('../middleware/tokenValidation')

router.get('/:userId', middleware.isTokenPresent, notificationController.getNotifications)

module.exports = router
