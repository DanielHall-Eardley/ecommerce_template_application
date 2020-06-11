const express = require('express')
const app = express()
const path = require('path')

const Easypost = require('@easypost/api')
const api = new Easypost('EZTK9ac803df43c946479ebe8e43c56cf836v7SbRH70kJCmWRB57yl2qA')
const mongoose = require('mongoose')
const generateRates = require('./helper/generateRates')
const stripe = require('./helper/stripe')
const env = require('dotenv')
const fileUpload = require("express-fileupload")

const adminRoutes = require('./routes/adminRoutes')
const checkoutRoutes = require('./routes/checkoutRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const result = env.config()
if (result.error) {
  throw result.error
}

app.use('/images', express.static(path.join(__dirname, 'images')))

const webhookSecret = 'whsec_YFqJxLEijotEPDOgl0xPMD1ltUjuK0SJ'
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
  //buy postage and print label

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

app.use((error, req, res, next) => {
  console.log(error)
  const status = error.status || 500
  const messages = error.messages || 'An Error occurred'
  res.status(200).json({error: messages, status: status})
})

const fromAddress = {
  street1: '3226 Redpath Circle',
  city: 'Mississauga',
  state: 'Ontario',
  country: 'CA',
  zip: 'L5N8R2'
}

const toAddress = {
  street1: '65 High Park Avenue',
  street2: 'apt 401',
  city: 'Etobicoke',
  state: 'Ontario',
  country: 'CA',
  zip: 'M6P2R7'
}

const parcel = {
  predefined_package: 'FlatRateEnvelope',
  weight: 10,
}

const getRates = generateRates(fromAddress, toAddress, parcel, api)

mongoose.connect('mongodb://localhost:27017/ecommerce')
.then(result => {
  app.listen(8000)
})