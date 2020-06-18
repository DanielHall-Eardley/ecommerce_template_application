const express = require('express')
const app = express()
const path = require('path')

const env = require('dotenv')
const result = env.config({path: __dirname + '/.env'})
if (result.error) {
  throw result.error
}

const mongoose = require('mongoose')
const stripe = require('./helper/stripe')
const fileUpload = require("express-fileupload")

const adminRoutes = require('./routes/adminRoutes')
const checkoutRoutes = require('./routes/checkoutRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')

const Order = require('./models/order')

app.use('/images', express.static(path.join(__dirname, 'images')))

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res,  next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  }
  catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('confirmed payment', event)
  const order = await Order.findOne({paymentId: event.id})
  //print shipping labels for relevant orders
  res.status(200).json({received: true})
})

app.use(fileUpload({
  createParentPath: true
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use('/admin', adminRoutes)
app.use('/checkout', checkoutRoutes)
app.use('/user', userRoutes)
app.use('/product', productRoutes)
app.use('/order', orderRoutes)

app.use(express.static('../build'))
app.get('/*', function (req, res) {
  res.sendFile(path.resolve('../build/index.html'));
})  

app.use((error, req, res, next) => {
  console.log(error)
  const status = error.status || 500
  const messages = error.messages || 'An Error occurred'
  res.status(200).json({error: messages, status: status})
})

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(result => {
  app.listen(process.env.PORT)
})
.catch(error => {
  console.log(error)
})