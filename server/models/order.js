const {model, Schema} = require('mongoose')
const {ProductSchema} = require('./product')
const {UserSchema} = require('./user')

const OrderSchema = Schema({
  destination: {
    type: Object,
    required: true
  },
  returnAddress: {
    type: Object,
    required: true
  },
  products: [
    ProductSchema
  ],
  user: UserSchema,
  total: {
    type: Number,
    required: true,
    default: 0
  },
  payment: {
    type: Boolean,
    required: true,
    default: false,
  },
  fulfilled: {
    type: Boolean,
    required: true,
    default: false,
  },
}, {
  timestamps: true
})

module.exports = model('Order', OrderSchema)