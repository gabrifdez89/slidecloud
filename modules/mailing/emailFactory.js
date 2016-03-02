var jwt = require('jsonwebtoken'),
	secret = 'sampleSecret',
	webclientUrl = 'http://localhost:3030/#/login';

exports.createValidationEmail = createValidationEmail;

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