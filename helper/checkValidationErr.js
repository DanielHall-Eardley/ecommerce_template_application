const { validationResult } = require("express-validator")
const errorHandler = require("./errorHandler")

const checkForValidationErr = req => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    const errorMessages = errors.errors.map(err => {
      return `${err.param} ${err.msg} instead received ${err.value}`
    })

    errorHandler(422, errorMessages);
  }
} 

module.exports = checkForValidationErr