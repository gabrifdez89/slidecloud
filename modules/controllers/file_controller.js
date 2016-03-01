var models = require('../models/models.js'),
	filesMapper = require('../dto/dtoMappers/filesMapper.js'),
	fileSystemHandler = require('../fileSystem/fileSystemHandler.js'),
	usersHandler = require('../persistence/usersHandler.js'),
	filesHandler = require('../persistence/filesHandler.js'),
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
		var verify = authController.verifyToken(req.headers['token'], req.params.user);
		if(verify === false) {
			res.status(401).send('Provided token is not valid for this action');
		} else {
			usersHandler.getUserByUserName(req.params.user, getFilesByUserId.bind({res: res}));
		}
	}
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
		var verify = authController.verifyToken(req.headers['token'], req.params.user);
		if(verify === false) {
			res.status(401).send('Provided token is not valid for this action');
		} else {
			var callbackArgument = {res: res, req: req};
		 	filesHandler.userHasSomeFileWithName(req.params.user, req.body.data,
		 		undoChanges.bind(callbackArgument),
		 		checkAndCreate.bind(callbackArgument));
		}
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
		undoChanges.bind(callbackArgument);
	} else {
		proceedCreateFile.bind(callbackArgument);
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
	usersHandler.getUserByUserName(this.req.params.user,
		createFiles.bind({req: this.req, res: this.res}));
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
		var verify = authController.verifyToken(req.headers['token'], req.params.user);
		if(verify === false) {
			res.status(401).send('Provided token is not valid for this action');
		} else {
			var callbackArgument = {req: req, res: res};
			filesHandler.getFileById(req.params.fileId,
				onGetFileByIdFailed.bind(callbackArgument),
				deleteFile.bind(callbackArgument));
		}
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
	filesHandler.getFileById(req.params.fileId,
		onGetFileByIdFailed.bind(callbackArgument),
		getFile.bind(callbackArgument));
};

function getFile (file) {
	if(!file) {
		this.res.status(404).send('File not found');
	} else {
		var callbackArgument = {req: this.req, res: this.res};
		fileSystemHandler.getFile(file,
			onGetFileFailed.bind(callbackArgument),
			sendFile.bind(callbackArgument));
	}
};

function sendFile (f) {
	this.res.setHeader('Content-Length', f.length);
	this.res.setHeader('Content-disposition', 'attachment; filename="' + file.name + '"');
	this.res.setHeader('Content-Type', mime.lookup(file.name));
	this.res.write(f, 'binary');
	this.res.status(200).end();
};

function onGetFileFailed (error) {
	this.res.status(404).send('File not found in file system');
};