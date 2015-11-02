var models = require('../models/models.js'),
	fs = require('fs');

// GET /users/:user/files
exports.files = function (req, res, next) {
	models.User.find({
		where: {
			username: req.params.user
		}
	}).then(function (user) {
		if(user) {
			models.File.findAll({
				where: {
					userId: user.id
				}
			}).then(function (files) {
				if(files) {
					res.send(files);
				} else {
					next(new Error('No files for existing user'));
				}
			});
		} else {
			next(new Error('No existing user'));
		}
	}).catch(function (error) {
		next(error);
	});
};

//POST /users/:user/files
exports.create = function (req, res, next) {
	var fileNumber = 0;
	req.files.forEach(function (file) {
		var fileName = req.body.data[fileNumber];
		fs.rename('./uploads/' + file.filename, './files/' + req.params.user + '/' + fileName, function (error) {
			if(error) {
				console.log('Error moving file ' + req.body.data[fileNumber]);
			} else {
				models.User.find({
					where: {
						username: req.params.user
					}
				}).then(function (user) {
					if(user) {
						var file = models.File.build({
							name: fileName,
							path: user.username + '/' + fileName,
							UserId: user.id
						});

						file.save({
							fields: ['name', 'path', 'UserId']
						});
					} else {
						next(new Error('No existing user'));
					}
				}).catch(function (error) {
					next(error);
				});
			}
		});
		fileNumber++;
	});
    res.send();
};