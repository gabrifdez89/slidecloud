var authController = require('../controllers/auth_controller.js'),
	filesHandler = require('../persistence/filesHandler.js'),
	presentationsHandler = require('../persistence/presentationsHandler.js'),
	presentationLinkGenerator = require('../presentations/presentationLinkGenerator');

exports.startPresentation = startPresentation; /* POST /users/:user/files/:fileId/startpresentation **/
exports.deletePresentation = deletePresentation; /* DELETE /users/:user/files/:fileId/presentation **/


/* POST /users/:user/files/:fileId/startpresentation **/
function startPresentation (req, res, next) {
	if(!req.headers['token']) {
		res.status(401).send('You need to provide a token for that action');
	} else {
		var callbackArgument = {res: res, req: req};

		authController.verifyToken(req.headers['token'], req.params.user,
			onVerifyTokenFailed.bind(callbackArgument),
			getFileById.bind(callbackArgument));
	}
};

function onVerifyTokenFailed (error) {
	this.res.status(500).send('Error verifying token');
};

function getFileById (verifiedToken) {
	var callbackArgument = {req: this.req, res: this.res};
	filesHandler.getFileById(this.req.params.fileId,
		onGetFileByIdFailed.bind(callbackArgument),
		checkFileBelongsToUser.bind(callbackArgument));
};

function onGetFileByIdFailed (error) {
	this.res.status(404).send('File not found');
};

function checkFileBelongsToUser (file) {
	var callbackArgument = {req: this.req, res: this.res};
	filesHandler.userHasSomeFileWithName(this.req.params.user, [file.name],
		onUserHasSomeFileWithNameFailed.bind(callbackArgument),
		createPresentation.bind(callbackArgument));
};

function onUserHasSomeFileWithNameFailed (error) {
	this.res.status(404).send('Not existing file for current user');
};

function createPresentation () {
	//Crear instancia de presentation con referencia al fichero req.params.fileId y persistir
	var callbackArgument = {req: this.req, res: this.res};
	presentationsHandler.createPresentationForFileId(this.req.params.fileId,
		onCreatePresentationForFileIdFailed.bind(callbackArgument),
		savePresentation.bind(callbackArgument));
};

function onCreatePresentationForFileIdFailed (error) {
	this.res.status(500).send('Internal error while creating a presentation for file');
};

function savePresentation (presentation) {
	var callbackArgument = {req: this.req, res: this.res};
	presentationsHandler.savePresentation(presentation,
		onSavePresentationFailed.bind(callbackArgument),
		generatePresentationLink.bind(callbackArgument));
};

function onSavePresentationFailed (error) {
	this.res.status(500).send('Internal error while saving the presentation');
};

function generatePresentationLink (presentation) {
	var link = presentationLinkGenerator.generateLink(presentation, this.req.params.user);
	this.res.status(200).send(link);
};

/* DELETE /users/:user/files/:fileId/presentation **/
function deletePresentation (req, res, next) {
	if(!req.headers['token']) {
		res.status(401).send('You need to provide a token for that action');
	} else {
		var callbackArgument = {res: res, req: req};

		authController.verifyToken(req.headers['token'], req.params.user,
			onVerifyTokenFailed.bind(callbackArgument),
			getPresentationByFileId.bind(callbackArgument));
	}
};

function getPresentationByFileId (verifiedToken) {
	var callbackArgument = {req: this.req, res: this.res};
	presentationsHandler.getPresentationByFileId(this.req.params.fileId,
		onGetPresentationByFileIdFailed.bind(callbackArgument),
		doDeletePresentation.bind(callbackArgument));
};

function onGetPresentationByFileIdFailed (error) {
	this.res.status(500).send('Internal error finding presentation for that file');
};

function doDeletePresentation (presentations) {
	if(presentations.length > 0) {
		var callbackArgument = {req: this.req, res: this.res};
		presentationsHandler.deletePresentation(presentations[0],
			onDeletePresentationFailed.bind(callbackArgument),
			onDeletePresentationSucceeded.bind(callbackArgument));
	} else {
		this.res.status(404).send('Not found presentation for that file');
	}
};

function onDeletePresentationFailed (error) {
	this.res.status(500).send('Internal error while deleting presentation');
};

function onDeletePresentationSucceeded () {
	this.res.status(200).send('Presentation deleted');
};