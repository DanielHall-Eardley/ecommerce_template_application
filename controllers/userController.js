const errorHandler = require('../helper/errorHandler')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {User} = require('../models/user')
const checkValidationErr = require('../helper/checkValidationErr')
const {add, format} = require('date-fns')

/*This function signs up customer users */
exports.signup = async (req, res, next) => {
  try {
		// if (process.env.FIRST_LOGIN === 'true') {
		// 	return res.redirect(307, '/admin/signup')
		// }

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
			type: 'customer'
		})

		const savedUser = await user.save()
		if (!savedUser) {
			errorHandler(500, ["Unable to save user"])
		}

		res.status(200).json({message: 'Created your profile!'})

  } catch (error) {
    next(error)
  }
}

/*This function logs in users by creating a JWT token, which can
be susquently used access protected resources. A expiration date is also
created to inform the client if the JWT token has expired or not*/
exports.login = async (req, res, next) => {
	try {
		const findUser = await User.findOne({email: req.body.email})
		if (!findUser) {
			errorHandler(404, ["No user associated with " + req.body.email])
		}
		
		const confirmedPassword = await bcrypt.compare(req.body.password, findUser.password)
		if (!confirmedPassword) {
			errorHandler(401, ["There was a problem verifying your password"])
		}

		const token = jwt.sign({
			userId: findUser._id,
		}, process.env.JWT_SECRET, {expiresIn: "24h"})
		const expiration = format(add(new Date(), {days: 1}), "T")
	
		res.status(200).json({ 
			user: {
				token: token, 
				userId: findUser._id.toString(),
				name: findUser.name,
				type: findUser.type,
				tokenExpiration: expiration
			},
		});

	} catch (error) {
    next(error);
	}
}