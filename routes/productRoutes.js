const router = require('express').Router()
const productController = require('../controllers/productController')
const isAuth = require('../middleware/isAuth')
const { body } = require("express-validator")

router.get('/list', productController.list)

router.get('/detail/:id', productController.detail)

router.post(
  '/create', 
  isAuth, 
  [
    body('name', "Must be at between 4  and 40 characters").trim().isLength({min: 4, max: 40}),
    body('price', "Must be a valid decimalized number").isInt({min: 0}).isDecimal(),
    body('specialPrice', "Must be a valid decimalized number").isInt({min: 0}).isDecimal()
  ],
  productController.create
)

router.put(
  '/update', 
  isAuth, 
  [
    body('name', "Must be at between 4  and 40 characters").trim().isLength({min: 4, max: 40}),
    body('price', "Must be a valid decimalized number").isInt({min: 0}).isDecimal(),
    body('specialPrice', "Must be a valid decimalized number").isInt({min: 0}).isDecimal()
  ],
  productController.update
)

router.delete('/delete/:id', isAuth, productController.delete)

module.exports = router