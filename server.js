const express = require('express')
const app = express()
const path = require('path')
const env = require('dotenv')
const mongoose = require('mongoose')
const helmet = require('helmet')

/*This is the root server component, It initializes the 
server, connects to the database, registers url routes and
serves the static assets for the front end code*/

//Load .env config file if in local development environment
if (process.env.USERNAME === 'daniel') {
  const result = env.config({path: __dirname + '/.env'})
  if (result.error) {
    throw result.error
  }
}

const adminRoutes = require('./routes/adminRoutes')
const checkoutRoutes = require('./routes/checkoutRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const webhookRoutes = require('./routes/webhookRoutes')

app.use(helmet())

//Allows cors access
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

//Server static assets
app.use(express.static('build'))
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build/index.html'));
})  

//catch all thrown errors 
app.use((error, req, res, next) => {
  console.log(error)
  const status = error.status || 500
  const messages = error.messages || 'An Error occurred'
  res.status(200).json({error: messages, status: status})
})

/*Connect to a cloud database or local database
depending on if the app is in a development or production
environment*/
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