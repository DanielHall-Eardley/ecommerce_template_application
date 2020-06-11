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
   
    const photoUrlArray = []
    if (req.files.photos && !Array.isArray(req.files.photos)) {
      const uploadPhoto = req.files.photos
      uploadPhoto.mv('./images/' + uploadPhoto.name, error => {
        if (error) {
          errorHandler(500, ['Unable to upload your photo'])
        }
      })
      photoUrlArray.push('/images/' + uploadPhoto.name)
    }

    if (req.files.photos && Array.isArray(req.files.photos)) {
      const uploadPhotos = req.files.photos
      uploadPhotos.forEach(photo => {
        photo.mv('./images/' + photo.name, error => {
          if (error) {
            errorHandler(500, ['Unable to upload your photo'])
          }
        })
        photoUrlArray.push('/images/' + photo.name)
      })
    }

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      specialPrice: req.body.specialPrice,
      description: req.body.description,
      photoArray: photoUrlArray,
      specifications: req.body.specificationArray,
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


