exports.createValidationEmail = createValidationEmail;

function createValidationEmail (emailAddress, username) {
	return {
		from: '"Slide Cloud" <slidecloudwebapp@gmail.com>',
		to: emailAddress,
		subject: 'Slide Cloud account validation',
		text: 'Hello ' + username + ' !!'
	};
};