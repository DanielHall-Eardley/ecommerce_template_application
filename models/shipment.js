const {Schema} = require('mongoose')
const RateSchema = require('./rate')

const ShipmentSchema = Schema({
  shipmentId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  rates: [
    RateSchema
  ],
  selectedRateId: {
    type: String,
    default: null
  },
  postageLabel: {
    type: String,
    default: null
  }
})

module.exports = ShipmentSchema