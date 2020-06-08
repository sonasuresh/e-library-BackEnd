const router = require('express').Router()
const bookController = require('../controllers/bookController.js')
const middleware = require('../middleware/tokenValidation')

router.post('/', middleware.isTokenPresent, bookController.addBook)
router.get('/search/:name', middleware.isTokenPresent, bookController.getBookByName)
router.put('/', middleware.isTokenPresent, bookController.updateBook)
router.get('/type/:status', middleware.isTokenPresent, bookController.getIssuableAndNonIssuableBooks)
router.get('/:bookId', middleware.isTokenPresent, bookController.getBook)
router.get('/', middleware.isTokenPresent, bookController.getAllBooks)
router.delete('/:bookId', middleware.isTokenPresent, bookController.deleteBook)
router.delete('/', middleware.isTokenPresent, bookController.deleteAllBooks)
router.put('/issuestatus/:bookId/:status', middleware.isTokenPresent, bookController.updateIssuableStatus)
router.put('/request/return', middleware.isTokenPresent, bookController.sendReturnRequest)
router.put('/request/processissue', middleware.isTokenPresent, bookController.processIssueRequest)
router.put('/request/processreturn', middleware.isTokenPresent, bookController.processReturnRequest)
router.put('/:bookId/:status', middleware.isTokenPresent, bookController.updateAvailablity)

router.get('/request/issue', middleware.isTokenPresent, bookController.getIssueRequests)
router.get('/request/return', middleware.isTokenPresent, bookController.getReturnRequests)
router.get('/admin/history', middleware.isTokenPresent, bookController.getOverallHistory)

router.post('/request/issue', middleware.isTokenPresent, bookController.sendIssueRequest)

router.get('/user/history/:userId', middleware.isTokenPresent, bookController.getHistoryBooks)

router.get('/user/current/:userId', middleware.isTokenPresent, bookController.getCurrentBooks)
router.get('/user/requested/return/:userId', middleware.isTokenPresent, bookController.getReturnRequestedBooks)
router.get('/user/requested/:userId', middleware.isTokenPresent, bookController.getRequestedBooks)

router.delete('/request/:requestId/:userId', middleware.isTokenPresent, bookController.deleteParticularHistory)
router.delete('/request/:userId', middleware.isTokenPresent, bookController.deleteHistory)

module.exports = router
