const { validationResult } = require("express-validator")
const errorHandler = require("./errorHandler")

const checkForValidationErr = req => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.errors)
    const errorMessages = errors.errors.map(err => {
      return err.msg
    })

    errorHandler(422, errorMessages);
  }
} 

module.exports = checkForValidationErr