const {User} = require('../models/user')
const errorHandler = require('../helper/errorHandler')
const bcrypt = require("bcrypt")
const checkValidationErr = require('../helper/checkValidationErr')

exports.signup = async (req, res, next) => {
  try {
    const checkUserType = User.findById(req.body.userId)
    if (
			process.env.FIRST_LOGIN === 'false' && 
			checkUserType.type !== 'admin'
		) {
      errorHandler(401, ['You are not authorized to create an admin account'])
    }

    checkValidationErr(req)

		const checkEmailAvailibity = await User.findOne({
			email: req.body.email
    });
    
		if (checkEmailAvailibity) {
			errorHandler(403, ["Email is not available"]);
		}

		const hashedPassword = await bcrypt.hash(req.body.password, 10)
		if(!hashedPassword) {
			errorHandler(500, ["Error saving password"])
		}

		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword,
			type: 'admin'
		})

		const savedUser = await user.save()
		if (!savedUser) {
			errorHandler(500, ["Unable to save user"])
		}

		res.status(200).json({message: 'Created admin profile'})

  } catch (error) {
    next(error)
  }
}
