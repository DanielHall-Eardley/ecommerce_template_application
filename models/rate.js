const {Schema} = require('mongoose')

const RateSchema = Schema({
  rateId: {
    type: String,
    required: true
  },
  fee: {
    type: Number,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  carrier: {
    type: String,
    required: true
  },
  deliveryTime: {
    type: Number,
    required: true
  },
  guaranteedDeliveryTime: {
    type: Boolean,
    required: true
  }
})

module.exports = RateSchema