const router = require('express').Router()
const isAuth = require('../middleware/isAuth')
const orderController = require('../controllers/orderController')

router.get('/summary/:id', isAuth, orderController.getSummary)

router.get('/list/:id', isAuth, orderController.list)

router.post('/create', isAuth, orderController.create)

router.post('/update', isAuth, orderController.update)

router.post('/postage-label', isAuth, orderController.getLabels)

router.put('/fulfill', isAuth, orderController.fulfill)

module.exports = router