var authController = require('../controllers/auth_controller.js'),
	filesHandler = require('../persistence/filesHandler.js'),
	presentationsHandler = require('../persistence/presentationsHandler.js'),
	presentationLinkGenerator = require('../presentations/presentationLinkGenerator');

exports.startPresentation = startPresentation; /* POST /users/:user/files/:fileId/startpresentation **/

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
	filesHandler.getFileById(req.params.fileId,
		onGetFileByIdFailed.bind(callbackArgument),
		checkFileBelongsToUser.bind(callbackArgument));
};

function onGetFileByIdFailed (error) {
	this.res.status(404).send('File not found');
};

function checkFileBelongsToUser (file) {
	var callbackArgument = {req: this.req, res: this.res};
	fileshandler.userHasSomeFileWithName(req.params.user, [file.name],
		onUserHasSomeFileWithNameFailed.bind(callbackArgument),
		createPresentation.bind(callbackArgument));
};

function onUserHasSomeFileWithNameFailed (error) {
	this.res.status(404).send('Not existing file for current user');
};

function createPresentation () {
	//Crear instancia de presentation con referencia al fichero req.params.fileId y persistir
	var callbackArgument = {req: this.req, res: this.res};
	presentationsHandler.createPresentationForFileId(req.params.fileId,
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
	var link = presentationLinkGenerator.generateLink(presentation);
	this.res.status(200).send(link);
};