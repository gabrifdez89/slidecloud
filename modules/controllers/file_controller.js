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

// GET /users/:user/files
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
		filesHandler.getFilesByUserId(user.id, mapFilesToDtos.bind({res: this.res}));
	}
};

function mapFilesToDtos (files) {
	var dtos = filesMapper.mapFilesToDtos(files);
	this.res.status(200).send(dtos);
};

//POST /users/:user/files
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
		 		proceedCreateFile.bind(callbackArgument),
		 		onErrorMovingFiles.bind(callbackArgument));
		}
	}
};

function undoChanges () {
	var callbackArgument = {res: this.res, req: this.req};
	fileSystemHandler.deleteUploadedFiles(this.req.files,
		onDeleteUploadedFilesSucceeded.bind(callbackArgument),
		onDeleteUploadedFilesFailed.bind(callbackArgument));
};

function onDeleteUploadedFilesSucceeded () {
	this.res.status(400).send('User already have some files with those names');
};

function onDeleteUploadedFilesFailed (error) {
	console.log('Error removing uploaded files. Some of them have not been erased.');
	this.res.status(400).send('User already have some files with those names');
};

function onErrorMovingFiles (error) {
	console.log('Error moving files');
	this.res.status(500).send();
};

function proceedCreateFile () {
	fileSystemHandler.moveFilesToTree(this.req.files, this.req.body.data, this.req.params.user,
		getUserByUserName.bind({req: this.req, res: this.res}));
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
		filesHandler.createFiles(this.req.body.data, user,
			saveFiles.bind({req: this.req, res: this.res}));
	}
};

function saveFiles (files) {
	var callbackArgument = {req: this.req, res: this.res};
	filesHandler.saveFiles(files,
		onSaveFilesSucceded.bind(callbackArgument),
		onSaveFilesFailed.bind(callbackArgument));
};

function onSaveFilesSucceded (savedFiles) {
	this.res.status(201).send();
};

function onSaveFilesFailed (error) {
	console.log('Error persisting files');
	this.res.status(500).send();
};

//DELETE /users/:user/files/:fileId
function deleteFn (req, res, next) {
	if(req.headers['token']) {
		var verify = authController.verifyToken(req.headers['token'], req.params.user);
		if(verify !== false) {
			filesHandler.getFileById(req.params.fileId, function (file) {
				if(file) {
					fileSystemHandler.deleteFile(file, function(file) {
						filesHandler.deleteFile(file, function () {
							res.status(200).send('File deleted');
						}, function (error) {
							res.status(500).send('Error deleting file');
						});
					}, function (error) {
						res.status(404).send('File not found in file system');
					});
				} else {
					res.status(404).send('File not found');
				}
			}, function () {
				res.status(500).send('Error finding file');
			});
		} else {
			res.status(401).send('Provided token is not valid for this action');
		}
	} else {
		res.status(401).send('You need to provide a token for that action');
	}

};

//GET /users/:user/files/:fileId
function get (req, res, next) {
	filesHandler.getFileById(req.params.fileId, function (file) {
		if (file) {
			fileSystemHandler.getFile(file, function (f) {
				res.setHeader('Content-Length', f.length);
				res.setHeader('Content-disposition', 'attachment; filename="' + file.name + '"');
				res.setHeader('Content-Type', mime.lookup(file.name));
				res.write(f, 'binary');
				res.status(200).end();
			}, function (error) {
				res.status(404).send('File not found in file system');
			});
		} else {
			res.status(404).send('File not found');
		}
	}, function (error) {
		res.status(500).send('Error finding file');
	});
};