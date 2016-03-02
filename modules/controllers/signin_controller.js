var usersHandler = require('../persistence/usersHandler.js');

exports.post = post;

/*.**/
function post (req, res, next) {
	var callbackArgument = {res: res, req: req};

	usersHandler.getUserByUserName(req.body.username,
		onGetUserByUserNameFailed.bind(callbackArgument),
		onGetUserByUserName.bind(callbackArgument));
};

function onGetUserByUserNameFailed (error) {
	this.res.status(500).send('Internal error finding user');
};

function onGetUserByUserName (user) {
	if(user) {
		this.res.status(401).send('Already existing user with that username');
	} else {
		var callbackArgument = {req: this.req, res: this.res};

		usersHandler.createUser(this.req.body.username, this.req.body.pass, this.req.body.email,
			onCreateUserFailed.bind(callbackArgument),
			saveUser.bind(callbackArgument));
	}
};

function onCreateUserFailed (error) {
	this.res.status(500).send('Error creating user account');
};

function saveUser (user) {
	var callbackArgument = {req: this.req, res: this.res};

	usersHandler.saveUser(user,
		onSaveUserFailed.bind(callbackArgument),
		onSaveUserSucceeded.bind(callbackArgument));
};

function onSaveUserFailed (error) {
	this.res.status(500).send('Error saving user account');
};

function onSaveUserSucceeded (user) {
	this.res.status(200).send('User account created');
};