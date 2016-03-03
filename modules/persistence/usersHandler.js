var models = require('../models/models.js');

exports.getUserByUserName = getUserByUserName;
exports.getUserByEmail = getUserByEmail;
exports.createUser = createUser;
exports.saveUser = saveUser;

/*.**/
function getUserByUserName (userName, errorCallback, callback) {
	models.User.find({
		where: {
			username: userName
		}
	}).then(function (user) {
		callback(user);
	}).catch(function (error) {
		console.log('Error finding user by user name: ' + error);
		errorCallback(error);
	});
};

/*.**/
function getUserByEmail (email, errorCallback, callback) {
	models.User.find({
		where: {
			email: email
		}
	}).then(function (user) {
		callback(user);
	}).catch(function (error) {
		console.log('Error finding user by email: ' + error);
		errorCallback(error);
	});
};

/*.**/
function createUser (username, pass, email, errorCallback, callback) {
	try{
		var user = models.User.build({
			username: username,
			pass: pass,
			email: email,
			validated: false
		});
		callback(user);
	}catch(error){
		console.log('Error creating the user ' + username + ': ' + error);
		errorCallback(error);
	}
};

/*.**/
function saveUser (user, errorCallback, callback) {
	user.save({
		fields: ['username', 'pass', 'email', 'validated']
	}).then(function (savedUser) {
		callback(savedUser);
	}).catch(function (error) {
		console.log('Error saving user ' + user.username + ': ' + error);
		errorCallback(error);
	});
};