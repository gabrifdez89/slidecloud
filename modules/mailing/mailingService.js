var nodemailer = require('nodemailer'),
	mg = require('nodemailer-mailgun-transport'),
	auth = {
		auth: {
			api_key: 'key-a8bcc6e524468269028e58675478d003',
			domain: 'slidecloud.tech'
		}
	},
	nodemailerMailgun = nodemailer.createTransport(mg(auth));

exports.sendEmail = sendEmail;

function sendEmail (email, errorCallback, callback) {
	var callbackArgument = {errorCallback: errorCallback, callback: callback},
		emailOptions = {
			from: email.from,
			to: email.to,
			subject: email.to,
			text: email.text,
			html: email.html
	};
	nodemailerMailgun.sendMail(emailOptions, onSendEmail.bind(callbackArgument));
};

function onSendEmail (error, info) {
	if(error) {
		console.log('Error sending email: ' + error);
		this.errorCallback(error);
	} else {
		this.callback(info.response);
	}
};