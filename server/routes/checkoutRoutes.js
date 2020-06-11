const router = require('express').Router()
const checkoutController = require('../controllers/checkoutController')

router.post('/create', checkoutController.paymentCreate)

module.exports = router