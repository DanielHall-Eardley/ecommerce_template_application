const jwt = require("jsonwebtoken")
const errorHandler = require("../helper/errorHandler")

const isAuth = async (req, res, next) => {
  try {
    const token = req.get("Authorization")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    req.body.tokenUserId = decoded.userId
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = isAuth 