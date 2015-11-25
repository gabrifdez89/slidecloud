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
				var token = jwt.sign(user, secret, {
					expiresInMinutes: 1440
				});
				res.status(200).send(token);
			}
		}
	});
};