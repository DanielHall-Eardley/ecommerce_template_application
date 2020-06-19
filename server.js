const express = require('express')
const app = express()
const path = require('path')

const env = require('dotenv')

if (process.env.USERNAME === 'daniel') {
  const result = env.config({path: __dirname + '/.env'})
  if (result.error) {
    throw result.error
  }
}

const mongoose = require('mongoose')

const adminRoutes = require('./routes/adminRoutes')
const checkoutRoutes = require('./routes/checkoutRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const webhookRoutes = require('./routes/webhookRoutes')

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use('/webhook', webhookRoutes)
app.use(express.json())

app.use('/admin', adminRoutes)
app.use('/checkout', checkoutRoutes)
app.use('/user', userRoutes)
app.use('/product', productRoutes)
app.use('/order', orderRoutes)

app.use(express.static('build'))
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build/index.html'));
})  

app.use((error, req, res, next) => {
  console.log(error)
  const status = error.status || 500
  const messages = error.messages || 'An Error occurred'
  res.status(200).json({error: messages, status: status})
})

let databaseConnect = process.env.MONGODB_URI

if (process.env.NODE_ENV === 'development') {
  databaseConnect = process.env.DATABASE_URL
}

mongoose.connect(databaseConnect, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(result => {
  let port = process.env.PORT

  if (port === null || port === undefined) {
    port = 8000
  }

  app.listen(port)
})
.catch(error => {
  console.log(error)
})