const Order = require('../models/order')
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const stripe = require('../helper/stripe')
const errorHandler = require('../helper/errorHandler')
const postApi = require('../helper/postApi')

exports.stripe = async (req, res,  next) => {
  const sig = req.headers['stripe-signature'];
  let paymentEvent;
  console.log('webhook fired')
  try {
    paymentEvent = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  }
  catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  res.status(200).json({received: true})
  console.log('confirmed payment', paymentEvent)
  try {
    switch (paymentEvent.type) {
      case 'payment_intent.succeeded':
        const order = await Order.findOne({paymentId: paymentEvent.id})

        for (let shipment of order.shipments) {
          const retrievedShipment = await postApi.Shipment.retrieve(shipment.shipmentId)
        
          if (order.selectLowestRate) {
            const boughtShipment = await retrievedShipment.buy(shipment.selectLowestRate(['CanadaPost'], ["First"]))
            
            if (!boughtShipment.postage_label.label_url) {
              return errorHandler(500, ['There was a problem creating the shipping label'])
            }

            order.postageLabels.push(boughtShipment.postage_label.label_url)
            continue
          }

          if (!order.selectLowestRate && shipment.selectedRateId) {
            const boughtShipment = await retrievedShipment.buy(shipment.selectedRateId)
            
            if (!boughtShipment.postage_label.label_url) {
              return errorHandler(500, ['There was a problem creating the shipping label'])
            }

            order.postageLabels.push(boughtShipment.postage_label.label_url)
            continue
          }
        }
        
        order.payment = true
        order.save()
        break
      case 'payment_intent.payment_failed':
        return errorHandler(500, ['Payment failed'])
      case 'payment_intent.canceled':
        return errorHandler(500, ['Payment canceled'])
      default:
        break
    }
  } catch (error) {
    next(error)
  }
}