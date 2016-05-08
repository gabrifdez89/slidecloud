var usersHandler = require('../persistence/usersHandler.js'),
	jwt = require('jsonwebtoken'),
	fs = require('fs'),
	config = getConfig('config.json'),
	secret;

try{
	secret = config.secret;
} catch (error) {
	secret = 'nosecret';
	console.log('secret is not defined.')
}

exports.post = post;
exports.verifyToken = verifyToken;

function getConfig (file) {
	var filepath;
	try {
		filepath = __dirname + '/../../' + file;
		return readJsonFileSync(filepath);
	} catch (error) {
		console.log('config.json file is not defined. You need to define it to store the secret.');
	}
};

function readJsonFileSync(filepath, encoding) {
	var file;
	if (typeof (encoding) == 'undefined') {
		encoding = 'utf8';
	}
	file = fs.readFileSync(filepath, encoding);
	return JSON.parse(file);
};

/*.**/
function post (req, res, next) {
	var callbackArgument = {res: res, req: req};

	usersHandler.getUserByUserName(req.body.username,
		onGetUserByUserNameFailed.bind(callbackArgument),
		checkAuthenticationAndValidation.bind(callbackArgument));
};

function onGetUserByUserNameFailed (error) {
	this.res.status(500).send('Error looking for that user');
};

function checkAuthenticationAndValidation (user) {
	if(!user) {
		this.res.status(404).send('User not found.');
	} else {
		if (!user.validated) {
			this.res.status(401).send('User account is not validated.');
		} else if(this.req.body.pass !== user.pass) {
			this.res.status(401).send('Authentication failed. Wrong password.');
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
function verifyToken (token, username, errorCallback, callback) {
	var callbackArgument = {errorCallback: errorCallback, callback: callback, username: username};
	jwt.verify(token, secret, onTokenVerified.bind(callbackArgument));
};

function onTokenVerified (err, decoded) {
	if(err) {
		console.log('error verifying: ' + err);
		this.errorCallback(err);
	} else {
		if(decoded.username !== this.username) {
			this.callback(false);
		}

		this.callback(true);
	}
};