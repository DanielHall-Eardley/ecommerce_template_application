const {Product} = require('../models/product')
const errorHandler = require('../helper/errorHandler')
const checkValidationErr = require('../helper/checkValidationErr')

exports.list = async (req, res, next) => {
  try {
    const productList = await Product.find()

    if (!productList) {
      errorHandler(500, ["Unable to retrieve products"])
    }

    res.status(200).json(productList)
  } catch (error) {
    next(error)
  }
}

exports.detail = async (req, res, next) => {
  try {
    const id = req.params.id
    const product = await Product.findById(id)

    if (!product) {
      errorHandler(500, ["Unable to retrieve products"])
    }

    res.status(200).json({product: product})
  } catch (error) {
    next(error)
  }
}

exports.create = async (req, res, next) => {
  try {
    checkValidationErr(req)
   
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      specialPrice: req.body.specialPrice,
      description: req.body.description,
      photoArray: req.body.photoArray,
      specifications: req.body.specificationArray,
      weight: req.body.weight,
      height: req.body.height,
      length: req.body.length,
      width: req.body.width,
      weightUnit: req.body.weightUnit,
      measurementUnit: req.body.measurementUnit,
    })

    if (!product) {
      errorHandler(500, ['Unable to create your product'])
    }

    product.save()
    
    res.status(200).json({product: product})
  } catch (error) {
    next(error)
  }
}

exports.update = async (req, res, next) => {
  try {
    checkValidationErr(req)
    
  } catch (error) {
    next(error)
  }
}

exports.delete = async (req, res, next) => {
  try {
    
  } catch (error) {
    next(error)
  }
}


