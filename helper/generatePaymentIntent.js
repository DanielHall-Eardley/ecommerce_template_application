const {uuid} = require('uuidv4')

module.exports = async (amount, currency, stripe) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseInt(amount),
    currency: currency,
    metadata: {integration_check: 'accept_a_payment'},
  }, {
    idempotency_key: uuid()
  });

  return paymentIntent
} 