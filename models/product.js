const {model, Schema} = require('mongoose')

const ProductSchema = Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  specialPrice: {
    type: Number,
    default: 0
  },
  photoArray: [String],
  description: {
    type: String,
    required: true
  },
  specifications: {
    type: Array,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  length: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
})

exports.Product = model('Product', ProductSchema)
exports.ProductSchema = ProductSchema