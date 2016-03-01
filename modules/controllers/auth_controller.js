var usersHandler = require('../persistence/usersHandler.js'),
	jwt = require('jsonwebtoken'),
	secret = 'sampleSecret';

exports.post = post;
exports.verifyToken = verifyToken;

/*.**/
function post (req, res, next) {
	usersHandler.getUserByUserName(req.body.username, onGetUserByUserName.bind({res: res, req: req}));
};

function onGetUserByUserName (user) {
	if(!user) {
		this.res.status(404).send('User not found')
	} else {
		if(this.req.body.pass !== user.pass) {
			this.res.status(401).send('Authentication failed. Wrong password');
		} else {
			var token = signToken(user.username);
			this.res.status(200).send(token);
		}
	}
};

function signToken (username) {
	var tokenData = {
		username: username
	};
	return jwt.sign(tokenData, secret, {
		expiresIn: 86400
	});
};

/*.**/
function verifyToken (token, username) {
	jwt.verify(token, secret, onTokenVerified.bind({username: username}));
};

function onTokenVerified (err, decoded) {
	if(err) {
		console.log('error verifying');
		return false;
	} else {
		if(decoded.username !== this.username) {
			return false;
		}

		return decoded;
	}
};