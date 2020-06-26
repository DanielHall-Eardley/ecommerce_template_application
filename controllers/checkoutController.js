const generatePaymentIntent = require('../helper/generatePaymentIntent')
const stripe = require('../helper/stripe')
const postApi = require('../helper/postApi')
const Order = require('../models/order')
const errorHandler = require('../helper/errorHandler')

//Retrieve current order
exports.getCheckoutSummary = async (req, res, next) => {
  try {
    const orderId = req.params.orderId
    const userId = req.params.userId
    
    const order = await Order.findOne({
      _id: orderId,
      customerId: userId,
      payment: null,
      fulfilled: null
    })

    if (!order) {
      errorHandler(404, ['Your order could not be retrieved'])
    }

    res.status(200).json({
      order: order, 
      clientSecret: order.paymentIntentSecret
    })
  } catch (error) {
    
  }
}

/*Confirm the customer's address and generate postage rates
for all products using the Easy Post api*/
exports.getPostageRates = async (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const userId = req.body.userId
    
    const order = await Order.findOne({
      _id: orderId,
      customerId: userId,
      payment: null,
      fulfilled: null
    })
    
    if (!order) {
      errorHandler(404, ['Your order could not be retrieved'])
    }

    if (order.addressConfirmed) {
      errorHandler(401, ["Your address has already been confirmed"])
    }

    const to = {
      verify: ['delivery'],
      street1: req.body.street,
      street2: req.body.aptUnit,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      zip: req.body.zipPostcode,
      name: order.customerName,
      email: order.customerEmail,
      phone: req.body.phoneNumber
    }

    const from = {
      verify: ['delivery'],
      street1: '3226 Redpath Circle',
      city: 'Mississauga',
      state: 'Ontario',
      country: 'CA',
      zip: 'L5N8R2',
      name: 'Daniel Hall-Eardley',
      email: '350chevy8@gmail.com',
      company: 'Demo ecommerce website',
      phone: '6472681072'
    }

    const fromAddressPromise = new postApi.Address(from).save()
    const toAddressPromise = new postApi.Address(to).save()

    const results = await Promise.all([fromAddressPromise, toAddressPromise])
    const fromAddress = results[0]
    const toAddress = results[1]

    order.customerAddress = {
      addressId: toAddress.id,
      street1: toAddress.street1,
      street2: toAddress.street2,
      city: toAddress.city,
      state: toAddress.state,
      country: toAddress.country,
      zip: toAddress.zip,
    }

    order.returnAddress = {
      addressId: fromAddress.id,
      street1: fromAddress.street1,
      street2: fromAddress.street2,
      city: fromAddress.city,
      state: fromAddress.state,
      country: fromAddress.country,
      zip: fromAddress.zip,
    }
    
    if (!fromAddress.verifications.delivery.success) {
      const errorArray = fromAddress.verifications.delivery.errors.map(err => {
        return err.message
      }) 
      
      errorHandler('422', errorArray)
    }

    const shipmentArray = []
    for (let product of order.products) {
      const parcel = await new postApi.Parcel({
        length: product.length,
        height: product.height,
        width: product.width,
        weight: product.weight,
      }).save()

      const shipment = await new postApi.Shipment({
        to_address: toAddress.id,
        from_address: fromAddress.id,
        parcel: parcel
      }).save()

      if (shipment.rates.length < 1) {
        const carrierErrorMessages = shipment.messages.map(message => {
          return message.message
        })

        errorHandler(404, carrierErrorMessages)
      }

      const rateArray = shipment.rates.map(rate => {
        return {
          rateId: rate.id,
          fee: rate.rate,
          serviceName: rate.service,
          carrier: rate.carrier,
          deliveryTime: rate.est_delivery_days,
          guaranteedDeliveryTime: rate.delivery_date_guaranteed
        }
      })
      
      const shipmentObj = {
        shipmentId: shipment.id,
        productId: product._id,
        productName: product.name,
        rates: rateArray
      }

      shipmentArray.push(shipmentObj)
    }

    order.addressConfirmed = true
    order.clientPhoneNumber = req.body.phoneNumber
    order.shipments = shipmentArray
    const savedOrder = await order.save()
    res.status(200).json(savedOrder)
  } catch (error) {
    next(error)
  }
}

