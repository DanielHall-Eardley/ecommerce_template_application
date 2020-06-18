const {model, Schema} = require('mongoose')
const {ProductSchema} = require('./product')
const ShipmentSchema = require('./shipment')

const OrderSchema = Schema({
  destination: {
    type: Object,
  },
  returnAddress: {
    type: Object,
  },
  customerAddress: Object,
  products: [
    ProductSchema
  ],
  customerId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  count: {
    type: Number,
    required: true,
    default: 0
  },
  addressConfirmed: {
    type: Boolean,
    required: true,
    default: false, 
  },
  postageConfirmed: {
    type: Boolean,
    required: true,
    default: false,
  },
  payment: {
    type: Boolean,
    required: true,
    default: false,
  },
  paymentId: String,
  fulfilled: {
    type: Boolean,
    required: true,
    default: false,
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
  },
  postageTotal: {
    type: Number,
    required: true,
    default: 0
  },
  shipments: [
    ShipmentSchema
  ], 
  selectLowestRate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

module.exports = model('Order', OrderSchema)