var models = require('../models/models.js'),
	filesMapper = require('../dto/dtoMappers/filesMapper.js'),
	fileSystemHandler = require('../fileSystem/fileSystemHandler.js'),
	usersHandler = require('../persistence/usersHandler.js'),
	filesHandler = require('../persistence/filesHandler.js'),
	presentationsHandler = require('../persistence/presentationsHandler.js'),
	mime = require('mime'),
	authController = require('../controllers/auth_controller.js');

exports.files = files; // GET /users/:user/files
exports.create = create; //POST /users/:user/files
exports.delete = deleteFn; //DELETE /users/:user/files/:fileId
exports.get = get; //GET /users/:user/files/:fileId


/* GET /users/:user/files **/
function files (req, res, next) {
	if(!req.headers['token']) {
		res.status(401).send('You need to provide a token for that action');
	} else {
		var callbackArgument = {req: req, res: res};

		authController.verifyToken(req.headers['token'], req.params.user,
			onVerifyTokenFailed.bind(callbackArgument),
			getUserByUserNameAndGetFiles.bind(callbackArgument));
	}
};

function onVerifyTokenFailed (error) {
	this.res.status(500).send('Error verifying token');
};

function getUserByUserNameAndGetFiles (verifiedToken) {
	if (!verifiedToken) {
		res.status(401).send('Provided token is not valid for this action');
	} else {
		var callbackArgument = {req: this.req, res: this.res};
		usersHandler.getUserByUserName(this.req.params.user,
			onGetUserByUserNameFailed.bind(callbackArgument),
			getFilesByUserId.bind(callbackArgument));
	}
};

function onGetUserByUserNameFailed (error) {
	this.res.status(404).send('User not found');
};

function getFilesByUserId (user) {
	if(!user) {
		res.status(404).send('User not found');
	} else {
		var callbackArgument = {res: this.res, req: this.req};
		filesHandler.getFilesByUserId(user.id, onGetFilesByUserIdFailed.bind(callbackArgument) , mapFilesToDtos.bind(callbackArgument));
	}
};

function onGetFilesByUserIdFailed () {
	console.log('Error getting files by user id');
	this.res.status(500).send();
};

function mapFilesToDtos (files) {
	var dtos = filesMapper.mapFilesToDtos(files);
	this.res.status(200).send(dtos);
};

/* POST /users/:user/files **/
function create (req, res, next) {
	if(!req.headers['token']) {
		res.status(401).send('You need to provide a token for that action');
	} else {
		var callbackArgument = {res: res, req: req};

		authController.verifyToken(req.headers['token'], req.params.user,
			onVerifyTokenFailed.bind(callbackArgument),
			checkUserHasSomeFileWithName.bind(callbackArgument));
	}
};

function checkUserHasSomeFileWithName (verifiedToken) {
	if(!verifiedToken) {
		this.res.status(401).send('Provided token is not valid for this action');
	} else {
		var callbackArgument = {res: this.res, req: this.req};
	 	
	 	filesHandler.userHasSomeFileWithName(this.req.params.user, this.req.body.data,
	 		undoChanges.bind(callbackArgument),
	 		checkAndCreate.bind(callbackArgument));
	}
};

function undoChanges () {
	var callbackArgument = {res: this.res, req: this.req};

	fileSystemHandler.deleteUploadedFiles(this.req.files,
		onDeleteUploadedFilesFailed.bind(callbackArgument),
		onDeleteUploadedFilesSucceeded.bind(callbackArgument));
};

function checkAndCreate (hasSomeFileWithName) {
	var callbackArgument = {res: this.res, req: this.req};

	if(!hasSomeFileWithName) {
		proceedCreateFile.bind(callbackArgument)();
	} else {
		undoChanges.bind(callbackArgument)();
	}
};

function onDeleteUploadedFilesSucceeded () {
	this.res.status(400).send('User already have some files with those names');
};

function onDeleteUploadedFilesFailed (error) {
	this.res.status(400).send('User already have some files with those names');
};

function onErrorMovingFiles (error) {
	console.log('Error moving files');
	this.res.status(500).send();
};

function proceedCreateFile () {
	var callbackArgument = {req: this.req, res: this.res};

	fileSystemHandler.moveFilesToTree(this.req.files, this.req.body.data, this.req.params.user,
		onMoveFilesToTreeFailed.bind(callbackArgument),
		getUserByUserName.bind(callbackArgument));
};

function onMoveFilesToTreeFailed (error) {
	this.res.status(500).send();
};

function getUserByUserName () {
	var callbackArgument = {req: this.req, res: this.res};

	usersHandler.getUserByUserName(this.req.params.user,
		onGetUserByUserNameFailed.bind(callbackArgument),
		createFiles.bind(callbackArgument));
};

