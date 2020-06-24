const {Product} = require('../models/product')
const errorHandler = require('../helper/errorHandler')
const checkValidationErr = require('../helper/checkValidationErr')
const aws = require('aws-sdk')

aws.config.update({
  region: 'ca-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY
})

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

exports.s3Signatures = async (req, res, next) => {
  try {
    let s3SignatureArray;
    if(req.body.s3PhotoInfo.length > 0) {
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


