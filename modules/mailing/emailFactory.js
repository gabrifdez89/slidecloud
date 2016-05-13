var jwt = require('jsonwebtoken'),
	webclientUrl = 'http://slidecloud.herokuapp.com/#/login',
	fs = require('fs'),
	config = getConfig('config.json'),
	secret;

try{
	secret = config.secret;
} catch (error) {
	secret = 'nosecret';
	console.log('secret is not defined.')
}

exports.createValidationEmail = createValidationEmail;

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

function createValidationEmail (emailAddress, username) {
	var token = signToken(username),
		validationUrl = webclientUrl + '?username=' + username + '&token=' + token,
		html = '<h1>Validate your account, ' + username + '</h1><p>Please, go to the following link to validate it: <a href="' + validationUrl + '">' + validationUrl + '</a></p>';

	return {
		from: '"Slide Cloud" <slidecloudwebapp@gmail.com>',
		to: emailAddress,
		subject: 'Slide Cloud account validation',
		html: html
	};
};

function signToken (username) {
	var tokenData = {
		username: username
	};
	return jwt.sign(tokenData, secret, {
		expiresIn: 86400
	});
};