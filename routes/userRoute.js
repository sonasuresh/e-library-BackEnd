const router = require('express').Router()
const userController = require('../controllers/userController.js')
// const middleware = require('../middleware/tokenValidation')

router.post('/login', userController.login)
router.post('/', userController.addUser)
router.put('/:userId/:status', userController.toggleActiveStatus)
router.get('/', userController.getAllUsers)
router.get('/:userId', userController.getUserDetails)
router.delete('/:userId', userController.deleteUser)
router.delete('/', userController.deleteAllUsers)

module.exports = router
