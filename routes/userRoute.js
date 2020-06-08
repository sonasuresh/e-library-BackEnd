const router = require('express').Router()
const userController = require('../controllers/userController.js')
const middleware = require('../middleware/tokenValidation.js')

router.post('/login', userController.login)
router.post('/', middleware.isTokenPresent, userController.addUser)
router.put('/:userId/:status', middleware.isTokenPresent, userController.toggleActiveStatus)
router.get('/', middleware.isTokenPresent, userController.getAllUsers)
router.get('/:userId', middleware.isTokenPresent, userController.getUserDetails)
router.delete('/:userId', middleware.isTokenPresent, userController.deleteUser)
router.delete('/', middleware.isTokenPresent, userController.deleteAllUsers)

module.exports = router
