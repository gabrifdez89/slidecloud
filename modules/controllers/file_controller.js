var models = require('../models/models.js'),
	filesMapper = require('../dto/dtoMappers/filesMapper.js'),
	fileSystemHandler = require('../fileSystem/fileSystemHandler.js'),
	usersHandler = require('../persistence/usersHandler.js'),
	filesHandler = require('../persistence/filesHandler.js'),
	mime = require('mime');

// GET /users/:user/files
exports.files = function (req, res, next) {
	usersHandler.getUserByUserName(req.params.user, function (user) {
		if(user) {
			filesHandler.getFilesByUserId(user.id, function (files) {
				var dtos = filesMapper.mapFilesToDtos(files);
				res.status(200).send(dtos);
			});
		} else {
			res.status(404).send('User not found');
		}
	});
};

//POST /users/:user/files
exports.create = function (req, res, next) {
 	filesHandler.userHasSomeFileWithName(req.params.user, req.body.data, function () {
 		fileSystemHandler.deleteUploadedFiles(req.files, function () {
 			res.status(400).send('User already have some files with those names');
 		}, function (error) {
 			console.log('Error removing uploaded files. Some of them have not been erased.');
 			res.status(400).send('User already have some files with those names');
 		});
 	}, function () {
	 	fileSystemHandler.moveFilesToTree(req.files, req.body.data, req.params.user, function () {
	 		usersHandler.getUserByUserName(req.params.user, function (user) {
	 			if(user) {
		 			filesHandler.createFiles(req.body.data, user, function (files) {
		 				filesHandler.saveFiles(files, function (savedFiles) {
				 			res.status(201).send();
		 				}, function (error) {
		 					console.log('Error persisting files');
				 			res.status(500).send();
		 				});
		 			});
		 		} else {
		 			console.log('Unable to find user');
		 			res.status(404).send('User not found');
		 		}
	 		});
	 	}, function (error) {
	 		console.log('Error moving files');
		 	res.status(500).send();
	 	});
	});
};

//DELETE /users/:user/files/:fileId
exports.delete = function (req, res, next) {
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
};

//GET /users/:user/files/:fileId
exports.get = function (req, res, next) {
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