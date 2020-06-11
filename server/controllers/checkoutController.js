const generatePaymentIntent = require('../helper/generatePaymentIntent')
const stripe = require('../helper/stripe')

exports.paymentCreate = async (req, res, next) => {
  const amount = req.body.amount
  const currency = req.body.currency
  const paymentIntent = await generatePaymentIntent(amount, currency, stripe)
  res.status(200).json({clientSecret: paymentIntent.client_secret})
}