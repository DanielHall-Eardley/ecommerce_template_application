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
  }
})

exports.Product = model('Product', ProductSchema)
exports.ProductSchema = ProductSchema