function createFiles (user) {
	if(!user) {
		console.log('Unable to find user');
		this.res.status(404).send('User not found');
	} else {
		var callbackArgument = {req: this.req, res: this.res};

		filesHandler.createFiles(this.req.body.data, user,
			onCreateFilesFailed.bind(callbackArgument),
			saveFiles.bind(callbackArgument));
	}
};

function onCreateFilesFailed (error) {
	console.log('Error creating files: ' + error);
	this.res.status(500).send('Internal error creating the files');
};

function saveFiles (files) {
	var callbackArgument = {req: this.req, res: this.res};

	filesHandler.saveFiles(files,
		onSaveFilesFailed.bind(callbackArgument),
		onSaveFilesSucceded.bind(callbackArgument));
};

function onSaveFilesSucceded (savedFiles) {
	this.res.status(201).send();
};

function onSaveFilesFailed (error) {
	console.log('Error persisting files');
	this.res.status(500).send();
};

/* DELETE /users/:user/files/:fileId **/
function deleteFn (req, res, next) {
	if(!req.headers['token']) {
		res.status(401).send('You need to provide a token for that action');
	} else {
		var callbackArgument = {req: req, res: res};

		authController.verifyToken(req.headers['token'], req.params.user,
			onVerifyTokenFailed.bind(callbackArgument),
			getFileByIdAndDeleteIt.bind(callbackArgument));
	}
};

function getFileByIdAndDeleteIt (verifiedToken) {
	if(!verifiedToken) {
		this.res.status(401).send('Provided token is not valid for this action');
	} else {
		var callbackArgument = {req: this.req, res: this.res};

		filesHandler.getFileById(this.req.params.fileId,
			onGetFileByIdFailed.bind(callbackArgument),
			deleteFile.bind(callbackArgument));
	}
};

function deleteFile (file) {
	if(!file) {
		this.res.status(404).send('File not found');
	} else {
		var callbackArgument = {req: this.req, res: this.res};
		fileSystemHandler.deleteFile(file,
			onDeleteFileFailed.bind(callbackArgument),
			deleteFileFromDataBase.bind(callbackArgument));
	}
};

function deleteFileFromDataBase (file) {
	var callbackArgument = {req: this.req, res: this.res};
	filesHandler.deleteFile(file,
		onDeleteFileFromDataBaseFailed.bind(callbackArgument),
		onDeleteFileFromDataBaseSucceded.bind(callbackArgument));
};

function onDeleteFileFromDataBaseSucceded () {
	this.res.status(200).send('File deleted');
};

function onDeleteFileFromDataBaseFailed (error) {
	this.res.status(500).send('Error deleting file');
};

function onDeleteFileFailed (error) {
	this.res.status(404).send('File not found in file system');
};

function onGetFileByIdFailed () {
	this.res.status(500).send('Error finding file');
};

/* GET /users/:user/files/:fileId **/
function get (req, res, next) {
	var callbackArgument = {req: req, res: res};
	if(!req.query.token) {
		presentationsHandler.checkIfThereIsAPresentationForFileId(req.params.fileId,
			onCheckIfThereIsAPresentationFailed.bind(callbackArgument),
			getFileByIdWithoutToken.bind(callbackArgument));
	} else {
		authController.verifyToken(req.query.token, req.params.user,
			onVerifyTokenFailed.bind(callbackArgument),
			getFileById.bind(callbackArgument));
	}
};

function onCheckIfThereIsAPresentationFailed () {
	res.status(401).send('You need to provide a token for that action');
};

function getFileByIdWithoutToken (presentations) {
	console.log('Presentations: ' + presentations);
	if(presentations.length > 0)
	{
		var callbackArgument = {req: this.req, res: this.res};

		filesHandler.getFileById(this.req.params.fileId,
				onGetFileByIdFailed.bind(callbackArgument),
				getFile.bind(callbackArgument));
	} else {
		this.res.status(404).send('No existing presentation for file');
	}
};

function getFileById (verifiedToken) {
	if(!verifiedToken) {
		this.res.status(401).send('Invalid token');
	} else {
		var callbackArgument = {req: this.req, res: this.res};

		filesHandler.getFileById(this.req.params.fileId,
			onGetFileByIdFailed.bind(callbackArgument),
			getFile.bind(callbackArgument));
	}
};

function getFile (file) {
	if(!file) {
		this.res.status(404).send('File not found');
	} else {
		var callbackArgument = {req: this.req, res: this.res, file: file};
		fileSystemHandler.getFile(file,
			onGetFileFailed.bind(callbackArgument),
			sendFile.bind(callbackArgument));
	}
};

function sendFile (f) {
	this.res.setHeader('Content-Length', f.length);
	this.res.setHeader('Content-disposition', 'attachment; filename="' + this.file.name + '"');
	this.res.setHeader('Content-Type', mime.lookup(this.file.name));
	this.res.write(f, 'binary');
	this.res.status(200).end();
};

function onGetFileFailed (error) {
	this.res.status(404).send('File not found in file system');
};