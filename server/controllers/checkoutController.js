const generatePaymentIntent = require('../helper/generatePaymentIntent')
const stripe = require('../helper/stripe')
const postApi = require('../helper/postApi')
const Order = require('../models/order')
const errorHandler = require('../helper/errorHandler')

exports.getCheckoutSummary = async (req, res, next) => {
  try {
    const orderId = req.params.orderId
    const userId = req.params.userId
    
    const order = await Order.findOne({
      _id: orderId,
      customerId: userId,
      payment: false,
      fulfilled: false
    })

    if (!order) {
      errorHandler(404, ['Your order could not be retrieved'])
    }

    res.status(200).json(order)
  } catch (error) {
    
  }
}

exports.getPostageRates = async (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const userId = req.body.userId
    
    const to = {
      verify: ['delivery'],
      street1: req.body.street,
      street2: req.body.aptUnit,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      zip: req.body.zipPostcode
    }
    
    const order = await Order.findOne({
      _id: orderId,
      customerId: userId,
      payment: false,
      fulfilled: false
    })
    
    if (!order) {
      errorHandler(404, ['Your order could not be retrieved'])
    }

    if (order.addressConfirmed) {
      errorHandler(401, ["Your address has already been confirmed"])
    }

    const from = {
      verify: ['delivery'],
      street1: '3226 Redpath Circle',
      city: 'Mississauga',
      state: 'Ontario',
      country: 'CA',
      zip: 'L5N8R2'
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
    order.shipments = shipmentArray
    const savedOrder = await order.save()
    res.status(200).json(savedOrder)
  } catch (error) {
    next(error)
  }
}

exports.confirmPostageRates = async (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const userId = req.body.userId
    const selectedRates = req.body.selectedRates
    
    const order = await Order.findOne({
      _id: orderId,
      customerId: userId,
      payment: false,
      fulfilled: false
    })
    
    if (!order) {
      errorHandler(404, ['Your order could not be retrieved'])
    }

    if (order.postageConfirmed) {
      errorHandler(401, ['Postage options have already been confirmed'])
    }

    let postageTotal = 0
    let updatedShipments
    if (!selectedRates) {
      updatedShipments = order.shipments.map(shipment => {
        let lowestRate = shipment.rates[0].fee
        let rateIndex = 0

        for (let i = 1; i < shipment.rates.length; i++) {
          if (shipment.rates[i].fee < lowestRate) {
            lowestRate = shipment.rates[i].fee
            rateIndex = i
          }
        }

        postageTotal += lowestRate
        return {
          rates: shipment.rates,
          shipmentId: shipment.shipmentId,
          productId: shipment.productId,
          productName: shipment.productName,
          selectedRateId: shipment.rates[rateIndex].rateId
        }
      })
    } else {
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

    const paymentIntent = await generatePaymentIntent(order.total, 'cad', stripe)
    order.paymentId = paymentIntent.id

    const savedOrder = await order.save()
  
    res.status(200).json({
      order:savedOrder, 
      clientSecret: paymentIntent.client_secret
    })
  } catch (error) {
    next(error)
  }
}

exports.removeProduct = async (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const userId = req.body.userId
    const productId = req.body.productId

    const order = await Order.findOne({
      _id: orderId,
      customerId: userId, 
      payment: false,
      fulfilled: false
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