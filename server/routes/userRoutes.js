const router = require('express').Router()
const userController = require('../controllers/userController')
const { body } = require("express-validator")

router.post('/login', userController.login)

router.post('/signup', 
[
  body("name", "Invalid title").trim().isLength({min: 3}),
  body("email", "Invalid email").normalizeEmail().isEmail(),
  body("password", "Invalid password").custom((value, {req}) => {
    if (value.length < 6) {
      throw new Error("Password length must be at least 6 characters")
    }
    return true
  }) 
], 
userController.signup)

module.exports = router