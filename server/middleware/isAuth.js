const jwt = require("jsonwebtoken")
const errorHandler = require("../helper/errorHandler")

const isAuth = async (req, res, next) => {
  try {
    const token = req.get("Authorization")
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    
    if (!verified) {
      errorHandler(401, ["Please login to continue"])
    }
    
    next()
  } catch (error) {
    if (!error.status) {
      error.status = 401;
    }

    error.messages = [error.message]
    next(error)
  }
}

module.exports = isAuth 