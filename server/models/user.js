const {model, Schema} = require('mongoose')

const UserSchema = Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
  }
})

exports.User = model('User', UserSchema)
exports.UserSchema = UserSchema