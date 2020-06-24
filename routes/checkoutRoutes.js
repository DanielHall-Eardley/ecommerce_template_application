const router = require('express').Router()
const checkoutController = require('../controllers/checkoutController')
const isAuth = require('../middleware/isAuth')

router.get('/summary/:orderId/:userId', isAuth, checkoutController.getCheckoutSummary)

router.post('/postage-rates', isAuth, checkoutController.getPostageRates)

router.post('/confirm/postage-rates', isAuth, checkoutController.confirmPostageRates)

router.put('/confirm/payment', isAuth, checkoutController.confirmPayment)

router.put('/remove-product', isAuth, checkoutController.removeProduct)

router.delete('/cancel-order', isAuth, checkoutController.cancelOrder)

module.exports = router