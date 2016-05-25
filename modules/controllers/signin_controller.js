var usersHandler = require('../persistence/usersHandler.js'),
	mailingService = require('../mailing/mailingService.js'),
	emailFactory = require('../mailing/emailFactory.js'),
	authController = require('../controllers/auth_controller.js');

exports.post = post; /* POST /signin **/
exports.validate = validate; /* POST /validate **/
exports.requestValidationEmail = requestValidationEmail; /* POST /requestvalidationemail **/

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
	var callbackArgument = {req: this.req, res: this.res, user:user};

	usersHandler.saveUser(user,
		onSaveUserFailed.bind(callbackArgument),
		sendEmail.bind(callbackArgument));
};

function onSaveUserFailed (error) {
	this.res.status(500).send('Error saving user account');
};

function sendEmail (user) {
	var callbackArgument = {req: this.req, res: this.res, user: user},
		email = emailFactory.createValidationEmail(user.email, user.username);

	mailingService.sendEmail(email,
		onSendEmailFailed.bind(callbackArgument),
		onSendEmailSucceeded.bind(callbackArgument));
};

function onSendEmailFailed (error) {
	var callbackArgument = {req: this.req, res: this.res, user: this.user};
	usersHandler.deleteUser(this.user,
		onDeleteUserFailed.bind(callbackArgument),
		onDeleteUserSucceeded.bind(callbackArgument));
};

function onDeleteUserFailed (error) {
	console.log('Error deleting user account after error sending validation email');
	this.res.status(500).send('Error sending validation email');
};

function onDeleteUserSucceeded () {
	this.res.status(500).send('Error sending validation email');
};

function onSendEmailSucceeded (response) {
	this.res.status(200).send();
};

/* POST /validate **/
function validate (req, res, next) {
	var callbackArgument = {req: req, res: res};
	usersHandler.getUserByUserName(req.body.username,
		onGetUserByUserNameFailed.bind(callbackArgument),
		verifyToken.bind(callbackArgument));
};

function verifyToken (user) {
	var callbackArgument = {req: this.req, res: this.res, user: user};

	authController.verifyToken(this.req.body.token, this.req.body.username,
		onVerifyTokenFailed.bind(callbackArgument),
		validateAccountAndSave.bind(callbackArgument));
};

function onVerifyTokenFailed (error) {
	this.res.status(401).send('Provided token does not authorize to this action');
};

function validateAccountAndSave (verifiedToken) {
	if(!verifiedToken) {
		this.res.status(401).send('Provided token does not authorize to this action');
	} else {
		var callbackArgument = {req: this.req, res: this.res};
		this.user.validated = true;

		usersHandler.saveUser(this.user,
			onSaveUserFailed.bind(callbackArgument),
			onSaveUserSucceeded.bind(callbackArgument));
	}
};

function onSaveUserFailed (error) {
	this.res.status(500).send('Error saving validated user');
};

function onSaveUserSucceeded (savedUser) {
	this.res.status(200).send('Account validated');
};

/* POST /requestvalidationemail **/
function requestValidationEmail (req, res, next) {
	var callbackArgument = {req: req, res: res};
	usersHandler.getUserByUserName(req.body.username,
		onGetUserByUserNameFailed.bind(callbackArgument),
		verifyPassAndAccountIsNotValidated.bind(callbackArgument));
};

function verifyPassAndAccountIsNotValidated (user) {
	if(user.pass !== this.req.body.pass) {
		this.res.status(401).send('Wrong password.')
	} else if(user.validated === true) {
		this.res.status(400).send('Account is already validated.')
	} else {
		var callbackArgument = {req: this.req, res: this.res};
		
		sendEmail.bind(callbackArgument)(user);
	}
};