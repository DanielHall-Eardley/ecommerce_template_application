const router = require('express').Router()
const checkoutController = require('../controller/checkoutController')

router.post('/payment/create', checkoutController.paymentCreate)

module.exports = router