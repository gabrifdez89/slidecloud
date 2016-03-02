var nodeMailer = require('nodemailer'),
	transport = 'smtps://slidecloudwebapp%40gmail.com:slidecloudslidecloud@smtp.gmail.com';

exports.sendEmail = sendEmail;

function sendEmail (email, errorCallback, callback) {
	try{
		var callbackArgument = {errorCallback: errorCallback, callback: callback},
			transporter = nodeMailer.createTransport(transport),
			emailOptions = {
				from: email.from,
				to: email.to,
				subject: email.to,
				text: email.text,
				html: email.html
		};

		transporter.sendMail(emailOptions,
			onSendEmail.bind(callbackArgument));
	}catch(error) {
		console.log("Error creating nodemailer transporter");
		errorCallback(error);
	}
};

function onSendEmail (error, info) {
	if(error) {
		console.log('Error sending email: ' + error);
		this.errorCallback(error);
	} else {
		this.callback(info.response);
	}
};