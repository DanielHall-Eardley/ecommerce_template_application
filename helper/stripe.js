const stripe = require('stripe')(process.env.STRIPE_SERVER_API_KEY)
module.exports = stripe