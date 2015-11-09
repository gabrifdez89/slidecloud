var models = require('../models/models.js'),
	filesMapper = require('../dto/dtoMappers/filesMapper.js'),
	fileSystemHandler = require('../fileSystem/fileSystemHandler.js'),
	usersHandler = require('../persistence/usersHandler.js'),
	filesHandler = require('../persistence/filesHandler.js');

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
};