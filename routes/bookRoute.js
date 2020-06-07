const router = require('express').Router()
const bookController = require('../controllers/bookController.js')
// const middleware = require('../middleware/tokenValidation')

router.post('/', bookController.addBook)
router.get('/search/:name', bookController.getBookByName)
router.put('/', bookController.updateBook)
router.get('/type/:status', bookController.getIssuableAndNonIssuableBooks)
router.get('/:bookId', bookController.getBook)
router.get('/', bookController.getAllBooks)
router.delete('/:bookId', bookController.deleteBook)
router.delete('/', bookController.deleteAllBooks)
router.put('/issuestatus/:bookId/:status', bookController.updateIssuableStatus)
router.put('/request/return', bookController.sendReturnRequest)
router.put('/request/processissue', bookController.processIssueRequest)
router.put('/request/processreturn', bookController.processReturnRequest)
router.put('/:bookId/:status', bookController.updateAvailablity)

// __________
router.get('/request/issue', bookController.getIssueRequests)// admin
router.get('/request/return', bookController.getReturnRequests)// admin
router.get('/admin/history', bookController.getOverallHistory)

// router.get('/request/:type', bookController.getAllRequests)

router.post('/request/issue', bookController.sendIssueRequest)

// user
router.get('/user/history/:userId', bookController.getHistoryBooks)

router.get('/user/current/:userId', bookController.getCurrentBooks)
router.get('/user/requested/return/:userId', bookController.getReturnRequestedBooks)
router.get('/user/requested/:userId', bookController.getRequestedBooks)

router.delete('/request/:requestId/:userId', bookController.deleteParticularHistory)
router.delete('/request/:userId', bookController.deleteHistory)

// router.put('/:userId/:status', bookController.toggleActiveStatus);
// router.get('/', userController.getAllUsers);
// router.delete('/:userId',userController.deleteUser);
// router.delete('/', userController.deleteAllUsers);

module.exports = router
