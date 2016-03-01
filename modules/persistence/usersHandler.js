var models = require('../models/models.js');

exports.getUserByUserName = function (userName, errorCallback, callback) {
	models.User.find({
		where: {
			username: userName
		}
	}).then(function (user) {
		callback(user);
	}).catch(function (error) {
		errorCallback(error);
	});
};