var models = require('../models/models.js');

// GET /users/:user/files
exports.files = function(req, res, next) {

	models.User.find({
		where: {
			username: req.params.user
		}
	}).then(function (user) {
		
		if(user) {
			console.log('user: ' + user.username);
			console.log('pass: ' + user.pass);
			console.log('id: ' + user.id);

			models.File.findAll({
				where: {
					userId: user.id
				}
			}).then(function (files) {
				if(files) {
					res.send(files);
					next();
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