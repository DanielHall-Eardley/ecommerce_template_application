const {Product} = require('../models/product')
const {User} = require('../models/user')
const errorHandler = require('../helper/errorHandler')
const checkValidationErr = require('../helper/checkValidationErr')
const aws = require('aws-sdk')

//configure aws sdk
aws.config.update({
  region: 'ca-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY
})

//retrieve all products
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

//retrieve the details of one products
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

/*This function makes a request via the aws sdk
to get a signed url for each image so that 
it can be uploaded on the client side*/
exports.s3Signatures = async (req, res, next) => {
  try {
    let s3SignatureArray;
    if(req.body.s3PhotoInfo.length > 0) {

      //Create an array of promises
      const s3PromiseArray = []
      for (let photo of req.body.s3PhotoInfo) {
        const fileName = photo.fileName
        const fileExtension = photo.fileExtension
        
        const s3Params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Expires: 60,
          ContentType: fileExtension,
          ACL: 'public-read'
        }

        const s3 = new aws.S3()
        const signedUrl = s3.getSignedUrl('putObject', s3Params)
        s3PromiseArray.push(signedUrl)
      }

      //Resolve all promises concurrently
      s3SignatureArray = await Promise.all(s3PromiseArray)
    }

    res.status(200).json({signatures: s3SignatureArray})
  } catch (error) {
    next(error)
  }
}

exports.create = async (req, res, next) => {
  try {
    checkValidationErr(req)

    const user = await User.findById(req.body.tokenUserId)
   
    if (user.type !== 'admin') {
      errorHandler(401, ['You are not authorized to create products'])
    }
    
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
    })

    if (!product) {
      errorHandler(500, ['Unable to create your product'])
    }

    product.save()
    
    res.status(200).json({
      product: product,
    })
  } catch (error) {
    next(error)
  }
}

exports.update = async (req, res, next) => {
  try {
    checkValidationErr(req)

    const user = await User.findById(req.body.tokenUserId)

    if (user.type !== 'admin') {
      errorHandler(401, ['You are not authorized to update products'])
    }
    
    const product = await Product.findById(req.body.productId)
    
    if (!product) {
      errorHandler(500, ['Unable to find product'])
    }

    product.name = req.body.name
    product.price = req.body.price
    product.specialPrice = req.body.specialPrice
    product.description = req.body.description
    product.photoArray = [...product.photoArray, ...req.body.photoArray]
    product.specifications = req.body.specificationArray
  
    const savedProduct = await product.save()
    if (!savedProduct) {
      errorHandler(500, ['Unable to create your product'])
    }
    
    res.status(200).json({
      product: savedProduct,
    })
  } catch (error) {
    next(error)
  }
}

exports.delete = async (req, res, next) => {
  try {
    const userId = req.body.userId
    const productId = req.body.productId

    const user = await User.findById(userId)

    if (user.type !== 'admin') {
      errorHandler(401, ['You are not authorized to remove this product'])
    }

    const deleteResponse = await Product.deleteOne({_id: productId})
    
    if (deleteResponse.deletedCount === 0) {
      errorHandler('There was a problem deleting the product')
    }

    res.status(200).json({msg: 'Product deleted!'})
  } catch (error) {
    next(error)
  }
}


