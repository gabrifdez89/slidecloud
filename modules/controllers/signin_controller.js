var usersHandler = require('../persistence/usersHandler.js'),
	mailingService = require('../mailing/mailingService.js'),
	emailFactory = require('../mailing/emailFactory.js'),
	authController = require('../controllers/auth_controller.js');

exports.post = post; /* POST /signin **/
exports.validate = validate; /* POST /validate **/

/* POST /signin **/
function post (req, res, next) {
	var callbackArgument = {res: res, req: req};

	usersHandler.getUserByUserName(req.body.username,
		onGetUserByUserNameFailed.bind(callbackArgument),
		checkUserAndEmailAreFree.bind(callbackArgument));
};

function onGetUserByUserNameFailed (error) {
	this.res.status(500).send('Internal error finding user by username');
};

function checkUserAndEmailAreFree (user) {
	if(user) {
		this.res.status(401).send('Already existing user with that username.');
	} else {
		var callbackArgument = {req: this.req, res: this.res};
		usersHandler.getUserByEmail(this.req.body.email,
			onGetUserByEmailFailed.bind(callbackArgument),
			createUser.bind(callbackArgument));
	}
};

function onGetUserByEmailFailed (error) {
	this.res.status(500).send('Internal error finding user by email');
};

function createUser(user) {
	if(user) {
		this.res.status(401).send('Already existing user with that email.');
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
		sendEmail.bind(callbackArgument));
};

function onSaveUserFailed (error) {
	this.res.status(500).send('Error saving user account');
};

function sendEmail (user) {
	var callbackArgument = {req: this.req, res: this.res},
		email = emailFactory.createValidationEmail(this.req.body.email, this.req.body.username);

	mailingService.sendEmail(email,
		onSendEmailFailed.bind(callbackArgument),
		onSendEmailSucceeded.bind(callbackArgument));
};

function onSendEmailFailed (error) {
	this.res.status(500).send('Error sending validation email');
};

function onSendEmailSucceeded (response) {
	this.res.status(200).send('User account created');
};

/* POST /validate **/
function validate (req, res, next) {
	var callbackArgument = {req: req, res: res};
	usersHandler.getUserByUserName(req.body.username,
		onGetUserByUserNameFailed.bind(callbackArgument),
		verifyToken.bind(callbackArgument));
};

function verifyToken (user) {
	var callbackArgument = {req: this.req, res: this.res},
		verified = authController.verifyToken(this.req.body.token, this.req.body.username);

	if(verified === false) {
		this.res.status(401).send('Provided token does not authorize to this action');
	} else {
		validateAccountAndSave.bind(callbackArgument)(user);
	}
};

function validateAccountAndSave (user) {
	var callbackArgument = {req: this.req, res: this.res};
	user.validated = true;

	usersHandler.saveUser(user,
		onSaveUserFailed.bind(callbackArgument),
		onSaveUserSucceeded.bind(callbackArgument));
};

function onSaveUserFailed (error) {
	this.res.status(500).send('Error saving validated user');
};

function onSaveUserSucceeded (savedUser) {
	this.res.status(200).send('Account validated');
};