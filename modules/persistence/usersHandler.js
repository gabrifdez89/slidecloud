var models = require('../models/models.js');

exports.getUserByUserName = function (userName, callback) {
	models.User.find({
		where: {
			username: userName
		}
	}).then(function (user) {
		callback(user);
	});
};