/*Confirm the selected postage rates, calculate the total postage
add it to the product total and create a Stripe payment intent
in preparation for payment*/
exports.confirmPostageRates = async (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const userId = req.body.userId
    const selectedRates = req.body.selectedRates
    
    const order = await Order.findOne({
      _id: orderId,
      customerId: userId,
      payment: null,
      fulfilled: null
    })
    
    if (!order) {
      errorHandler(404, ['Your order could not be retrieved'])
    }

    if (order.postageConfirmed) {
      errorHandler(401, ['Postage options have already been confirmed'])
    }

    //Save postage rate selections to database and calculate total
    let postageTotal = 0
    let updatedShipments
    if (!selectedRates) {
      order.shipments.forEach(shipment => {
        let lowestRate = shipment.rates[0].fee

        //Find cheapest postage for individual product
        for (let i = 1; i < shipment.rates.length; i++) {
          if (shipment.rates[i].fee < lowestRate) {
            lowestRate = shipment.rates[i].fee
          }
        }

        postageTotal += lowestRate
        updatedShipments = order.shipments
        order.selectLowestRate = true
      })
    } else {
      //Find the correct shipment and postage rate from database
      updatedShipments = order.shipments.map(shipment => {
        const selectedRate = selectedRates.find(obj => { 
          return obj.shipmentId.toString() === shipment.shipmentId.toString()
        })

        if (!selectedRate) {
          errorHandler(422, ['There was an error calculating postage'])
        }

        const storedRate = shipment.rates.find(rate => {
          return selectedRate.rateId.toString() === rate.rateId.toString()
        })

        postageTotal += storedRate.fee
        return {
          rates: shipment.rates,
          shipmentId: shipment.shipmentId,
          productId: shipment.productId,
          productName: shipment.productName,
          selectedRateId: storedRate.rateId
        }
      })
    }
    
    order.postageConfirmed = true
    order.shipments = updatedShipments
    order.postageTotal = Math.round((postageTotal + Number.EPSILON) * 100) / 100
    order.total = Math.round(((order.postageTotal + order.total) + Number.EPSILON) * 100) / 100

    //Generate Stripe payment intent and save the neccessary details to database
    const paymentIntent = await generatePaymentIntent(order.total, 'cad', stripe)
    order.paymentId = paymentIntent.id
    order.paymentIntentSecret = paymentIntent.client_secret
    const savedOrder = await order.save()
  
    res.status(200).json({
      order:savedOrder, 
      clientSecret: paymentIntent.client_secret
    })
  } catch (error) {
    next(error)
  }
}

/*Remove a product from the order and re-calculate the order total*/
exports.removeProduct = async (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const userId = req.body.userId
    const productId = req.body.productId

    const order = await Order.findOne({
      _id: orderId,
      customerId: userId, 
      payment: null,
      fulfilled: null
    })

    if (!order) {
      errorHandler(404, ['Your order could not be retrieved'])
    }

    if (order.postageConfirmed) {
      errorHandler(401, ['You cannot modify the order after confirming postage'])
    }

    const productIndex = order.products.findIndex(product => {
      return productId.toString() === product._id.toString()
    })

    const productArray = [
      ...order.products.slice(0, productIndex), 
      ...order.products.slice(productIndex + 1)
    ]

    order.count = productArray.length
    let total = 0

    for (let product of productArray) {
      total += product.price
    }

    const shipmentIndex = order.shipments.findIndex(shipment => {
      return shipment.productId.toString() === productId.toString()
    })

    const shipmentArray = [
      ...order.shipments.slice(0, shipmentIndex), 
      ...order.shipments.slice(shipmentIndex + 1)
    ]
    
    order.shipments = shipmentArray
    order.products = productArray
    order.total = Math.round((total + Number.EPSILON) * 100) / 100

    const savedOrder = await order.save()

    if(!savedOrder) {
      errorHandler(422, ['Unable to update your order'])
    }

    res.status(200).json(savedOrder)
  } catch (error) {
    next(error)
  }
}

/*Mark the order as payed for*/
exports.confirmPayment = async (req, res, next) => {
  try {
    const clientSecret = req.body.clientSecret
    const paymentId = req.body.paymentId
    const orderId = req.body.orderId
    
    const order = await Order.findOne({
      _id: orderId,
      paymentId: paymentId,
      paymentIntentSecret: clientSecret,
    })
    
    if (!order) {
      errorHandler(404, ['Unable to retrieve your order'])
    }

    if (order.payment) {
      errorHandler(500, ['This order has already been payed'])
    }

    order.status = 'Awaiting fulfilment'
    order.payment = new Date()
    order.paymentIntentSecret = null
    order.save()

    res.status(200).json({msg: 'Payment confirmed'})
  } catch (error) {
    next(error)
  }
}

exports.cancelOrder = async (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const userId = req.body.userId

    const deletedOrder = await Order.findOneAndDelete({ _id: orderId, customerId: userId})

    if (!deletedOrder) {
      errorHandler(500, ['There was a problem deleting your order'])
    }

    res.status(200).json({msg: 'Order removed'})
  } catch (error) {
    next(error)
  }
}