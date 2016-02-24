var usersHandler = require('../persistence/usersHandler.js'),
	jwt = require('jsonwebtoken'),
	secret = 'sampleSecret';

exports.post = function (req, res, next) {
	usersHandler.getUserByUserName(req.body.username, function (user) {
		if(!user) {
			res.status(404).send('User not found')
		} else {
			if(req.body.pass !== user.pass) {
				res.status(401).send('Authentication failed. Wrong password');
			} else {
				var tokenData = {
						username: user.username
					},
					token = jwt.sign(tokenData, secret, {
						expiresIn: 86400
					});
				res.status(200).send(token);
			}
		}
	});
};

exports.verifyToken = function (token, username) {
	jwt.verify(token, secret, function (err, decoded) {
		if(err) {
			console.log('error verifying');
			return false;
		} else {
			if(decoded.username !== username) {
				return false;
			}

			return decoded;
		}
	});
};