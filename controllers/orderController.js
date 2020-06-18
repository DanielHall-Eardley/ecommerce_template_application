const Order = require('../models/order')
const {User} = require('../models/user')
const {Product} = require('../models/product')
const errorHandler = require('../helper/errorHandler')
const postApi = require('../helper/postApi')

exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.params.id
   
    const order = await Order.findOne({
      customerId: userId,
      payment: false,
      fulfilled:false
    })
    
    if (!order) {
      errorHandler(401, ['Unable to retrieve order'])
    }

    const summary = {
      orderId: order._id,
      count: order.count
    }

    res.status(200).json(summary)
  } catch (error) {
    next(error)
  }
}


exports.create = async (req, res, next) => {
  try {
    const userId = req.body.userId
    const productId = req.body.productId
    
    const checkForDuplicateOrder = await Order.findOne({
      customerId: userId,
      payment: false,
      fulfilled: false
    })
     
    if (checkForDuplicateOrder) {
      errorHandler(401, ['Order already exists'])
    }

    const productPromise = Product.findById(productId)
    const userPromise = User.findById(userId)

    const [product, user] = await Promise.all([productPromise, userPromise])

    const order = new Order({
      customerId: user._id,
      customerName: user.name,
      customerEmail: user.email,
      products: product,
      total: product.price,
      count: 1
    })

    const savedOrder = await order.save()
    
    if (!savedOrder) {
      errorHandler(500, ["Unable to create your order"])
    }

    const summary = {
      orderId: savedOrder._id,
      count: savedOrder.count
    }

    res.status(200).json(summary)
  } catch (error) {
    next(error)
  }
}

exports.update = async (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const userId = req.body.userId
    const productId = req.body.productId
    
    const order = await Order.findOne({
      customerId: userId, 
      payment: false, 
      fulfilled: false,
      _id: orderId
    })
    
    if (!order) {
      errorHandler(401, ['Order could not be found'])
    }

    const product = await Product.findById(productId)

    order.products.push(product)
    order.count = order.products.length
    let total = 0

    for (let product of order.products) {
      total += product.price
    }

    let shipmentObj = null
    if (order.addressConfirmed) {
      const parcel = await new postApi.Parcel({
        length: product.length,
        height: product.height,
        width: product.width,
        weight: product.weight,
      }).save()

      const shipment = await new postApi.Shipment({
        to_address: order.customerAddress.addressId,
        from_address: order.returnAddress.addressId,
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
      
      shipmentObj = {
        shipmentId: shipment.id,
        productId: product._id,
        productName: product.name,
        rates: rateArray
      }
    }
    
    if (shipmentObj) {
      order.shipments.push(shipmentObj)
    }
    order.total = Math.round((total + Number.EPSILON) * 100) / 100
    const savedOrder = await order.save()

    if (!savedOrder) {
      errorHandler(500, ["Unable to update your order"])
    }

    const summary = {
      orderId: savedOrder._id,
      count: savedOrder.count
    }

    res.status(200).json(summary)
  } catch (error) {
    next(error)
  }
}

exports.list = async (req, res, next) => {
  try {
    const userId = req.params.id
    const user = await User.findById(userId)
    let orderPendingPromise;
    let orderPastPromise;

    if (user.type === 'customer') {
      //add payment: true
      orderPendingPromise = await Order.findOne({
        customerId: userId, 
        payment: true, 
        fulfilled: false
      })
      orderPastPromise = await Order.find({
        customerId: userId, 
        payment: true,
        fulfilled: true
      })
    } else if (user.type === 'admin') {
      orderPendingPromise = await Order.find({fulfilled: false, payment: true})
      orderPastPromise = await Order.find({
        payment: true,
        fulfilled: true
      })
    }

    const [
      orderPast, 
      orderPending
    ] = await Promise.all([
      orderPastPromise, 
      orderPendingPromise
    ])
    
    res.status(200).json({
      past: orderPast,
      pending: orderPending
    })
  } catch (error) {
    next(error)
  }
}
