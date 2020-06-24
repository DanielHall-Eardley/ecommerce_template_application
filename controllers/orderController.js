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
      payment: null,
      fulfilled: null
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
      payment: null,
      fulfilled: null
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
      payment: null, 
      fulfilled: null,
      _id: orderId
    })
    
    if (!order) {
      errorHandler(401, ['Order could not be found'])
    }

    if (order.addressConfirmed) {
      errorHandler(401, ['You cannot add new items once order details are finalized'])
    } 

    const product = await Product.findById(productId)

    order.products.push(product)
    order.count = order.products.length
    let total = 0

    for (let product of order.products) {
      total += product.price
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
      orderPendingPromise = Order.find({
        customerId: userId, 
        payment: {$ne: null}, 
        fulfilled: null
      })
      .sort({updatedAt: 'asc'})
      .select('-paymentId -shipments')

      orderPastPromise = Order.find({
        customerId: userId, 
        payment: {$ne: null},
        fulfilled: {$ne: null}
      })
      .sort({updatedAt: 'asc'})
      .select('-paymentId -shipments')

    } else if (user.type === 'admin') {
      orderPendingPromise = Order.find({
        fulfilled: null, payment: {$ne: null}
      })
      .sort({updatedAt: 'asc'})
      .select('-paymentId')

      orderPastPromise = Order.find({
        payment: {$ne: null},
        fulfilled: {$ne: null}
      })
      .sort({updatedAt: 'asc'})
      .select('-paymentId')
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

exports.fulfill = async (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const userId = req.body.userId
    const user = await User.findById(userId)
    let orderPendingPromise;
    let orderPastPromise;

    if (user.type === 'customer') {
      errorHandler(401, ['Customers are not permitted to modify their orders'])
    } 

    const order = await Order.findById(orderId)

    if(!order) {
      errorHandler(404, ['There was an error retrieving your order'])
    }

    if(!order.shipments[0].postageLabel) {
      errorHandler(401, ['Postage must be purchased before fulfilling your order'])
    }

    order.fulfilled = new Date()
    order.status = 'Delivery in progress'
    const updatedOrder = await order.save()

    if (!updatedOrder) {
      errorHandler(500, ['There was a problem updating your order'])
    }

    orderPendingPromise = Order.find({
      fulfilled: null, payment: {$ne: null}
    })
    .sort({updatedAt: 'asc'})
    .select('-paymentId')

    orderPastPromise = Order.find({
      payment: {$ne: null} ,
      fulfilled: {$ne: null}
    })
    .sort({updatedAt: 'asc'})
    .select('-paymentId')
    
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

exports.getLabels = async (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const userId = req.body.userId
    const user = await User.findById(userId)
    let orderPendingPromise;
    let orderPastPromise;

    if (user.type === 'customer') {
      errorHandler(401, ['Customers are not permitted to modify their orders'])
    } 

    const order = await Order.findById(orderId)

    for (let shipment of order.shipments) {
      if (shipment.postageLabel) {
        errorHandler(400, ['Postage labels for order have already been bought'])
      }

      const retrievedShipment = await postApi.Shipment.retrieve(shipment.shipmentId)
    
      if (order.selectLowestRate) {
        const boughtShipment = await retrievedShipment.buy(shipment.selectLowestRate(['CanadaPost'], ["First"]))
        
        if (!boughtShipment.postage_label.label_url) {
          return errorHandler(500, ['There was a problem creating the shipping label'])
        }

        shipment.postageLabel = boughtShipment.postage_label.label_url
      }

      if (!order.selectLowestRate && shipment.selectedRateId) {
        const boughtShipment = await retrievedShipment.buy(shipment.selectedRateId)
        
        if (!boughtShipment.postage_label.label_url) {
          return errorHandler(500, ['There was a problem creating the shipping label'])
        }

        shipment.postageLabel = boughtShipment.postage_label.label_url
      }
    }

    const updatedOrder = await order.save()

    if (!updatedOrder) {
      errorHandler(500, ['There was a problem updating your order'])
    }
    
    orderPendingPromise = Order.find({
      fulfilled: null, payment: {$ne: null}
    })
    .sort({updatedAt: 'asc'})
    .select('-paymentId')

    orderPastPromise = Order.find({
      payment: {$ne: null},
      fulfilled: {$ne: null}
    })
    .sort({updatedAt: 'asc'})
    .select('-paymentId')
    
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

